package com.example.demo;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.web.bind.annotation.*;
import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {
    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);
    @Resource
    private BookingMapper bookingMapper;
    @Resource
    private UserMapper userMapper;
    @Resource
    private ParkMapper parkMapper;
    @Resource
    private OrderMapper orderMapper;
    @Resource
    private PerformanceBookingMapper performanceBookingMapper;
    @Resource
    private PerformanceMapper performanceMapper;
    @Resource
    private SafetyAlertMapper safetyAlertMapper;
    @Resource
    private ParkTrafficMapper parkTrafficMapper;
    @Resource
    private DangerZoneMapper dangerZoneMapper;

    // 获取今日订单数据
    @GetMapping("/orders/today")
    public Map<String, Object> getTodayOrders() {
        LocalDateTime today = LocalDateTime.now();
        LocalDateTime startOfDay = today.withHour(0).withMinute(0).withSecond(0);
        
        // 获取今日的订单数量
        QueryWrapper<Order> orderWrapper = new QueryWrapper<>();
        orderWrapper.ge("created_at", startOfDay);
        List<Order> todayOrders = orderMapper.selectList(orderWrapper);
        
        // 获取今日的预警数量
        QueryWrapper<SafetyAlert> alertWrapper = new QueryWrapper<>();
        alertWrapper.ge("alert_time", startOfDay);
        List<SafetyAlert> todayAlerts = safetyAlertMapper.selectList(alertWrapper);
        
        Map<String, Object> result = new HashMap<>();
        result.put("total", todayOrders.size());
        result.put("pending", todayAlerts.size());  // 今日预警次数
        return result;
    }

    // 获取今日游客数据
    @GetMapping("/visitors/today")
    public Map<String, Object> getTodayVisitors() {
        // 获取所有园区的实时流量数据
        List<Park> parks = parkMapper.selectList(null);
        int totalVisitors = 0;
        
        for (Park park : parks) {
            QueryWrapper<ParkTraffic> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("park_id", park.getId());
            ParkTraffic traffic = parkTrafficMapper.selectOne(queryWrapper);
            if (traffic != null) {
                // 只计算当前园内人数，不包含排队人数
                totalVisitors += traffic.getCurrentPeople();
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("total", totalVisitors);
        return result;
    }

    // 获取今日收入数据
    @GetMapping("/income/today")
    public Map<String, Object> getTodayIncome() {
        LocalDateTime today = LocalDateTime.now();
        LocalDateTime startOfDay = today.withHour(0).withMinute(0).withSecond(0);
        
        QueryWrapper<Order> queryWrapper = new QueryWrapper<>();
        queryWrapper.ge("created_at", startOfDay);
        List<Order> todayOrders = orderMapper.selectList(queryWrapper);
        
        double totalIncome = todayOrders.stream()
                .mapToDouble(order -> order.getTotalAmount().doubleValue())
                .sum();
        
        Map<String, Object> result = new HashMap<>();
        result.put("total", totalIncome);
        return result;
    }

    // 获取订单趋势数据
    @GetMapping("/orders/trend")
    public List<Integer> getOrderTrend() {
        List<Integer> trend = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        // 获取最近7天的数据
        for (int i = 6; i >= 0; i--) {
            LocalDateTime date = now.minusDays(i);
            LocalDateTime startOfDay = date.withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endOfDay = date.withHour(23).withMinute(59).withSecond(59);
            
            QueryWrapper<Order> queryWrapper = new QueryWrapper<>();
            queryWrapper.between("created_at", startOfDay, endOfDay)
                      .notIn("status", "待支付", "已失效");  // 排除待支付和已失效的订单
            
            // 获取所有订单用于调试
            List<Order> orders = orderMapper.selectList(queryWrapper);
            System.out.println("日期: " + date.toLocalDate() + 
                             ", 开始时间: " + startOfDay + 
                             ", 结束时间: " + endOfDay + 
                             ", 订单数: " + orders.size());
            
            // 打印每个订单的详细信息
            orders.forEach(order -> {
                System.out.println("订单ID: " + order.getId() + 
                                 ", 创建时间: " + order.getCreatedAt() + 
                                 ", 状态: " + order.getStatus());
            });
            
            trend.add(orders.size());
        }
        
        return trend;
    }

    // 获取园区实时流量数据
    @GetMapping("/park_traffic/realtime")
    public List<Map<String, Object>> getParkTraffic() {
        List<Park> parks = parkMapper.selectList(null);
        return parks.stream().map(park -> {
            QueryWrapper<ParkTraffic> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("park_id", park.getId());
            ParkTraffic traffic = parkTrafficMapper.selectOne(queryWrapper);
            
            Map<String, Object> data = new HashMap<>();
            data.put("parkName", park.getName());
            data.put("currentPeople", traffic != null ? traffic.getCurrentPeople() : 0);
            data.put("queuePeople", traffic != null ? traffic.getQueuePeople() : 0);
            return data;
        }).collect(Collectors.toList());
    }

    // 获取表演预订统计数据
    @GetMapping("/performance_booking/stats")
    public List<Map<String, Object>> getPerformanceBookingStats() {
        // 获取所有表演信息
        List<Performance> performances = performanceMapper.selectList(null);
        Map<Integer, String> performanceTitles = performances.stream()
                .collect(Collectors.toMap(
                    Performance::getId,
                    Performance::getTitle
                ));
        
        // 获取所有预订记录
        QueryWrapper<PerformanceBooking> queryWrapper = new QueryWrapper<>();
        queryWrapper.notIn("status", "已取消", "已失效");  // 排除已取消和已失效的预订
        List<PerformanceBooking> bookings = performanceBookingMapper.selectList(queryWrapper);
        
        // 按表演ID分组统计
        Map<Integer, Integer> stats = new HashMap<>();
        for (PerformanceBooking booking : bookings) {
            stats.merge(booking.getPerformanceId().intValue(), 1, Integer::sum);
        }
        
        // 转换为前端需要的格式
        return stats.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("type", performanceTitles.getOrDefault(entry.getKey(), "未知表演"));
                    data.put("count", entry.getValue());
                    return data;
                })
                .sorted((a, b) -> Integer.compare((Integer)b.get("count"), (Integer)a.get("count")))  // 按预订数量降序排序
                .limit(5)  // 只返回前5个最热门的表演
                .collect(Collectors.toList());
    }

    // 获取安全预警数据
    @GetMapping("/safety_alerts")
    public List<Map<String, Object>> getSafetyAlerts() {
        // 获取最新的3条活动预警
        QueryWrapper<SafetyAlert> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", "Active")  // 只查询Active状态的预警
                   .orderByDesc("alert_time")
                   .last("LIMIT 3");
        
        List<SafetyAlert> alerts = safetyAlertMapper.selectList(queryWrapper);
        System.out.println("查询到的安全预警数量: " + alerts.size());
        
        // 打印每个预警的详细信息
        alerts.forEach(alert -> {
            System.out.println("预警ID: " + alert.getId() + 
                             ", 用户ID: " + alert.getUserId() + 
                             ", 区域ID: " + alert.getZoneId() + 
                             ", 状态: " + alert.getStatus() + 
                             ", 时间: " + alert.getAlertTime());
        });
        
        // 获取危险区域信息
        List<DangerZone> dangerZones = dangerZoneMapper.selectList(null);
        Map<Integer, String> zoneNames = dangerZones.stream()
                .collect(Collectors.toMap(DangerZone::getId, DangerZone::getName));
        System.out.println("危险区域数量: " + dangerZones.size());
        
        // 获取用户信息
        List<User> users = userMapper.selectList(null);
        Map<Integer, String> userNames = users.stream()
                .collect(Collectors.toMap(User::getId, User::getName));
        System.out.println("用户数量: " + users.size());
        
        // 格式化预警信息
        return alerts.stream().map(alert -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", alert.getId());
            data.put("title", "安全预警 #" + alert.getId());
            data.put("zone", zoneNames.getOrDefault(alert.getZoneId(), "未知区域"));
            data.put("reporter", userNames.getOrDefault(alert.getUserId(), "未知用户"));
            data.put("time", alert.getAlertTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            data.put("description", String.format("危险区域：%s\n报告人：%s", 
                zoneNames.getOrDefault(alert.getZoneId(), "未知区域"),
                userNames.getOrDefault(alert.getUserId(), "未知用户")));
            return data;
        }).collect(Collectors.toList());
    }

    @GetMapping("/statistics")
    public Map<String, Object> getStatistics() {
        Map<String, Object> result = new HashMap<>();
        try {
            // 获取总用户数
            Integer totalUsers = userMapper.selectCount(null).intValue();
            
            // 获取总订单数
            Integer totalOrders = orderMapper.selectCount(null).intValue();
            
            // 获取总园区数
            Integer totalParks = parkMapper.selectCount(null).intValue();
            
            // 获取今日订单数
            QueryWrapper<Order> todayWrapper = new QueryWrapper<>();
            todayWrapper.ge("created_at", LocalDateTime.now().withHour(0).withMinute(0).withSecond(0));
            Integer todayOrders = orderMapper.selectCount(todayWrapper).intValue();
            
            // 获取本周订单数
            QueryWrapper<Order> weekWrapper = new QueryWrapper<>();
            weekWrapper.ge("created_at", LocalDateTime.now().minusDays(7));
            Integer weekOrders = orderMapper.selectCount(weekWrapper).intValue();
            
            // 获取本月订单数
            QueryWrapper<Order> monthWrapper = new QueryWrapper<>();
            monthWrapper.ge("created_at", LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0));
            Integer monthOrders = orderMapper.selectCount(monthWrapper).intValue();
            
            result.put("success", true);
            result.put("data", new HashMap<String, Object>() {{
                put("totalUsers", totalUsers);
                put("totalOrders", totalOrders);
                put("totalParks", totalParks);
                put("todayOrders", todayOrders);
                put("weekOrders", weekOrders);
                put("monthOrders", monthOrders);
            }});
            return result;
        } catch (Exception e) {
            logger.error("获取统计数据失败", e);
            result.put("success", false);
            result.put("message", "获取统计数据失败: " + e.getMessage());
            return result;
        }
    }
} 