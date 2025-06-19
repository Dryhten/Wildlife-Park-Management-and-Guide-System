package com.example.demo;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminAdministerController {

    @Resource
    private AdministerMapper administerMapper;

    // 分页获取管理员列表
    @GetMapping("/list")
    public Map<String, Object> getAdministerList(
            @RequestParam(value = "current", defaultValue = "1") Integer current,
            @RequestParam(value = "size", defaultValue = "10") Integer size,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "nickname", required = false) String nickname) {
        
        Map<String, Object> result = new HashMap<>();
        
        Page<Administer> page = new Page<>(current, size);
        QueryWrapper<Administer> queryWrapper = new QueryWrapper<>();
        
        if (username != null && !username.isEmpty()) {
            queryWrapper.like("username", username);
        }
        
        if (nickname != null && !nickname.isEmpty()) {
            queryWrapper.like("nickname", nickname);
        }
        
        Page<Administer> administerPage = administerMapper.selectPage(page, queryWrapper);
        
        result.put("records", administerPage.getRecords());
        result.put("total", administerPage.getTotal());
        
        return result;
    }
    
    // 添加管理员
    @PostMapping("/administrator/add")
    public String add(@RequestBody Administer administer) {
        try {
            // 检查用户名是否已存在
            QueryWrapper<Administer> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("username", administer.getUsername());
            if (administerMapper.selectCount(queryWrapper) > 0) {
                return "error: 用户名已存在";
            }
            
            administerMapper.insert(administer);
            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error: " + e.getMessage();
        }
    }
    
    // 更新管理员
    @PostMapping("/administrator/update")
    public String update(@RequestBody Administer administer) {
        try {
            // 获取原始管理员数据
            Administer originalAdmin = administerMapper.selectById(administer.getId());
            if (originalAdmin == null) {
                return "error: 管理员不存在";
            }
            
            // 检查是否在尝试将系统管理员改为园区管理员
            if ("1".equals(originalAdmin.getRole()) && "0".equals(administer.getRole())) {
                // 查询系统中有多少系统管理员
                QueryWrapper<Administer> queryWrapper = new QueryWrapper<>();
                queryWrapper.eq("role", "1");
                List<Administer> admins = administerMapper.selectList(queryWrapper);
                
                // 如果只有一个系统管理员，则禁止此变更
                if (admins.size() <= 1) {
                    return "error: 系统中必须保留至少一个系统管理员";
                }
            }
            
            // 检查用户名是否已被其他用户使用
            QueryWrapper<Administer> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("username", administer.getUsername())
                      .ne("id", administer.getId());
            if (administerMapper.selectCount(queryWrapper) > 0) {
                return "error: 用户名已存在";
            }
            
            administerMapper.updateById(administer);
            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error: " + e.getMessage();
        }
    }
    
    // 删除管理员
    @PostMapping("/administrator/delete")
    public String delete(@RequestBody Map<String, Object> param) {
        try {
            Integer id = Integer.parseInt(param.get("id").toString());
            
            // 检查是否还有其他系统管理员
            QueryWrapper<Administer> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("role", "1");
            List<Administer> admins = administerMapper.selectList(queryWrapper);
            
            // 获取要删除的管理员
            Administer administer = administerMapper.selectById(id);
            
            // 如果要删除的是系统管理员，且系统中只有一个系统管理员，则不允许删除
            if (administer != null && "1".equals(administer.getRole()) && admins.size() <= 1) {
                return "error: 系统中必须保留至少一个系统管理员";
            }
            
            administerMapper.deleteById(id);
            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error: " + e.getMessage();
        }
    }
    
    // 重置密码
    @PostMapping("/administrator/resetPassword")
    public String resetPassword(@RequestBody Map<String, Object> param) {
        try {
            Integer id = Integer.parseInt(param.get("id").toString());
            String newPassword = param.get("newPassword").toString();
            
            Administer administer = administerMapper.selectById(id);
            if (administer != null) {
                administer.setPassword(newPassword);
                administerMapper.updateById(administer);
                return "success";
            } else {
                return "error: 管理员不存在";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "error: " + e.getMessage();
        }
    }
} 