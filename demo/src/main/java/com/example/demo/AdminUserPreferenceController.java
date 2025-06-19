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
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/admin/user-preference")
@CrossOrigin
public class AdminUserPreferenceController {
    private static final Logger logger = LoggerFactory.getLogger(AdminUserPreferenceController.class);

    @Autowired
    private UserPreferenceMapper userPreferenceMapper;

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/list")
    public Map<String, Object> getPreferenceList(
            @RequestParam(value = "current", defaultValue = "1") Integer current,
            @RequestParam(value = "size", defaultValue = "10") Integer size,
            @RequestParam(value = "userId", required = false) Integer userId,
            @RequestParam(value = "transportMode", required = false) String transportMode
    ) {
        Map<String, Object> result = new HashMap<>();
        try {
            Page<UserPreference> page = new Page<>(current, size);
            QueryWrapper<UserPreference> queryWrapper = new QueryWrapper<>();
            
            if (userId != null) {
                queryWrapper.eq("user_id", userId);
            }
            if (transportMode != null && !transportMode.isEmpty()) {
                queryWrapper.eq("transport_mode", transportMode);
            }
            
            queryWrapper.orderByDesc("updated_at");
            
            Page<UserPreference> preferencePage = userPreferenceMapper.selectPage(page, queryWrapper);
            List<UserPreference> preferenceList = preferencePage.getRecords();
            
            // 获取所有用户ID
            List<Integer> userIds = preferenceList.stream()
                    .map(UserPreference::getUserId)
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
            
            ObjectMapper objectMapper = new ObjectMapper();
            List<Map<String, Object>> records = new ArrayList<>();
            for (UserPreference preference : preferenceList) {
                Map<String, Object> prefMap = new HashMap<>();
                prefMap.put("id", preference.getId());
                prefMap.put("userId", preference.getUserId());
                prefMap.put("userName", userNameMap.getOrDefault(preference.getUserId(), "未知用户"));
                prefMap.put("isPersonalized", preference.getIsPersonalized());
                prefMap.put("transportMode", preference.getTransportMode());
                
                // 解析favoriteAnimals JSON字符串
                String favoriteAnimals = preference.getFavoriteAnimals();
                if (favoriteAnimals != null && !favoriteAnimals.isEmpty()) {
                    try {
                        List<String> animalsList = objectMapper.readValue(favoriteAnimals, List.class);
                        prefMap.put("favoriteAnimals", String.join(", ", animalsList));
                    } catch (Exception e) {
                        prefMap.put("favoriteAnimals", favoriteAnimals);
                    }
                } else {
                    prefMap.put("favoriteAnimals", "");
                }
                
                prefMap.put("createdAt", preference.getCreatedAt());
                prefMap.put("updatedAt", preference.getUpdatedAt());
                
                records.add(prefMap);
            }
            
            result.put("records", records);
            result.put("total", preferencePage.getTotal());
            result.put("success", true);
            return result;
            
        } catch (Exception e) {
            logger.error("获取用户偏好列表失败", e);
            result.put("success", false);
            result.put("message", "获取用户偏好列表失败: " + e.getMessage());
            return result;
        }
    }

    @PostMapping("/update")
    public Map<String, Object> updatePreference(@RequestBody UserPreference preference) {
        Map<String, Object> result = new HashMap<>();
        try {
            preference.setUpdatedAt(LocalDateTime.now());
            userPreferenceMapper.updateById(preference);
            result.put("success", true);
            result.put("message", "更新成功");
            return result;
        } catch (Exception e) {
            logger.error("更新用户偏好失败", e);
            result.put("success", false);
            result.put("message", "更新用户偏好失败: " + e.getMessage());
            return result;
        }
    }

    @PostMapping("/delete")
    public Map<String, Object> deletePreference(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer id = Integer.parseInt(params.get("id").toString());
            userPreferenceMapper.deleteById(id);
            result.put("success", true);
            result.put("message", "删除成功");
            return result;
        } catch (Exception e) {
            logger.error("删除用户偏好失败", e);
            result.put("success", false);
            result.put("message", "删除用户偏好失败: " + e.getMessage());
            return result;
        }
    }

    @GetMapping("/download")
    public void downloadPreferences(HttpServletResponse response) {
        try {
            List<UserPreference> preferences = userPreferenceMapper.selectList(null);
            
            response.setContentType("application/vnd.ms-excel");
            response.setCharacterEncoding("UTF-8");
            String fileName = URLEncoder.encode("用户偏好列表", "UTF-8");
            response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");
            
            EasyExcel.write(response.getOutputStream(), UserPreference.class)
                    .sheet("用户偏好列表")
                    .doWrite(preferences);
                    
        } catch (IOException e) {
            logger.error("下载用户偏好列表失败", e);
        }
    }
} 