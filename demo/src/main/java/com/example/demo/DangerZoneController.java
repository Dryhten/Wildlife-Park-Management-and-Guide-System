package com.example.demo;

import com.example.demo.DangerZone;
import com.example.demo.DangerZoneMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/danger-zone")
@CrossOrigin
public class DangerZoneController {

    @Autowired
    private DangerZoneMapper dangerZoneMapper;

    @Autowired
    private SafetyAlertMapper safetyAlertMapper;

    @PostMapping("/check")
    public ResponseEntity<?> checkLocation(@RequestBody Map<String, Object> params) {
        try {
            double latitude = Double.parseDouble(params.get("latitude").toString());
            double longitude = Double.parseDouble(params.get("longitude").toString());
            Integer userId = Integer.parseInt(params.get("userId").toString());
            
            // 获取所有生效中的危险区域
            QueryWrapper<DangerZone> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("status", 1);
            List<DangerZone> zones = dangerZoneMapper.selectList(queryWrapper);
            
            // 检查用户是否在任何危险区域内
            for (DangerZone zone : zones) {
                if (isPointInPolygon(latitude, longitude, zone.getGeometry())) {
                    // 创建或更新安全预警记录
                    handleSafetyAlert(userId, zone.getId(), "Active");
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("inDangerZone", true);
                    response.put("zoneName", zone.getName());
                    response.put("description", zone.getDescription());
                    response.put("riskLevel", zone.getRiskLevel());
                    return ResponseEntity.ok(response);
                }
            }
            
            // 如果用户不在任何危险区域内，检查并更新之前的预警状态
            updateExistingAlerts(userId);
            
            return ResponseEntity.ok(Collections.singletonMap("inDangerZone", false));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("检查位置失败: " + e.getMessage());
        }
    }

    private void handleSafetyAlert(Integer userId, Integer zoneId, String status) {
        try {
            // 查找是否存在活跃的预警记录
            QueryWrapper<SafetyAlert> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("user_id", userId)
                       .eq("zone_id", zoneId)
                       .eq("status", "Active");
            
            SafetyAlert existingAlert = safetyAlertMapper.selectOne(queryWrapper);
            
            if (existingAlert == null && "Active".equals(status)) {
                // 创建新的预警记录
                SafetyAlert alert = new SafetyAlert();
                alert.setUserId(userId);
                alert.setZoneId(zoneId);
                alert.setAlertTime(LocalDateTime.now());
                alert.setStatus("Active");
                alert.setUpdatedBy("system");
                safetyAlertMapper.insert(alert);
            } else if (existingAlert != null && "Active".equals(status)) {
                // 更新已存在的预警记录
                existingAlert.setAlertTime(LocalDateTime.now());
                existingAlert.setUpdatedAt(LocalDateTime.now());
                existingAlert.setUpdatedBy("system");
                safetyAlertMapper.updateById(existingAlert);
            }
        } catch (Exception e) {
            // 记录错误但不中断主流程
            System.err.println("处理安全预警失败: " + e.getMessage());
        }
    }

    private void updateExistingAlerts(Integer userId) {
        try {
            // 查找用户所有活跃的预警
            QueryWrapper<SafetyAlert> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("user_id", userId)
                       .eq("status", "Active");
            
            List<SafetyAlert> activeAlerts = safetyAlertMapper.selectList(queryWrapper);
            
            // 将所有活跃预警更新为已解决
            for (SafetyAlert alert : activeAlerts) {
                alert.setStatus("Resolved");
                alert.setUpdatedAt(LocalDateTime.now());
                alert.setUpdatedBy("system");
                safetyAlertMapper.updateById(alert);
            }
        } catch (Exception e) {
            System.err.println("更新安全预警状态失败: " + e.getMessage());
        }
    }

    // 判断点是否在多边形内的方法
    private boolean isPointInPolygon(double latitude, double longitude, String geometryStr) {
        try {
            List<double[]> polygon = new ArrayList<>();
            String[] coordinates = geometryStr.split(";");
            
            // 解析多边形坐标
            for (String coord : coordinates) {
                String[] latLng = coord.split(",");
                double lat = Double.parseDouble(latLng[0]);
                double lng = Double.parseDouble(latLng[1]);
                polygon.add(new double[]{lat, lng});
            }

            int i, j;
            boolean result = false;
            for (i = 0, j = polygon.size() - 1; i < polygon.size(); j = i++) {
                if ((polygon.get(i)[1] > longitude) != (polygon.get(j)[1] > longitude) &&
                    (latitude < (polygon.get(j)[0] - polygon.get(i)[0]) * (longitude - polygon.get(i)[1]) /
                    (polygon.get(j)[1] - polygon.get(i)[1]) + polygon.get(i)[0])) {
                    result = !result;
                }
            }
            return result;
        } catch (Exception e) {
            return false;
        }
    }
} 