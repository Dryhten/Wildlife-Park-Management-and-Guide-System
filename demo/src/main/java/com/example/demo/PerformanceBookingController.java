package com.example.demo;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import javax.annotation.Resource;
import java.util.List;
import java.time.LocalDateTime;
import com.alibaba.excel.EasyExcel;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Serializable;
import java.net.URLEncoder;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/performance_booking") // 表演预订管理接口路径
public class PerformanceBookingController {
    private static final Logger logger = LoggerFactory.getLogger(PerformanceBookingController.class);

    @Resource
    private PerformanceBookingMapper performanceBookingMapper;
    @Resource
    private UserMapper userMapper;
    @Resource
    private PerformanceMapper performanceMapper;

    // 添加表演预订
    @PostMapping("/add")
    public String addPerformanceBooking(@RequestBody PerformanceBooking performanceBooking) {
        try {
            // 检查用户是否存在
            User user = userMapper.selectById(performanceBooking.getUserId());
            if (user == null) {
                return "error: 用户不存在";
            }

            // 检查表演是否存在
            Performance performance = performanceMapper.selectById(performanceBooking.getPerformanceId());
            if (performance == null) {
                return "error: 表演不存在";
            }

            performanceBookingMapper.insert(performanceBooking);
            return "success";
        } catch (Exception e) {
            logger.error("Error adding performance booking", e);
            return "error";
        }
    }

    // 分页获取表演预订列表
    @GetMapping("/list")
    public Map<String, Object> performanceBookingList(
            @RequestParam(value = "current", defaultValue = "1") Long current,
            @RequestParam(value = "size", defaultValue = "10") Long size,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "performanceId", required = false) Long performanceId
    ) {
        Map<String, Object> result = new HashMap<>();
        
        Page<PerformanceBooking> page = new Page<>(current, size);

        QueryWrapper<PerformanceBooking> queryWrapper = new QueryWrapper<>();
        if (userId != null) {
            queryWrapper.eq("user_id", userId);
        }
        if (performanceId != null) {
            queryWrapper.eq("performance_id", performanceId);
        }
        
        // 查询预订数据
        Page<PerformanceBooking> bookingPage = performanceBookingMapper.selectPage(page, queryWrapper);
        List<PerformanceBooking> bookingList = bookingPage.getRecords();
        
        // 创建包含用户名称和表演名称的结果列表
        List<Map<String, Object>> records = new ArrayList<>();
        for (PerformanceBooking booking : bookingList) {
            Map<String, Object> bookingMap = new HashMap<>();
            bookingMap.put("id", booking.getId());
            bookingMap.put("userId", booking.getUserId());
            bookingMap.put("performanceId", booking.getPerformanceId());
            bookingMap.put("status", booking.getStatus());
            bookingMap.put("bookingTime", booking.getBookingTime());
            bookingMap.put("createdAt", booking.getCreatedAt());
            bookingMap.put("updatedAt", booking.getUpdatedAt());
            
            // 查询用户信息
            String userName = "未知用户";
            try {
                User user = userMapper.selectById((Serializable)booking.getUserId());
                if (user != null) {
                    userName = user.getName();
                }
            } catch (Exception e) {
                logger.error("查询用户信息失败: {}", e.getMessage());
            }
            bookingMap.put("userName", userName);
            
            // 查询表演信息
            String performanceName = "未知表演";
            try {
                Performance performance = performanceMapper.selectById((Serializable)booking.getPerformanceId());
                if (performance != null) {
                    performanceName = performance.getTitle();
                }
            } catch (Exception e) {
                logger.error("查询表演信息失败: {}", e.getMessage());
            }
            bookingMap.put("performanceName", performanceName);
            
            records.add(bookingMap);
        }
        
        result.put("records", records);
        result.put("total", bookingPage.getTotal());
        result.put("size", bookingPage.getSize());
        result.put("current", bookingPage.getCurrent());
        result.put("pages", bookingPage.getPages());
        
        return result;
    }

    // 删除表演预订
    @PostMapping("/delete")
    public String deletePerformanceBooking(@RequestBody PerformanceBooking performanceBooking) {
        performanceBookingMapper.deleteById(performanceBooking.getId());
        return "success";
    }

    // 更新表演预订
    @PostMapping("/update")
    public String updatePerformanceBooking(@RequestBody PerformanceBooking performanceBooking) {
        try {
            // 检查用户是否存在
            User user = userMapper.selectById(performanceBooking.getUserId());
            if (user == null) {
                return "error: 用户不存在";
            }

            // 检查表演是否存在
            Performance performance = performanceMapper.selectById(performanceBooking.getPerformanceId());
            if (performance == null) {
                return "error: 表演不存在";
            }

            // 设置更新时间
            performanceBooking.setUpdatedAt(LocalDateTime.now());
            performanceBookingMapper.updateById(performanceBooking);
            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }

    // 下载表演预订信息 Excel 文件
    @GetMapping("/download")
    public void download(HttpServletResponse response) {
        try {
            // 查询所有表演预订数据
            List<PerformanceBooking> performanceBookings = performanceBookingMapper.selectList(null);

            // 设置响应头
            response.setContentType("application/vnd.ms-excel");
            response.setCharacterEncoding("UTF-8");
            String fileName = URLEncoder.encode("表演预订信息", "UTF-8");
            response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");

            // 使用 EasyExcel 写入数据到 Excel 文件
            EasyExcel.write(response.getOutputStream(), PerformanceBooking.class)
                    .sheet("表演预订信息")
                    .doWrite(performanceBookings);
        } catch (IOException e) {
            e.printStackTrace();
            try {
                response.getWriter().write("文件下载失败，服务器错误");
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }

    @PostMapping("/book")
    public String bookPerformance(@RequestBody Map<String, Object> bookingData) {
        try {
            String openid = (String) bookingData.get("openid");
            System.out.println("openid: " + openid);
            Long performanceId = Long.parseLong(bookingData.get("performanceId").toString());

            // 获取用户信息
            User user = userMapper.selectByOpenid(openid);
            if (user == null) {
                return "用户不存在";
            }

            // 获取表演信息
            Performance performance = performanceMapper.selectById(performanceId);
            if (performance == null) {
                return "表演不存在";
            }

            // 检查是否已预约
            PerformanceBooking existingBooking = performanceBookingMapper.selectOne(
                new QueryWrapper<PerformanceBooking>().eq("user_id", user.getId()).eq("performance_id", performanceId));
            if (existingBooking != null) {
                return "您已经预约过该表演了";
            }

            // 创建预约
            PerformanceBooking booking = new PerformanceBooking();
            booking.setUserId(user.getId());
            booking.setPerformanceId(performanceId);
            booking.setStatus("已预约");
            
            performanceBookingMapper.insert(booking);
            return "success";
        } catch (Exception e) {
            logger.error("预约失败", e);
            return "预约失败: " + e.getMessage();
        }
    }

    @GetMapping("/booking_list")
    public Map<String, Object> getBookingList(@RequestParam String openid) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 根据 openid 获取用户信息
            QueryWrapper<User> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("openid", openid);
            User user = userMapper.selectOne(queryWrapper);
            
            if (user == null) {
                response.put("success", false);
                response.put("message", "用户不存在");
                return response;
            }

            // 先获取用户的所有预约记录
            QueryWrapper<PerformanceBooking> bookingWrapper = new QueryWrapper<>();
            bookingWrapper.eq("user_id", user.getId());
            List<PerformanceBooking> bookings = performanceBookingMapper.selectList(bookingWrapper);

            // 获取每个预约对应的表演信息
            List<Map<String, Object>> bookingList = new ArrayList<>();
            for (PerformanceBooking booking : bookings) {
                Performance performance = performanceMapper.selectById(booking.getPerformanceId());
                if (performance != null) {
                    Map<String, Object> bookingInfo = new HashMap<>();
                    bookingInfo.put("id", booking.getId());
                    bookingInfo.put("status", booking.getStatus());
                    bookingInfo.put("title", performance.getTitle());
                    bookingInfo.put("location", performance.getLocation());
                    bookingInfo.put("show_date", performance.getShowDate());
                    bookingInfo.put("show_time", performance.getShowTime());
                    bookingInfo.put("duration", performance.getDuration());
                    bookingList.add(bookingInfo);
                }
            }
            
            response.put("success", true);
            response.put("records", bookingList);
            return response;

        } catch (Exception e) {
            logger.error("获取预约列表失败", e);
            response.put("success", false);
            response.put("message", "获取预约列表失败: " + e.getMessage());
            return response;
        }
    }

    @PostMapping("/update_status")
    public Map<String, Object> updateBookingStatus(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();
        try {
            String openid = (String) requestData.get("openid");
            Long bookingId = Long.parseLong(requestData.get("id").toString());
            String newStatus = (String) requestData.get("status");

            // 根据 openid 获取用户信息
            User user = userMapper.selectByOpenid(openid);
            if (user == null) {
                response.put("success", false);
                response.put("message", "用户不存在");
                return response;
            }

            // 获取预约信息并验证是否属于该用户
            PerformanceBooking booking = performanceBookingMapper.selectById(bookingId);
            if (booking == null || booking.getUserId() != user.getId()) {
                response.put("success", false);
                response.put("message", "预约记录不存在或无权操作");
                return response;
            }

            // 更新状态
            booking.setStatus(newStatus);
            booking.setUpdatedAt(LocalDateTime.now());
            performanceBookingMapper.updateById(booking);

            response.put("success", true);
            response.put("message", "状态更新成功");
            return response;

        } catch (Exception e) {
            logger.error("更新预约状态失败", e);
            response.put("success", false);
            response.put("message", "更新失败: " + e.getMessage());
            return response;
        }
    }
}
