package com.example.demo;

import com.alibaba.excel.annotation.ExcelProperty;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("zoos")
public class Zoo {

    @TableId(type = IdType.AUTO)
    @ExcelProperty("动物园ID")
    private Integer id;

    @ExcelProperty("动物园名称")
    private String name;

    @ExcelProperty("所在城市")
    private String city;

    @ExcelProperty("详细地址")
    private String address;

    @ExcelProperty("开放时间")
    private String openingHours;

    @ExcelProperty("联系电话")
    private String contactPhone;

    @ExcelProperty("动物园简介")
    private String description;

    @ExcelProperty("创建时间")
    private LocalDateTime createdAt;

    @ExcelProperty("更新时间")
    private LocalDateTime updatedAt;
} 