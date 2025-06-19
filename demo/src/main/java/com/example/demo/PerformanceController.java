package com.example.demo;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import org.springframework.web.bind.annotation.GetMapping;
import com.alibaba.excel.EasyExcel;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;

@RestController
@RequestMapping("/api/admin/performance") // 表演管理接口路径
public class PerformanceController {
    private static final Logger logger = LoggerFactory.getLogger(PerformanceController.class);

    @Autowired
    private PerformanceMapper performanceMapper;

    // 添加表演
    @PostMapping("/add")
    public String addPerformance(@RequestBody Performance performance) {
        System.out.println("Received performance: " + performance);
        try {
            performanceMapper.insert(performance);
            return "success";
        } catch (Exception e) {
            logger.error("Error adding performance", e);
            return "error";
        }
    }

    // 分页获取表演列表
    @GetMapping("/list")
    public Page<Performance> getPerformanceList(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer parkId,
            @RequestParam(required = false) Integer status) {
        Page<Performance> page = new Page<>(current, size);
        QueryWrapper<Performance> queryWrapper = new QueryWrapper<>();
        
        if (title != null && !title.isEmpty()) {
            queryWrapper.like("title", title);
        }
        if (parkId != null) {
            queryWrapper.eq("park_id", parkId);
        }
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        
        return performanceMapper.selectPage(page, queryWrapper);
    }

    // 删除表演
    @PostMapping("/delete")
    public String deletePerformance(@RequestBody Performance performance) {
        try {
            performanceMapper.deleteById(performance.getId());
            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }

    // 更新表演
    @PostMapping("/update")
    public String updatePerformance(@RequestBody Performance performance) {
        try {
            performanceMapper.updateById(performance);
            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }

    // 下载表演信息 Excel 文件
    @GetMapping("/download")
    public void download(HttpServletResponse response) {
        try {
            // 查询所有表演数据
            List<Performance> performances = performanceMapper.selectList(null);

            // 设置响应头
            response.setContentType("application/vnd.ms-excel");
            response.setCharacterEncoding("UTF-8");
            String fileName = URLEncoder.encode("表演信息", "UTF-8");
            response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");

            // 使用 EasyExcel 写入数据到 Excel 文件
            EasyExcel.write(response.getOutputStream(), Performance.class)
                    .sheet("表演信息")
                    .doWrite(performances);
        } catch (IOException e) {
            e.printStackTrace();
            try {
                response.getWriter().write("文件下载失败，服务器错误");
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }

    @GetMapping("/performances")
    public List<Performance> getPerformances() {
        return performanceMapper.selectList(null);
    }
}
