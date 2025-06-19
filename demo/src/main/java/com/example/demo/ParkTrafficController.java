package com.example.demo;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/park_traffic")
@CrossOrigin
public class ParkTrafficController {
    private static final Logger logger = LoggerFactory.getLogger(ParkTrafficController.class);

    @Autowired
    private ParkTrafficMapper parkTrafficMapper;

    @Autowired
    private ParkMapper parkMapper;

    @GetMapping("/list")
    public Map<String, Object> getTrafficList(@RequestParam(required = false) Long parkId) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> records = new ArrayList<>();
        
        try {
            QueryWrapper<ParkTraffic> queryWrapper = new QueryWrapper<>();
            if (parkId != null) {
                queryWrapper.eq("park_id", parkId);
            }
            List<ParkTraffic> trafficList = parkTrafficMapper.selectList(queryWrapper);
            
            for (ParkTraffic traffic : trafficList) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", traffic.getId());
                item.put("parkId", traffic.getParkId());
                item.put("currentPeople", traffic.getCurrentPeople());
                item.put("queuePeople", traffic.getQueuePeople());
                item.put("updatedAt", traffic.getUpdatedAt());
                
                // 获取园区名称
                Park park = parkMapper.selectById(traffic.getParkId());
                if (park != null) {
                    item.put("parkName", park.getName());
                } else {
                    item.put("parkName", "未知园区");
                }
                
                records.add(item);
            }
            
            result.put("records", records);
            result.put("total", records.size());
            result.put("success", true);
            return result;
        } catch (Exception e) {
            logger.error("获取园区流量失败", e);
            result.put("success", false);
            result.put("message", "获取园区流量失败: " + e.getMessage());
            return result;
        }
    }

    @PostMapping("/update")
    public Map<String, Object> updateTraffic(@RequestBody ParkTraffic parkTraffic) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 检查园区是否存在
            Park park = parkMapper.selectById(parkTraffic.getParkId());
            if (park == null) {
                result.put("success", false);
                result.put("message", "园区不存在");
                return result;
            }

            // 检查是否已存在记录
            QueryWrapper<ParkTraffic> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("park_id", parkTraffic.getParkId());
            ParkTraffic existingTraffic = parkTrafficMapper.selectOne(queryWrapper);
            
            if (existingTraffic != null) {
                // 更新现有记录
                parkTraffic.setId(existingTraffic.getId());
                parkTrafficMapper.updateById(parkTraffic);
            } else {
                // 插入新记录
                parkTrafficMapper.insert(parkTraffic);
            }
            
            result.put("success", true);
            result.put("message", "更新成功");
            return result;
        } catch (Exception e) {
            logger.error("更新园区流量失败", e);
            result.put("success", false);
            result.put("message", "更新园区流量失败: " + e.getMessage());
            return result;
        }
    }
    
    @GetMapping("/realtime")
    public Map<String, Object> getRealtimeTraffic() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Map<String, Object>> records = new ArrayList<>();
            List<ParkTraffic> trafficList = parkTrafficMapper.selectList(null);
            
            for (ParkTraffic traffic : trafficList) {
                Map<String, Object> item = new HashMap<>();
                Park park = parkMapper.selectById(traffic.getParkId());
                
                item.put("parkName", park != null ? park.getName() : "未知园区");
                item.put("currentPeople", traffic.getCurrentPeople());
                item.put("queuePeople", traffic.getQueuePeople());
                item.put("updatedAt", traffic.getUpdatedAt());
                records.add(item);
            }
            
            result.put("success", true);
            result.put("data", records);
        } catch (Exception e) {
            logger.error("获取实时园区流量失败", e);
            result.put("success", false);
            result.put("message", "获取实时园区流量失败: " + e.getMessage());
        }
        return result;
    }
} 