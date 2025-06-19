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
@RequestMapping("/api/admin/park")
public class ParkController {
    private static final Logger logger = LoggerFactory.getLogger(ParkController.class);

    @Resource
    private ParkMapper parkMapper;

    @Resource
    private ParkGeometryMapper parkGeometryMapper;

    @Resource
    private ZooMapper zooMapper;

    // 添加园区
    @PostMapping("/add")
    public Map<String, Object> addPark(@RequestBody Park park) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 验证动物园是否存在
            Zoo zoo = zooMapper.selectById(park.getZooId());
            if (zoo == null) {
                result.put("success", false);
                result.put("message", "所选动物园不存在");
                return result;
            }

            parkMapper.insert(park);
            result.put("success", true);
            result.put("message", "添加成功");
        } catch (Exception e) {
            logger.error("Error adding park", e);
            result.put("success", false);
            result.put("message", "添加失败: " + e.getMessage());
        }
        return result;
    }

    // 分页获取园区列表
    @GetMapping("/list")
    public Map<String, Object> getParkList(
            @RequestParam(required = false) Integer current,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer zooId) {
        Map<String, Object> result = new HashMap<>();
        try {
            Page<Park> page = new Page<>(current != null ? current : 1, size != null ? size : 10);
            QueryWrapper<Park> queryWrapper = new QueryWrapper<>();
            
            // 如果指定了动物园ID，则只查询该动物园的园区
            if (zooId != null) {
                queryWrapper.eq("zoo_id", zooId);
            }
            
            Page<Park> parkPage = parkMapper.selectPage(page, queryWrapper);
            
            result.put("success", true);
            result.put("data", parkPage);
            return result;
        } catch (Exception e) {
            logger.error("获取园区列表失败", e);
            result.put("success", false);
            result.put("message", "获取园区列表失败: " + e.getMessage());
            return result;
        }
    }

    // 删除园区
    @PostMapping("/delete")
    public Map<String, Object> deletePark(@RequestBody Park park) {
        Map<String, Object> result = new HashMap<>();
        try {
            parkMapper.deleteById(park.getId());
            result.put("success", true);
            result.put("message", "删除成功");
        } catch (Exception e) {
            logger.error("删除园区失败", e);
            result.put("success", false);
            result.put("message", "删除失败: " + e.getMessage());
        }
        return result;
    }

    // 更新园区
    @PostMapping("/update")
    public Map<String, Object> updatePark(@RequestBody Park park) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 验证动物园是否存在
            if (park.getZooId() != null) {
                Zoo zoo = zooMapper.selectById(park.getZooId());
                if (zoo == null) {
                    result.put("success", false);
                    result.put("message", "所选动物园不存在");
                    return result;
                }
            }

            parkMapper.updateById(park);
            result.put("success", true);
            result.put("message", "更新成功");
        } catch (Exception e) {
            logger.error("更新园区失败", e);
            result.put("success", false);
            result.put("message", "更新失败: " + e.getMessage());
        }
        return result;
    }

    // 下载园区信息 Excel 文件
    @GetMapping("/download")
    public void download(HttpServletResponse response) {
        try {
            List<Park> parks = parkMapper.selectList(null);

            response.setContentType("application/vnd.ms-excel");
            response.setCharacterEncoding("UTF-8");
            String fileName = URLEncoder.encode("园区信息", "UTF-8");
            response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");

            EasyExcel.write(response.getOutputStream(), Park.class)
                    .sheet("园区信息")
                    .doWrite(parks);
        } catch (IOException e) {
            e.printStackTrace();
            try {
                response.getWriter().write("文件下载失败，服务器错误");
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }

    @GetMapping("/info/{parkId}")
    public Map<String, Object> getParkInfo(@PathVariable Integer parkId) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (parkId == null) {
                response.put("success", false);
                response.put("message", "园区ID不能为空");
                return response;
            }
            
            Park park = parkMapper.selectById(parkId);
            if (park != null) {
                // 获取所属动物园信息
                Zoo zoo = zooMapper.selectById(park.getZooId());
                Map<String, Object> parkInfo = new HashMap<>();
                parkInfo.put("park", park);
                parkInfo.put("zoo", zoo);
                
                response.put("success", true);
                response.put("data", parkInfo);
            } else {
                response.put("success", false);
                response.put("message", "未找到园区信息");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取园区信息失败: " + e.getMessage());
            logger.error("Error getting park info: ", e);
        }
        return response;
    }

    @GetMapping("/geometries")
    public Map<String, Object> getParkGeometries() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<ParkGeometry> geometries = parkGeometryMapper.selectList(null);
            logger.info("查询到 {} 条园区地理数据", geometries.size());
            
            // 转换 WKT 格式为 GeoJSON 格式
            geometries.forEach(geo -> {
                try {
                    // 输出调试信息
                    logger.info("处理园区数据 - parkId: {}, geometry: {}", geo.getParkId(), geo.getGeometry());
                    
                    if (geo.getGeometry() != null) {
                        String wkt = geo.getGeometry();
                        // 提取坐标对
                        String coordinates = wkt.substring(wkt.indexOf("((") + 2, wkt.indexOf("))"));
                        String[] points = coordinates.split(",");
                        
                        // 构建 GeoJSON 格式的坐标数组
                        StringBuilder jsonCoordinates = new StringBuilder("[");
                        for (int i = 0; i < points.length; i++) {
                            String[] coord = points[i].trim().split(" ");
                            jsonCoordinates.append("[")
                                         .append(coord[0])
                                         .append(",")
                                         .append(coord[1])
                                         .append("]");
                            if (i < points.length - 1) {
                                jsonCoordinates.append(",");
                            }
                        }
                        jsonCoordinates.append("]");
                        
                        // 设置转换后的 GeoJSON 格式数据
                        geo.setGeometry(jsonCoordinates.toString());
                    }
                } catch (Exception e) {
                    logger.error("Error converting WKT to GeoJSON for parkId {}: {}", geo.getParkId(), e.getMessage());
                    // 如果转换失败，设置一个空数组
                    geo.setGeometry("[]");
                }
            });
            
            // 再次检查并记录转换后的数据
            geometries.forEach(geo -> {
                logger.info("转换后的数据 - parkId: {}, geometry: {}", geo.getParkId(), geo.getGeometry());
            });
            
            response.put("success", true);
            response.put("data", geometries);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取园区地理范围失败: " + e.getMessage());
            logger.error("Error getting park geometries: ", e);
        }
        return response;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getParkById(@PathVariable Integer id) {
        Map<String, Object> result = new HashMap<>();
        try {
            Park park = parkMapper.selectById(id);
            if (park == null) {
                result.put("success", false);
                result.put("message", "园区不存在");
                return result;
            }
            
            result.put("success", true);
            result.put("data", park);
            return result;
        } catch (Exception e) {
            logger.error("获取园区详情失败", e);
            result.put("success", false);
            result.put("message", "获取园区详情失败: " + e.getMessage());
            return result;
        }
    }
}
