package com.example.demo;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.*;
import com.alibaba.excel.EasyExcel;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin
public class AdminOrderController {
    private static final Logger logger = LoggerFactory.getLogger(AdminOrderController.class);

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/list")
    public Map<String, Object> getOrderList(
            @RequestParam(value = "current", defaultValue = "1") Integer current,
            @RequestParam(value = "size", defaultValue = "10") Integer size,
            @RequestParam(value = "userId", required = false) Integer userId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "contactPhone", required = false) String contactPhone
    ) {
        Map<String, Object> result = new HashMap<>();
        try {
            Page<Order> page = new Page<>(current, size);
            QueryWrapper<Order> queryWrapper = new QueryWrapper<>();
            
            if (userId != null) {
                queryWrapper.eq("user_id", userId);
            }
            if (status != null && !status.isEmpty()) {
                queryWrapper.eq("status", status);
            }
            if (contactPhone != null && !contactPhone.isEmpty()) {
                queryWrapper.eq("contact_phone", contactPhone);
            }
            
            queryWrapper.orderByDesc("created_at");
            
            Page<Order> orderPage = orderMapper.selectPage(page, queryWrapper);
            List<Order> orderList = orderPage.getRecords();
            
            // 获取所有用户ID
            List<Long> userIds = orderList.stream()
                    .map(order -> order.getUserId().longValue())
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
            
            // 创建包含用户名的结果列表
            List<Map<String, Object>> records = new ArrayList<>();
            for (Order order : orderList) {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("id", order.getId());
                orderMap.put("orderNumber", order.getOrderNumber());
                orderMap.put("userId", order.getUserId());
                orderMap.put("userName", userNameMap.getOrDefault(order.getUserId().longValue(), "未知用户"));
                orderMap.put("itemName", order.getItemName());
                orderMap.put("quantity", order.getQuantity());
                orderMap.put("totalAmount", order.getTotalAmount());
                orderMap.put("contactName", order.getContactName());
                orderMap.put("contactPhone", order.getContactPhone());
                orderMap.put("status", order.getStatus());
                orderMap.put("createdAt", order.getCreatedAt());
                orderMap.put("updatedAt", order.getUpdatedAt());
                orderMap.put("visitDate", order.getVisitDate());
                
                records.add(orderMap);
            }
            
            result.put("records", records);
            result.put("total", orderPage.getTotal());
            result.put("success", true);
            return result;
            
        } catch (Exception e) {
            logger.error("获取订单列表失败", e);
            result.put("success", false);
            result.put("message", "获取订单列表失败: " + e.getMessage());
            return result;
        }
    }

    @PostMapping("/update")
    public Map<String, Object> updateOrder(@RequestBody Order order) {
        Map<String, Object> result = new HashMap<>();
        try {
            order.setUpdatedAt(LocalDateTime.now());
            orderMapper.updateById(order);
            result.put("success", true);
            result.put("message", "更新成功");
            return result;
        } catch (Exception e) {
            logger.error("更新订单失败", e);
            result.put("success", false);
            result.put("message", "更新订单失败: " + e.getMessage());
            return result;
        }
    }

    @PostMapping("/delete")
    public Map<String, Object> deleteOrder(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer id = Integer.parseInt(params.get("id").toString());
            orderMapper.deleteById(id);
            result.put("success", true);
            result.put("message", "删除成功");
            return result;
        } catch (Exception e) {
            logger.error("删除订单失败", e);
            result.put("success", false);
            result.put("message", "删除订单失败: " + e.getMessage());
            return result;
        }
    }

    @GetMapping("/download")
    public void downloadOrders(HttpServletResponse response) {
        try {
            List<Order> orders = orderMapper.selectList(null);
            
            response.setContentType("application/vnd.ms-excel");
            response.setCharacterEncoding("UTF-8");
            String fileName = URLEncoder.encode("订单列表", "UTF-8");
            response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");
            
            EasyExcel.write(response.getOutputStream(), Order.class)
                    .sheet("订单列表")
                    .doWrite(orders);
                    
        } catch (IOException e) {
            logger.error("下载订单列表失败", e);
        }
    }
} 