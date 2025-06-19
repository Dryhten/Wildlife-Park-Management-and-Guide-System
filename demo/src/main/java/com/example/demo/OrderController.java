package com.example.demo;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.annotation.Resource;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @Resource
    private OrderMapper orderMapper;

    @Resource
    private UserMapper userMapper;

    @PostMapping("/create")
    public String createOrder(@RequestBody Map<String, Object> orderData) {
        try {
            logger.info("Received order data: " + orderData);
            String openid = (String) orderData.get("openid");
            List<Map<String, Object>> items = (List<Map<String, Object>>) orderData.get("items");
            String contactName = (String) orderData.get("contactName");
            String contactPhone = (String) orderData.get("contactPhone");
            String visitDate = (String) orderData.get("visitDate");

            if (openid == null || items == null || items.isEmpty() || 
                contactName == null || contactPhone == null) {
                return "请求数据不完整";
            }

            // 根据 openid 获取用户信息
            User user = userMapper.selectByOpenid(openid);
            if (user == null) {
                return "用户不存在";
            }

            // 生成订单号
            String orderNumber = generateOrderNumber();
            logger.info("Generated order number: " + orderNumber);
            
            List<Integer> orderIds = new ArrayList<>();
            // 遍历每个 item 并创建订单
            for (Map<String, Object> item : items) {
                String itemName = (String) item.get("itemName");
                Integer quantity = (Integer) item.get("quantity");
                BigDecimal totalAmount = new BigDecimal(item.get("totalAmount").toString());
                Boolean isAnnualCard = (Boolean) item.get("isAnnualCard");

                if (itemName == null || quantity == null || totalAmount == null) {
                    return "订单项数据不完整";
                }

                // 创建订单
                Order order = new Order();
                order.setOrderNumber(orderNumber); // 设置相同的订单号
                order.setUserId(user.getId());
                order.setItemName(itemName);
                order.setQuantity(quantity);
                order.setTotalAmount(totalAmount);
                order.setContactName(contactName);
                order.setContactPhone(contactPhone);
                
                if (!isAnnualCard && visitDate != null) {
                    order.setVisitDate(LocalDate.parse(visitDate));
                }
                
                order.setStatus("待支付");
                order.setCreatedAt(LocalDateTime.now());
                order.setUpdatedAt(LocalDateTime.now());

                // 打印订单信息，用于调试
                logger.info("Saving order: " + order);
                
                orderMapper.insert(order);
                orderIds.add(order.getId());
            }
            
            return "订单创建成功#" + orderNumber;  // 返回订单号
        } catch (Exception e) {
            logger.error("订单创建失败", e);
            return "订单创建失败: " + e.getMessage();
        }
    }

    // 生成订单号的方法
    private String generateOrderNumber() {
        // 时间戳（13位）
        String timestamp = String.valueOf(System.currentTimeMillis());
        // 随机数（4位）
        String random = String.format("%04d", new Random().nextInt(10000));
        // 用户ID（4位，不足补0）
        String userId = String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
        
        return timestamp + random + userId;
    }

    // 根据订单号查询订单
    @GetMapping("/byOrderNumber/{orderNumber}")
    public List<Order> getOrdersByOrderNumber(@PathVariable String orderNumber) {
        return orderMapper.selectList(new QueryWrapper<Order>().eq("order_number", orderNumber));
    }

    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUserId(@PathVariable Integer userId) {
        return orderMapper.selectList(new QueryWrapper<Order>().eq("user_id", userId));
    }

    @PostMapping("/user")
    public List<Order> getUserOrders(@RequestBody Map<String, String> params) {
        String openid = params.get("openid");
        // 根据 openid 获取用户信息
        User user = userMapper.selectByOpenid(openid);
        if (user == null) {
            logger.error("用户不存在");
            return null;
        }
        // 查询用户的订单
        return orderMapper.selectList(new QueryWrapper<Order>().eq("user_id", user.getId()));
    }

    @PostMapping("/updateStatus")
    public String updateOrderStatus(@RequestBody Map<String, Object> statusData) {
        try {
            Integer orderId = Integer.parseInt(statusData.get("orderId").toString());
            String newStatus = (String) statusData.get("status");
            
            // 验证状态是否合法
            if (!Arrays.asList("待支付", "待出行", "已完成", "已失效").contains(newStatus)) {
                return "无效的订单状态";
            }

            Order order = orderMapper.selectById(orderId);
            if (order == null) {
                return "订单不存在";
            }

            order.setStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());
            orderMapper.updateById(order);
            
            return "订单状态更新成功";
        } catch (Exception e) {
            logger.error("更新订单状态失败", e);
            return "更新订单状态失败: " + e.getMessage();
        }
    }

    @GetMapping("/getOrderIds/{orderNumber}")
    public List<Integer> getOrderIdsByOrderNumber(@PathVariable String orderNumber) {
        List<Order> orders = orderMapper.selectList(new QueryWrapper<Order>().eq("order_number", orderNumber));
        return orders.stream()
                .map(Order::getId)
                .collect(java.util.stream.Collectors.toList());
    }

    // 添加获取订单列表的接口
    @GetMapping("/list")
    public Map<String, Object> getOrderList(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String orderNumber,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String contactPhone,
            @RequestParam(required = false) String status) {
        
        // 创建分页对象
        Page<Order> page = new Page<>(current, size);
        
        // 创建查询条件
        QueryWrapper<Order> queryWrapper = new QueryWrapper<>();
        
        // 添加查询条件
        if (orderNumber != null && !orderNumber.isEmpty()) {
            queryWrapper.like("order_number", orderNumber);
        }
        if (userId != null) {
            queryWrapper.eq("user_id", userId);
        }
        if (contactPhone != null && !contactPhone.isEmpty()) {
            queryWrapper.like("contact_phone", contactPhone);
        }
        if (status != null && !status.isEmpty()) {
            queryWrapper.eq("status", status);
        }
        
        // 执行查询
        Page<Order> orderPage = orderMapper.selectPage(page, queryWrapper);
        
        // 构建返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("records", orderPage.getRecords());
        result.put("total", orderPage.getTotal());
        result.put("size", orderPage.getSize());
        result.put("current", orderPage.getCurrent());
        result.put("pages", orderPage.getPages());
        
        return result;
    }
} 