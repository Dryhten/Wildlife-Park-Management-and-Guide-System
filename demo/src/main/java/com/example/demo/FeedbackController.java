package com.example.demo;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import javax.annotation.Resource;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import com.alibaba.excel.EasyExcel;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/feedback") // 游客反馈接口路径
public class FeedbackController {
    private static final Logger logger = LoggerFactory.getLogger(FeedbackController.class);

    @Resource
    private FeedbackMapper feedbackMapper;

    @Resource
    private UserMapper userMapper;
    
    // 添加游客反馈
    @PostMapping("/add")
    public Map<String, Object> addFeedback(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();
        try {
            String openid = (String) requestData.get("openid");
            String name = (String) requestData.get("name");
            String contact = (String) requestData.get("contact");
            String content = (String) requestData.get("content");
            Integer rating = Integer.parseInt(requestData.get("rating").toString());

            // 获取用户信息
            User user = userMapper.selectOne(new QueryWrapper<User>().eq("openid", openid));
            if (user == null) {
                response.put("success", false);
                response.put("message", "用户不存在");
                return response;
            }

            // 查找用户是否已有反馈记录
            Feedback existingFeedback = feedbackMapper.selectOne(
                new QueryWrapper<Feedback>()
                    .eq("user_id", user.getId())
            );

            LocalDateTime now = LocalDateTime.now();
            if (existingFeedback != null) {
                // 更新现有记录
                existingFeedback.setName(name);
                existingFeedback.setContact(contact);
                existingFeedback.setContent(content);
                existingFeedback.setRating(rating);
                existingFeedback.setUpdatedAt(now);
                feedbackMapper.updateById(existingFeedback);
                
                response.put("success", true);
                response.put("message", "反馈更新成功");
            } else {
                // 创建新反馈
                Feedback feedback = new Feedback();
                feedback.setUserId(user.getId());
                feedback.setName(name);
                feedback.setContact(contact);
                feedback.setContent(content);
                feedback.setRating(rating);
                feedback.setCreatedAt(now);
                feedback.setUpdatedAt(now);
                
                feedbackMapper.insert(feedback);
                
                response.put("success", true);
                response.put("message", "反馈提交成功");
            }
            return response;

        } catch (Exception e) {
            logger.error("提交反馈失败", e);
            response.put("success", false);
            response.put("message", "提交反馈失败: " + e.getMessage());
            return response;
        }
    }

    // 分页获取游客反馈列表
    @GetMapping("/list")
    public Map<String, Object> feedbackList(
            @RequestParam(value = "current", defaultValue = "1") Integer current,
            @RequestParam(value = "size", defaultValue = "10") Integer size,
            @RequestParam(value = "userId", required = false) Integer userId,
            @RequestParam(value = "parkId", required = false) Integer parkId,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "rating", required = false) Integer rating
    ) {
        Map<String, Object> result = new HashMap<>();
        
        Page<Feedback> page = new Page<>(current, size);
        QueryWrapper<Feedback> queryWrapper = new QueryWrapper<>();
        if (userId != null) {
            queryWrapper.eq("user_id", userId);
        }
        if (parkId != null) {
            queryWrapper.eq("park_id", parkId);
        }
        
        // 查询反馈数据
        Page<Feedback> feedbackPage = feedbackMapper.selectPage(page, queryWrapper);
        List<Feedback> feedbackList = feedbackPage.getRecords();
        
        // 获取所有用户ID
        List<Integer> userIds = feedbackList.stream()
                .map(Feedback::getUserId)
                .collect(Collectors.toList());
        
        // 批量查询用户信息
        Map<Integer, String> userNameMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            List<User> users = userMapper.selectList(
                    new QueryWrapper<User>().in("id", userIds)
            );
            userNameMap = users.stream()
                    .collect(Collectors.toMap(User::getId, User::getName, (a, b) -> a));
        }
        
        // 创建包含用户名和表演名称的结果列表
        List<Map<String, Object>> records = new ArrayList<>();
        for (Feedback feedback : feedbackList) {
            Map<String, Object> feedbackMap = new HashMap<>();
            feedbackMap.put("id", feedback.getId());
            feedbackMap.put("userId", feedback.getUserId());
            feedbackMap.put("name", feedback.getName());
            feedbackMap.put("contact", feedback.getContact());
            feedbackMap.put("content", feedback.getContent());
            feedbackMap.put("rating", feedback.getRating());
            feedbackMap.put("createdAt", feedback.getCreatedAt());
            feedbackMap.put("updatedAt", feedback.getUpdatedAt());
            
            // 添加用户名称
            feedbackMap.put("userName", userNameMap.getOrDefault(feedback.getUserId(), "未知用户"));
            
            records.add(feedbackMap);
        }
        
        result.put("records", records);
        result.put("total", feedbackPage.getTotal());
        result.put("size", feedbackPage.getSize());
        result.put("current", feedbackPage.getCurrent());
        result.put("pages", feedbackPage.getPages());
        
        return result;
    }

    // 更新游客反馈
    @PostMapping("/update")
    public String updateFeedback(@RequestBody Feedback feedback) {
        try {
            feedbackMapper.updateById(feedback);
            return "success";
        } catch (Exception e) {
            logger.error("Error updating feedback", e);
            return "error";
        }
    }

    // 删除游客反馈
    @PostMapping("/delete")
    public String deleteFeedback(@RequestBody Feedback feedback) {
        feedbackMapper.deleteById(feedback.getId());
        return "success";
    }

    // 下载游客反馈 CSV 文件
    @GetMapping("/download")
    public void download(HttpServletResponse response) {
        try {
            // 查询所有游客反馈数据
            List<Feedback> feedbacks = feedbackMapper.selectList(null);

            // 设置响应头
            response.setContentType("application/vnd.ms-excel");
            response.setCharacterEncoding("UTF-8");
            String fileName = URLEncoder.encode("游客反馈", "UTF-8");
            response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".csv");

            // 使用 EasyExcel 写入数据到 CSV 文件
            EasyExcel.write(response.getOutputStream(), Feedback.class)
                    .sheet("游客反馈")
                    .doWrite(feedbacks);
        } catch (IOException e) {
            e.printStackTrace();
            try {
                response.getWriter().write("文件下载失败，服务器错误");
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }
}