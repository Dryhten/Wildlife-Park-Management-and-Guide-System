package com.example.demo;

import com.alibaba.excel.annotation.ExcelProperty;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("bookings")
public class Booking {

    @TableId(type = IdType.AUTO)
    @ExcelProperty("预约ID")
    private Integer id;

    @ExcelProperty("用户ID")
    private Integer userId;

    @TableField(exist = false)
    @ExcelProperty("用户名称")
    private String userName;

    @ExcelProperty("园区ID")
    private Integer parkId;

    @TableField(exist = false)
    @ExcelProperty("园区名称")
    private String parkName;

    @ExcelProperty("预约时间")
    private LocalDateTime bookingTime;

    @ExcelProperty("预约状态")
    private String status;

}
