package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 公园API控制器，提供给小程序前端使用的接口
 */
@RestController
@RequestMapping("/api/park")
public class ParkApiController {
    
    @Autowired
    private ParkPoiMapper parkPoiMapper;
    
    /**
     * 获取公园兴趣点信息
     */
    @GetMapping("/pois")
    public List<ParkPoi> getParkPois() {
        return parkPoiMapper.selectList(null);
    }
} 