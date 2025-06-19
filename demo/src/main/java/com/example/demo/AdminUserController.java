package com.example.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
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

@RestController
@RequestMapping("/api/admin/user") // 用户管理接口路径
public class AdminUserController {
    private static final Logger logger = LoggerFactory.getLogger(AdminUserController.class);

    @Resource
    private UserMapper userMapper;

    // 添加用户
    @PostMapping("/add")
    public String addUser(@RequestBody User user) {
        System.out.println("Received user: " + user);
        try {
            userMapper.insert(user);
            return "success";
        } catch (Exception e) {
            logger.error("Error adding user", e);
            return "error";
        }
    }

    // 分页获取用户列表
    @GetMapping("/list")
    public Map<String, Object> getUserList(
            @RequestParam(value = "current", defaultValue = "1") Integer current,
            @RequestParam(value = "size", defaultValue = "10") Integer size,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "phone", required = false) String phone
    ) {
        Page<User> page = new Page<>(current, size);

        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        if (name != null && !name.trim().isEmpty()) {
            queryWrapper.like("name", name);
        }
        if (phone != null && !phone.trim().isEmpty()) {
            queryWrapper.like("phone", phone);
        }

        // 执行分页查询
        Page<User> userPage = userMapper.selectPage(page, queryWrapper);

        // 添加日志来调试查询条件和分页参数
        logger.info("QueryWrapper: {}", queryWrapper.getSqlSegment());
        logger.info("Page: {}", userPage);

        Map<String, Object> result = new HashMap<>();
        result.put("data", userPage.getRecords());
        result.put("total", userPage.getTotal());
        result.put("current", userPage.getCurrent());
        result.put("size", userPage.getSize());

        return result;
    }

    // 删除用户
    @PostMapping("/delete")
    public String deleteUser(@RequestBody User user) {
        userMapper.deleteById(user.getId());
        return "success";
    }

    // 更新用户
    @PostMapping("/update")
    public String updateUser(@RequestBody User user) {
        try {
            // 去除 preference 字段中的多余反斜杠
            if (user.getPreference() != null) {
                user.setPreference(user.getPreference().replaceAll("\\\\", ""));
            }
            userMapper.updateById(user);
            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }

    // 下载用户信息 Excel 文件
    @GetMapping("/download")
    public void download(HttpServletResponse response) {
        try {
            // 查询所有用户数据
            List<User> users = userMapper.selectList(null);

            // 设置响应头
            response.setContentType("application/vnd.ms-excel");
            response.setCharacterEncoding("UTF-8");
            String fileName = URLEncoder.encode("用户信息", "UTF-8");
            response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");

            // 使用 EasyExcel 写入数据到 Excel 文件
            EasyExcel.write(response.getOutputStream(), User.class)
                    .sheet("用户信息")
                    .doWrite(users);
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
