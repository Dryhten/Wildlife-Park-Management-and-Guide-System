package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/park-geometry")
public class ParkGeometryController {
    
    private static final Logger logger = LoggerFactory.getLogger(ParkGeometryController.class);
    
    @Autowired
    private ParkGeometryMapper parkGeometryMapper;
    
    @Autowired
    private ParkMapper parkMapper;

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/regions")
    public Map<String, Object> getParkRegions() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Map<String, Object>> regionData = new ArrayList<>();
            List<ParkGeometry> geometries = parkGeometryMapper.selectList(null);
            
            for (ParkGeometry geometry : geometries) {
                Park park = parkMapper.selectById(geometry.getParkId());
                if (park != null) {
                    Map<String, Object> region = new HashMap<>();
                    region.put("id", geometry.getId());
                    region.put("parkId", geometry.getParkId());
                    region.put("name", park.getName());
                    region.put("description", park.getBackground());
                    region.put("geometry", geometry.getGeometry());
                    region.put("features", park.getFeatures());
                    region.put("audioGuide", park.getAudioGuide());
                    regionData.add(region);
                }
            }
            
            response.put("success", true);
            response.put("data", regionData);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取园区区域失败: " + e.getMessage());
        }
        return response;
    }

//    @PostMapping("/report-location")
//    public Map<String, Object> reportLocation(@RequestBody Map<String, Object> request) {
//        Map<String, Object> response = new HashMap<>();
//        try {
//            Integer regionId = Integer.parseInt(request.get("regionId").toString());
//            Double latitude = Double.parseDouble(request.get("latitude").toString());
//            Double longitude = Double.parseDouble(request.get("longitude").toString());
//            String openid = (String) request.get("openid");
//
//            // 获取用户信息
//            User user = userMapper.selectByOpenid(openid);
//            if (user == null) {
//                response.put("success", false);
//                response.put("message", "用户不存在");
//                return response;
//            }
//
//            // 更新用户位置
//            user.setCurrentRegionId(regionId);
//            user.setLatitude(latitude);
//            user.setLongitude(longitude);
//            user.setUpdatedAt(LocalDateTime.now());
//            userMapper.updateById(user);
//
//            response.put("success", true);
//            response.put("message", "位置更新成功");
//            return response;
//        } catch (Exception e) {
//            logger.error("更新位置失败", e);
//            response.put("success", false);
//            response.put("message", "更新位置失败: " + e.getMessage());
//            return response;
//        }
//    }
} 