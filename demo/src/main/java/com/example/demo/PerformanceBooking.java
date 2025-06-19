package com.example.demo;

import com.alibaba.excel.annotation.ExcelProperty;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("performance_bookings")
public class PerformanceBooking {

    @TableId(type = IdType.AUTO)
    @ExcelProperty("预订ID")
    private Long id;

    @ExcelProperty("用户ID")
    private int userId;

    @ExcelProperty("表演ID")
    private Long performanceId;

    @ExcelProperty("预订状态")
    private String status;

    @ExcelProperty("预订时间")
    private LocalDateTime bookingTime;

    @ExcelProperty("创建时间")
    private LocalDateTime createdAt;

    @ExcelProperty("更新时间")
    private LocalDateTime updatedAt;
}
