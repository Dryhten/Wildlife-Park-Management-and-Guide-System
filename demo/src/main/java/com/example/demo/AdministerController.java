package com.example.demo;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin") // 用户管理接口路径
public class AdministerController {

    @Resource
    private AdministerMapper administerMapper;

    // 用户登录信息验证
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Administer administer) {
        QueryWrapper<Administer> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", administer.getUsername())
                .eq("password", administer.getPassword());
        Administer foundAdminister = administerMapper.selectOne(queryWrapper);

        Map<String, Object> result = new HashMap<>();
        if (foundAdminister != null) {
            // 生成并返回 token
            String token = generateToken(foundAdminister); // 假设有一个生成 token 的方法
            result.put("token", token);
            result.put("user", foundAdminister); // 返回用户信息
            result.put("message", "登录成功");
            result.put("status", "success");
        } else {
            result.put("message", "用户名或密码错误");
            result.put("status", "failure");
        }
        return result;
    }

    // 假设的生成 token 方法
    private String generateToken(Administer administer) {
        // 这里可以使用 JWT 或其他方式生成 token
        return "your-generated-token-" + administer.getId();
    }

    // 更新用户密码
    @PostMapping("/update")
    public Map<String, Object> updatePassword(@RequestBody PasswordUpdateRequest request) {
        QueryWrapper<Administer> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("id", request.getUserId())
                .eq("password", request.getOldPassword());
        Administer foundAdminister = administerMapper.selectOne(queryWrapper);

        Map<String, Object> result = new HashMap<>();
        if (foundAdminister != null) {
            // 更新密码
            foundAdminister.setPassword(request.getNewPassword());
            administerMapper.updateById(foundAdminister);
            result.put("message", "密码更新成功");
            result.put("status", "success");
        } else {
            result.put("message", "旧密码错误");
            result.put("status", "failure");
        }
        return result;
    }
}
