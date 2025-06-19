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
import java.time.LocalDateTime;
import org.springframework.web.bind.annotation.GetMapping;
import com.alibaba.excel.EasyExcel;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;

@RestController
@RequestMapping("/api/admin/bookings") // 预约管理接口路径
public class BookingController {
    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    @Resource
    private BookingMapper bookingMapper;
    @Resource
    private UserMapper userMapper;
    @Resource
    private ParkMapper parkMapper;

    // 添加预约
    @PostMapping("/add")
    public String addBooking(@RequestBody Booking booking) {
        try {
            // 获取用户名称
            User user = userMapper.selectById(booking.getUserId());
            if (user != null) {
                booking.setUserName(user.getName());
            } else {
                return "error: 用户不存在";
            }

            // 获取园区名称
            Park park = parkMapper.selectById(booking.getParkId());
            if (park != null) {
                booking.setParkName(park.getName());
            } else {
                return "error: 园区不存在";
            }

            bookingMapper.insert(booking);
            return "success";
        } catch (Exception e) {
            logger.error("Error adding booking", e);
            return "error";
        }
    }

    // 分页获取预约列表
    @GetMapping("/list")
    public Page<Booking> bookingList(
            @RequestParam(value = "current", defaultValue = "1") Long current,
            @RequestParam(value = "size", defaultValue = "10") Long size,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "parkId", required = false) Long parkId
    ) {
        Page<Booking> page = new Page<>(current, size);

        QueryWrapper<Booking> queryWrapper = new QueryWrapper<>();
        if (userId != null) {
            queryWrapper.eq("user_id", userId);
        }
        if (parkId != null) {
            queryWrapper.eq("park_id", parkId);
        }
        Page<Booking> bookingPage = bookingMapper.selectPage(page, queryWrapper);

        // 填充用户名称和园区名称
        bookingPage.getRecords().forEach(booking -> {
            User user = userMapper.selectById(booking.getUserId());
            Park park = parkMapper.selectById(booking.getParkId());
            if (user != null) {
                booking.setUserName(user.getName());
            }
            if (park != null) {
                booking.setParkName(park.getName());
            }
        });

        return bookingPage;
    }

    // 删除预约
    @PostMapping("/delete")
    public String deleteBooking(@RequestBody Booking booking) {
        bookingMapper.deleteById(booking.getId());
        return "success";
    }

    // 更新预约
    @PostMapping("/update")
    public String updateBooking(@RequestBody Booking booking) {
        try {
            // 获取用户名称
            User user = userMapper.selectById(booking.getUserId());
            if (user != null) {
                booking.setUserName(user.getName());
            } else {
                return "error: 用户不存在";
            }

            // 获取园区名称
            Park park = parkMapper.selectById(booking.getParkId());
            if (park != null) {
                booking.setParkName(park.getName());
            } else {
                return "error: 园区不存在";
            }

            bookingMapper.updateById(booking);
            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }

    // 下载预约信息 Excel 文件
    @GetMapping("/download")
    public void download(HttpServletResponse response) {
        try {
            // 查询所有预约数据
            List<Booking> bookings = bookingMapper.selectList(null);

            // 填充用户名称和园区名称
            bookings.forEach(booking -> {
                User user = userMapper.selectById(booking.getUserId());
                Park park = parkMapper.selectById(booking.getParkId());
                if (user != null) {
                    booking.setUserName(user.getName());
                }
                if (park != null) {
                    booking.setParkName(park.getName());
                }
            });

            // 设置响应头
            response.setContentType("application/vnd.ms-excel");
            response.setCharacterEncoding("UTF-8");
            String fileName = URLEncoder.encode("预约信息", "UTF-8");
            response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");

            // 使用 EasyExcel 写入数据到 Excel 文件
            EasyExcel.write(response.getOutputStream(), Booking.class)
                    .sheet("预约信息")
                    .doWrite(bookings);
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
