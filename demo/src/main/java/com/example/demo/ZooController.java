package com.example.demo;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
@RequestMapping("/api/admin/zoo")
public class ZooController {
    private static final Logger logger = LoggerFactory.getLogger(ZooController.class);

    @Resource
    private ZooMapper zooMapper;

    // 添加动物园
    @PostMapping("/add")
    public Map<String, Object> addZoo(@RequestBody Zoo zoo) {
        Map<String, Object> result = new HashMap<>();
        try {
            zooMapper.insert(zoo);
            result.put("success", true);
            result.put("message", "添加成功");
        } catch (Exception e) {
            logger.error("Error adding zoo", e);
            result.put("success", false);
            result.put("message", "添加失败: " + e.getMessage());
        }
        return result;
    }

    // 获取动物园列表
    @GetMapping("/list")
    public Map<String, Object> getZooList(
            @RequestParam(required = false) Integer current,
            @RequestParam(required = false) Integer size) {
        Map<String, Object> result = new HashMap<>();
        try {
            if (current != null && size != null) {
                // 分页查询
                Page<Zoo> page = new Page<>(current, size);
                Page<Zoo> zooPage = zooMapper.selectPage(page, null);
                result.put("data", zooPage);
            } else {
                // 不分页，返回所有数据
                List<Zoo> zoos = zooMapper.selectList(null);
                result.put("data", zoos);
            }
            result.put("success", true);
        } catch (Exception e) {
            logger.error("获取动物园列表失败", e);
            result.put("success", false);
            result.put("message", "获取动物园列表失败: " + e.getMessage());
        }
        return result;
    }

    // 删除动物园
    @PostMapping("/delete")
    public Map<String, Object> deleteZoo(@RequestBody Zoo zoo) {
        Map<String, Object> result = new HashMap<>();
        try {
            zooMapper.deleteById(zoo.getId());
            result.put("success", true);
            result.put("message", "删除成功");
        } catch (Exception e) {
            logger.error("删除动物园失败", e);
            result.put("success", false);
            result.put("message", "删除失败: " + e.getMessage());
        }
        return result;
    }

    // 更新动物园
    @PostMapping("/update")
    public Map<String, Object> updateZoo(@RequestBody Zoo zoo) {
        Map<String, Object> result = new HashMap<>();
        try {
            zooMapper.updateById(zoo);
            result.put("success", true);
            result.put("message", "更新成功");
        } catch (Exception e) {
            logger.error("更新动物园失败", e);
            result.put("success", false);
            result.put("message", "更新失败: " + e.getMessage());
        }
        return result;
    }

    // 下载动物园信息 Excel 文件
    @GetMapping("/download")
    public void download(HttpServletResponse response) {
        try {
            List<Zoo> zoos = zooMapper.selectList(null);

            response.setContentType("application/vnd.ms-excel");
            response.setCharacterEncoding("UTF-8");
            String fileName = URLEncoder.encode("动物园信息", "UTF-8");
            response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");

            EasyExcel.write(response.getOutputStream(), Zoo.class)
                    .sheet("动物园信息")
                    .doWrite(zoos);
        } catch (IOException e) {
            e.printStackTrace();
            try {
                response.getWriter().write("文件下载失败，服务器错误");
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }

    @GetMapping("/{id}")
    public Map<String, Object> getZooById(@PathVariable Integer id) {
        Map<String, Object> result = new HashMap<>();
        try {
            Zoo zoo = zooMapper.selectById(id);
            if (zoo == null) {
                result.put("success", false);
                result.put("message", "动物园不存在");
                return result;
            }
            
            result.put("success", true);
            result.put("data", zoo);
        } catch (Exception e) {
            logger.error("获取动物园详情失败", e);
            result.put("success", false);
            result.put("message", "获取动物园详情失败: " + e.getMessage());
        }
        return result;
    }
} 