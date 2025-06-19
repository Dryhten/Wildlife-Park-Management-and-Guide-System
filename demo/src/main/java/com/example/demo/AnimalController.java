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
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.AnimalMapper;


@RestController
@RequestMapping("/api/admin/animal") // 动物管理接口路径
public class AnimalController {
    private static final Logger logger = LoggerFactory.getLogger(AnimalController.class);

    @Autowired
    @Resource
    private AnimalMapper animalMapper;


    // 添加动物
    @PostMapping("/add")
    public String addAnimal(@RequestBody Animal animal) {
        System.out.println("Received animal: " + animal);
        try {
            animalMapper.insert(animal);
            return "success";
        } catch (Exception e) {
            logger.error("Error adding animal", e);
            return "error";
        }
    }

    // 分页获取动物列表
    @GetMapping("/list")
    public Map<String, Object> getAnimalList(
            @RequestParam(value = "current", defaultValue = "1") Integer current,
            @RequestParam(value = "size", defaultValue = "10") Integer size
    ) {
        Map<String, Object> result = new HashMap<>();
        try {
            Page<Animal> page = new Page<>(current, size);
            QueryWrapper<Animal> queryWrapper = new QueryWrapper<>();
            Page<Animal> pageResult = animalMapper.selectPage(page, queryWrapper);
            
            result.put("success", true);
            result.put("data", pageResult.getRecords());
            result.put("total", pageResult.getTotal());
            result.put("pages", pageResult.getPages());
            result.put("current", pageResult.getCurrent());
            result.put("size", pageResult.getSize());
        } catch (Exception e) {
            logger.error("获取动物列表失败", e);
            result.put("success", false);
            result.put("message", "获取动物列表失败: " + e.getMessage());
        }
        return result;
    }

    // 删除动物
    @PostMapping("/delete")
    public String deleteAnimal(@RequestBody Animal animal) {
        animalMapper.deleteById(animal.getId());
        return "success";
    }

    // 更新动物
    @PostMapping("/update")
    public String updateAnimal(@RequestBody Animal animal) {
        try {
            animalMapper.updateById(animal);
            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }

    // 下载动物信息 Excel 文件
    @GetMapping("/download")
    public void download(HttpServletResponse response) {
        try {
            // 查询所有动物数据
            List<Animal> animals = animalMapper.selectList(null);

            // 设置响应头
            response.setContentType("application/vnd.ms-excel");
            response.setCharacterEncoding("UTF-8");
            String fileName = URLEncoder.encode("动物信息", "UTF-8");
            response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");

            // 使用 EasyExcel 写入数据到 Excel 文件
            EasyExcel.write(response.getOutputStream(), Animal.class)
                    .sheet("动物信息")
                    .doWrite(animals);
        } catch (IOException e) {
            e.printStackTrace();
            try {
                response.getWriter().write("文件下载失败，服务器错误");
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }

    @GetMapping("/statistics")
    public Map<String, Object> getAnimalStatistics() {
        Map<String, Object> result = new HashMap<>();
        // 1. 统计不同栖息地的动物数量
        List<Map<String, Object>> habitatData = animalMapper.selectMaps(
                new QueryWrapper<Animal>()
                        .select("habitat", "COUNT(*) as count")
                        .groupBy("habitat")
        );
        // 2. 保护状态频率统计
        List<Map<String, Object>> conservationStatusData = animalMapper.selectMaps(
                new QueryWrapper<Animal>()
                        .select("conservation_status as status", "COUNT(*) as count")
                        .groupBy("conservation_status")
        );
        // 封装数据
        result.put("habitatData", habitatData);
        result.put("conservationStatusData", conservationStatusData);
        return result;
    }

    @GetMapping("/info")
    public Map<String, Object> getAnimalInfo(@RequestParam String englishName) {
        logger.info("Searching for animal with English name: {}", englishName);
        
        Animal animal = animalMapper.selectOne(
            new QueryWrapper<Animal>()
                .eq("english_name", englishName)
        );
        
        Map<String, Object> response = new HashMap<>();
        if (animal != null) {
            response.put("success", true);
            response.put("data", animal);
        } else {
            response.put("success", false);
            response.put("message", "未找到该动物信息");
        }
        return response;
    }
}