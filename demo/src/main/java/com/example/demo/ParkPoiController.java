package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/park-poi")
@CrossOrigin
public class ParkPoiController {
    private static final Logger logger = LoggerFactory.getLogger(ParkPoiController.class);

    @Autowired
    private ParkPoiMapper parkPoiMapper;

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/list")
    public ResponseEntity<?> getAllParkPois(@RequestParam(required = false) Integer userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 如果提供了userId，先获取用户的当前动物园ID
            Integer currentZooId = null;
            if (userId != null) {
                User user = userMapper.selectById(userId);
                if (user != null) {
                    currentZooId = user.getCurrentZooId();
                } else {
                    response.put("success", false);
                    response.put("message", "用户不存在");
                    return ResponseEntity.ok(response);
                }
            }

            // 构建查询条件
            QueryWrapper<ParkPoi> queryWrapper = new QueryWrapper<>();
            if (currentZooId != null) {
                queryWrapper.eq("zoo_id", currentZooId);
            }

            // 执行查询
            List<ParkPoi> poiList = parkPoiMapper.selectList(queryWrapper);
            
            response.put("success", true);
            response.put("data", poiList);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("获取POI列表失败", e);
            response.put("success", false);
            response.put("message", "获取POI列表失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParkPoi> getParkPoiById(@PathVariable String id) {
        ParkPoi parkPoi = parkPoiMapper.selectById(id);
        if (parkPoi != null) {
            return ResponseEntity.ok(parkPoi);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<String> createParkPoi(@RequestBody ParkPoi parkPoi) {
        parkPoiMapper.insert(parkPoi);
        return ResponseEntity.ok("POI创建成功");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateParkPoi(@PathVariable String id, @RequestBody ParkPoi parkPoi) {
        parkPoi.setId(id);
        parkPoiMapper.updateById(parkPoi);
        return ResponseEntity.ok("POI更新成功");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteParkPoi(@PathVariable String id) {
        parkPoiMapper.deleteById(id);
        return ResponseEntity.ok("POI删除成功");
    }
} 