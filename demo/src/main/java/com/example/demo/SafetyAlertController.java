package com.example.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.web.bind.annotation.*;
import javax.annotation.Resource;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import com.alibaba.excel.EasyExcel;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/admin/safety_alert") // 安全预警管理接口路径
@CrossOrigin
public class SafetyAlertController {
    private static final Logger logger = LoggerFactory.getLogger(SafetyAlertController.class);

    @Resource
    private SafetyAlertMapper safetyAlertMapper;

    @Resource
    private UserMapper userMapper;

    @Resource
    private DangerZoneMapper dangerZoneMapper;

    @GetMapping("/list")
    public Map<String, Object> getSafetyAlertList(
            @RequestParam(value = "current", defaultValue = "1") Integer current,
            @RequestParam(value = "size", defaultValue = "10") Integer size,
            @RequestParam(value = "userName", required = false) String userName,
            @RequestParam(value = "dangerZoneName", required = false) String dangerZoneName
    ) {
        Map<String, Object> result = new HashMap<>();
        try {
            Page<SafetyAlert> page = new Page<>(current, size);
            QueryWrapper<SafetyAlert> queryWrapper = new QueryWrapper<>();
            
            if (userName != null && !userName.isEmpty()) {
                User user = userMapper.selectOne(new QueryWrapper<User>().eq("name", userName));
                if (user != null) {
                    queryWrapper.eq("user_id", user.getId());
                }
            }
            
            if (dangerZoneName != null && !dangerZoneName.isEmpty()) {
                DangerZone dangerZone = dangerZoneMapper.selectOne(new QueryWrapper<DangerZone>().eq("name", dangerZoneName));
                if (dangerZone != null) {
                    queryWrapper.eq("zone_id", dangerZone.getId());
                }
            }
            
            queryWrapper.orderByDesc("alert_time");
            
            Page<SafetyAlert> alertPage = safetyAlertMapper.selectPage(page, queryWrapper);
            List<SafetyAlert> alertList = alertPage.getRecords();
            
            // 获取所有用户ID和区域ID
            List<Integer> userIds = alertList.stream()
                    .map(SafetyAlert::getUserId)
                    .distinct()
                    .collect(java.util.stream.Collectors.toList());
            
            List<Integer> zoneIds = alertList.stream()
                    .map(SafetyAlert::getZoneId)
                    .distinct()
                    .collect(java.util.stream.Collectors.toList());
            
            // 批量查询用户信息
            Map<Integer, String> userNameMap = new HashMap<>();
            if (!userIds.isEmpty()) {
                List<User> users = userMapper.selectList(
                        new QueryWrapper<User>().in("id", userIds)
                );
                userNameMap = users.stream()
                        .collect(java.util.stream.Collectors.toMap(
                            User::getId, 
                            User::getName, 
                            (a, b) -> a
                        ));
            }
            
            // 批量查询危险区域信息
            Map<Integer, String> zoneNameMap = new HashMap<>();
            if (!zoneIds.isEmpty()) {
                List<DangerZone> zones = dangerZoneMapper.selectList(
                        new QueryWrapper<DangerZone>().in("id", zoneIds)
                );
                zoneNameMap = zones.stream()
                        .collect(java.util.stream.Collectors.toMap(
                            DangerZone::getId, 
                            DangerZone::getName, 
                            (a, b) -> a
                        ));
            }
            
            // 创建包含用户名称和区域名称的结果列表
            List<Map<String, Object>> records = new ArrayList<>();
            for (SafetyAlert alert : alertList) {
                Map<String, Object> alertMap = new HashMap<>();
                alertMap.put("id", alert.getId());
                alertMap.put("userId", alert.getUserId());
                alertMap.put("userName", userNameMap.getOrDefault(alert.getUserId(), "未知用户"));
                alertMap.put("zoneId", alert.getZoneId());
                alertMap.put("dangerZoneName", zoneNameMap.getOrDefault(alert.getZoneId(), "未知区域"));
                alertMap.put("alertTime", alert.getAlertTime());
                alertMap.put("status", alert.getStatus());
                alertMap.put("updatedAt", alert.getUpdatedAt());
                alertMap.put("updatedBy", alert.getUpdatedBy());
                
                records.add(alertMap);
            }
            
            result.put("records", records);
            result.put("total", alertPage.getTotal());
            result.put("success", true);
            return result;
        } catch (Exception e) {
            logger.error("获取安全预警列表失败", e);
            result.put("success", false);
            result.put("message", "获取安全预警列表失败: " + e.getMessage());
            return result;
        }
    }

    @PostMapping("/add")
    public Map<String, Object> addSafetyAlert(@RequestBody SafetyAlert alert) {
        Map<String, Object> result = new HashMap<>();
        try {
            alert.setAlertTime(LocalDateTime.now());
            alert.setUpdatedAt(LocalDateTime.now());
            alert.setUpdatedBy("system");
            safetyAlertMapper.insert(alert);
            result.put("success", true);
            result.put("message", "添加成功");
            return result;
        } catch (Exception e) {
            logger.error("添加安全预警失败", e);
            result.put("success", false);
            result.put("message", "添加安全预警失败: " + e.getMessage());
            return result;
        }
    }

    @PostMapping("/update")
    public Map<String, Object> updateSafetyAlert(@RequestBody SafetyAlert alert) {
        Map<String, Object> result = new HashMap<>();
        try {
            alert.setUpdatedAt(LocalDateTime.now());
            alert.setUpdatedBy("system");
            safetyAlertMapper.updateById(alert);
            result.put("success", true);
            result.put("message", "更新成功");
            return result;
        } catch (Exception e) {
            logger.error("更新安全预警失败", e);
            result.put("success", false);
            result.put("message", "更新安全预警失败: " + e.getMessage());
            return result;
        }
    }

    @PostMapping("/delete")
    public Map<String, Object> deleteSafetyAlert(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer id = Integer.parseInt(params.get("id").toString());
            safetyAlertMapper.deleteById(id);
            result.put("success", true);
            result.put("message", "删除成功");
            return result;
        } catch (Exception e) {
            logger.error("删除安全预警失败", e);
            result.put("success", false);
            result.put("message", "删除安全预警失败: " + e.getMessage());
            return result;
        }
    }

    @GetMapping("/download")
    public void downloadSafetyAlerts(HttpServletResponse response) {
        try {
            List<SafetyAlert> alerts = safetyAlertMapper.selectList(null);
            
            response.setContentType("application/vnd.ms-excel");
            response.setCharacterEncoding("UTF-8");
            String fileName = URLEncoder.encode("安全预警列表", "UTF-8");
            response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");
            
            EasyExcel.write(response.getOutputStream(), SafetyAlert.class)
                    .sheet("安全预警列表")
                    .doWrite(alerts);
        } catch (IOException e) {
            logger.error("下载安全预警列表失败", e);
        }
    }
}
