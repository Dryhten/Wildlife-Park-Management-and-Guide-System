package com.example.demo;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import com.alibaba.excel.EasyExcel;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/user") // 用户管理接口路径
@CrossOrigin
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Resource
    private UserMapper userMapper;

    // 用户注册（微信小程序登录时自动注册）
    @PostMapping("/register")
    public String registerUser(@RequestBody User user) {
        try {
            // 检查 openid 是否已存在
            QueryWrapper<User> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("openid", user.getOpenid());
            if (userMapper.selectCount(queryWrapper) > 0) {
                return "error: 用户已存在";
            }
            // 插入用户信息
            userMapper.insert(user);
            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error: 注册失败";
        }
    }

    // 用户登录（微信小程序登录）
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        // 使用 code 调用微信的 code2Session 接口
        String url = "https://api.weixin.qq.com/sns/jscode2session?appid=wx99b248f6e5da2caa&secret=fdb4f6e0ff8600a7dc7b47f75ddd54e7&js_code=" + code + "&grant_type=authorization_code";
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        
        // 打印微信返回的完整响应
        System.out.println("微信接口响应: " + response.getBody());

        // 解析微信返回的 JSON 数据
        JSONObject jsonObject = new JSONObject(response.getBody());
        if (!jsonObject.has("openid")) {
            return ResponseEntity.status(500).body("服务器错误: " + jsonObject.toString());
        }
        String openid = jsonObject.getString("openid");
        String sessionKey = jsonObject.getString("session_key");

        // 根据 openid 查找或创建用户
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("openid", openid);
        User user = userMapper.selectOne(queryWrapper);
        if (user == null) {
            // 如果用户不存在，则创建新用户
            user = new User();
            user.setOpenid(openid);
            user.setSessionKey(sessionKey);
            user.setName("微信用户"); // 将默认值设置为"微信用户"
            userMapper.insert(user);
        } else {
            // 如果用户已存在，更新 sessionKey
            user.setSessionKey(sessionKey);
            userMapper.updateById(user);
        }

        // 返回用户信息
        return ResponseEntity.ok(user);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 根据 openid 查找用户
            QueryWrapper<User> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("openid", user.getOpenid());
            User existingUser = userMapper.selectOne(queryWrapper);
            if (existingUser != null) {
                // 更新用户信息
                existingUser.setName(user.getName());
                existingUser.setPhone(user.getPhone());
                existingUser.setRealName(user.getRealName());
                existingUser.setGender(user.getGender());
                existingUser.setIdNumber(user.getIdNumber());
                userMapper.updateById(existingUser);
                
                response.put("success", true);
                response.put("message", "更新成功");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "用户不存在");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "更新失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/get")
    public ResponseEntity<?> getUserInfo(@RequestParam String openid) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 根据 openid 查找用户
            User user = userMapper.selectOne(new QueryWrapper<User>().eq("openid", openid));
            if (user != null) {
                response.put("success", true);
                response.put("data", user);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "用户不存在");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "获取用户信息失败");
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/update_current_zoo")
    public Map<String, Object> updateCurrentZoo(@RequestBody Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 获取参数
            Integer userId = Integer.parseInt(params.get("userId").toString());
            String currentZooId = params.get("currentZooId").toString();

            // 参数验证
            if (userId == null || currentZooId == null) {
                result.put("success", false);
                result.put("message", "参数不完整");
                return result;
            }

            // 查询用户是否存在
            User user = userMapper.selectById(userId);
            if (user == null) {
                result.put("success", false);
                result.put("message", "用户不存在");
                return result;
            }

            // 更新用户的当前动物园ID
            user.setCurrentZooId(Integer.parseInt(currentZooId));
            int updateResult = userMapper.updateById(user);

            if (updateResult > 0) {
                result.put("success", true);
                result.put("message", "更新成功");
            } else {
                result.put("success", false);
                result.put("message", "更新失败");
            }

        } catch (NumberFormatException e) {
            logger.error("参数格式错误", e);
            result.put("success", false);
            result.put("message", "参数格式错误");
        } catch (Exception e) {
            logger.error("更新当前动物园失败", e);
            result.put("success", false);
            result.put("message", "更新失败: " + e.getMessage());
        }
        return result;
    }
}