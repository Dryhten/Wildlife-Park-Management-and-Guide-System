package com.example.demo;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/park_booking")
public class ParkBookingController {
    private static final Logger logger = LoggerFactory.getLogger(ParkBookingController.class);

    @Autowired
    private ParkBookingMapper parkBookingMapper;
    
    @Autowired
    private ParkTrafficMapper parkTrafficMapper;
    
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ParkMapper parkMapper;

    @GetMapping("/park_list")
    public Map<String, Object> getParkList(@RequestParam String openid) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 获取用户信息
            User user = userMapper.selectOne(new QueryWrapper<User>().eq("openid", openid));
            if (user == null) {
                response.put("success", false);
                response.put("message", "用户不存在");
                return response;
            }

            // 获取所有园区流量信息
            List<ParkTraffic> parkTraffics = parkTrafficMapper.selectList(null);
            
            // 获取用户的预约记录
            List<ParkBooking> userBookings = parkBookingMapper.selectList(
                new QueryWrapper<ParkBooking>()
                    .eq("user_id", user.getId())
                    .eq("status", "Pending")
            );

            // 组装返回数据
            List<Map<String, Object>> parkList = new ArrayList<>();
            for (ParkTraffic traffic : parkTraffics) {
                // 获取园区信息
                Park park = parkMapper.selectById(traffic.getParkId());
                if (park != null) {
                    Map<String, Object> parkInfo = new HashMap<>();
                    parkInfo.put("parkId", traffic.getParkId());
                    parkInfo.put("parkName", park.getName());  // 添加园区名称
                    parkInfo.put("currentPeople", traffic.getCurrentPeople());
                    parkInfo.put("queuePeople", traffic.getQueuePeople());
                    
                    // 检查用户是否已预约该园区
                    boolean isBooked = userBookings.stream()
                        .anyMatch(booking -> booking.getParkId().equals(traffic.getParkId()));
                    parkInfo.put("isBooked", isBooked);
                    
                    parkList.add(parkInfo);
                }
            }

            response.put("success", true);
            response.put("data", parkList);
            return response;

        } catch (Exception e) {
            logger.error("获取园区列表失败", e);
            response.put("success", false);
            response.put("message", "获取园区列表失败: " + e.getMessage());
            return response;
        }
    }

    @PostMapping("/book")
    public Map<String, Object> bookPark(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();
        try {
            String openid = (String) requestData.get("openid");
            Long parkId = Long.parseLong(requestData.get("parkId").toString());

            // 获取用户信息
            User user = userMapper.selectOne(new QueryWrapper<User>().eq("openid", openid));
            if (user == null) {
                response.put("success", false);
                response.put("message", "用户不存在");
                return response;
            }

            // 检查是否已预约
            ParkBooking existingBooking = parkBookingMapper.selectOne(
                new QueryWrapper<ParkBooking>()
                    .eq("user_id", user.getId())
                    .eq("park_id", parkId)
                    .eq("status", "Pending")
            );

            if (existingBooking != null) {
                response.put("success", false);
                response.put("message", "您已预约该园区");
                return response;
            }

            // 创建新预约
            ParkBooking booking = new ParkBooking();
            booking.setUserId(user.getId());
            booking.setParkId(parkId);
            booking.setStatus("Pending");
            booking.setBookingTime(LocalDateTime.now());
            
            parkBookingMapper.insert(booking);

            response.put("success", true);
            response.put("message", "预约成功");
            return response;

        } catch (Exception e) {
            logger.error("预约失败", e);
            response.put("success", false);
            response.put("message", "预约失败: " + e.getMessage());
            return response;
        }
    }

    @PostMapping("/cancel")
    public Map<String, Object> cancelBooking(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();
        try {
            String openid = (String) requestData.get("openid");
            Long parkId = Long.parseLong(requestData.get("parkId").toString());

            // 获取用户信息
            User user = userMapper.selectOne(new QueryWrapper<User>().eq("openid", openid));
            if (user == null) {
                response.put("success", false);
                response.put("message", "用户不存在");
                return response;
            }

            // 查找预约记录
            ParkBooking booking = parkBookingMapper.selectOne(
                new QueryWrapper<ParkBooking>()
                    .eq("user_id", user.getId())
                    .eq("park_id", parkId)
                    .eq("status", "Pending")
            );

            if (booking == null) {
                response.put("success", false);
                response.put("message", "未找到预约记录");
                return response;
            }

            // 更新预约状态
            booking.setStatus("Cancelled");
            parkBookingMapper.updateById(booking);

            response.put("success", true);
            response.put("message", "取消预约成功");
            return response;

        } catch (Exception e) {
            logger.error("取消预约失败", e);
            response.put("success", false);
            response.put("message", "取消预约失败: " + e.getMessage());
            return response;
        }
    }
} 