package com.example.demo;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@RestController
@RequestMapping("/api/user_preference")
public class UserPreferenceController {
    private static final Logger logger = LoggerFactory.getLogger(UserPreferenceController.class);

    @Autowired
    private UserPreferenceMapper userPreferenceMapper;
    
    @Autowired
    private UserMapper userMapper;

    @GetMapping("/get")
    public Map<String, Object> getUserPreference(@RequestParam String openid) {
        Map<String, Object> response = new HashMap<>();
        try {
            User user = userMapper.selectOne(new QueryWrapper<User>().eq("openid", openid));
            if (user == null) {
                response.put("success", false);
                response.put("message", "用户不存在");
                return response;
            }

            UserPreference preference = userPreferenceMapper.selectOne(
                new QueryWrapper<UserPreference>()
                    .eq("user_id", user.getId())
            );

            if (preference != null && preference.getFavoriteAnimals() != null) {
                // 将 JSON 字符串转换回 List
                ObjectMapper objectMapper = new ObjectMapper();
                List<String> favoriteAnimals = objectMapper.readValue(
                    preference.getFavoriteAnimals(), 
                    new TypeReference<List<String>>(){}
                );
                preference.setFavoriteAnimals(String.join(",", favoriteAnimals));
            }

            response.put("success", true);
            response.put("data", preference);
            return response;
        } catch (Exception e) {
            logger.error("获取用户偏好失败", e);
            response.put("success", false);
            response.put("message", e.getMessage());
            return response;
        }
    }

    @PostMapping("/save")
    public Map<String, Object> saveUserPreference(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();
        try {
            String openid = (String) requestData.get("openid");
            String transportMode = (String) requestData.get("transportMode");
            List<String> favoriteAnimals = (List<String>) requestData.get("favoriteAnimals");

            User user = userMapper.selectOne(new QueryWrapper<User>().eq("openid", openid));
            if (user == null) {
                response.put("success", false);
                response.put("message", "用户不存在");
                return response;
            }

            // 将 List 转换为 JSON 字符串
            ObjectMapper objectMapper = new ObjectMapper();
            String favoriteAnimalsJson = objectMapper.writeValueAsString(favoriteAnimals);

            UserPreference existingPreference = userPreferenceMapper.selectOne(
                new QueryWrapper<UserPreference>()
                    .eq("user_id", user.getId())
            );

            LocalDateTime now = LocalDateTime.now();
            if (existingPreference != null) {
                existingPreference.setTransportMode(transportMode);
                existingPreference.setFavoriteAnimals(favoriteAnimalsJson);
                existingPreference.setUpdatedAt(now);
                userPreferenceMapper.updateById(existingPreference);
            } else {
                UserPreference preference = new UserPreference();
                preference.setUserId(user.getId());
                preference.setTransportMode(transportMode);
                preference.setFavoriteAnimals(favoriteAnimalsJson);
                preference.setCreatedAt(now);
                preference.setUpdatedAt(now);
                userPreferenceMapper.insert(preference);
            }

            response.put("success", true);
            response.put("message", "保存成功");
            return response;
        } catch (Exception e) {
            logger.error("保存用户偏好失败", e);
            response.put("success", false);
            response.put("message", e.getMessage());
            return response;
        }
    }

    @PostMapping("/toggle_personalized")
    public Map<String, Object> togglePersonalized(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();
        try {
            String openid = (String) requestData.get("openid");
            Boolean isPersonalized = (Boolean) requestData.get("isPersonalized");

            User user = userMapper.selectOne(new QueryWrapper<User>().eq("openid", openid));
            if (user == null) {
                response.put("success", false);
                response.put("message", "用户不存在");
                return response;
            }

            UserPreference existingPreference = userPreferenceMapper.selectOne(
                new QueryWrapper<UserPreference>()
                    .eq("user_id", user.getId())
                );

            LocalDateTime now = LocalDateTime.now();
            if (existingPreference != null) {
                existingPreference.setIsPersonalized(isPersonalized);
                existingPreference.setUpdatedAt(now);
                userPreferenceMapper.updateById(existingPreference);
            } else {
                UserPreference preference = new UserPreference();
                preference.setUserId(user.getId());
                preference.setIsPersonalized(isPersonalized);
                preference.setCreatedAt(now);
                preference.setUpdatedAt(now);
                userPreferenceMapper.insert(preference);
            }

            response.put("success", true);
            response.put("message", "更新成功");
            return response;
        } catch (Exception e) {
            logger.error("更新个性化设置失败", e);
            response.put("success", false);
            response.put("message", e.getMessage());
            return response;
        }
    }
} 