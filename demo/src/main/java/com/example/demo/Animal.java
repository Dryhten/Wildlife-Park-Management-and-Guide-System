package com.example.demo;

import com.alibaba.excel.annotation.ExcelProperty;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("animals")
public class Animal {

    @TableId(type = IdType.AUTO)
    @ExcelProperty("动物ID")
    private Integer id;

    @ExcelProperty("动物名称")
    private String name;

    @ExcelProperty("动物英文名称")
    private String englishName;

    @ExcelProperty("动物拉丁学名")
    private String scientificName;

    @ExcelProperty("栖息地")
    private String habitat;

    @ExcelProperty("习性")
    private String behavior;

    @ExcelProperty("保护状态")
    private String conservationStatus;

    @ExcelProperty("动物介绍")
    private String description;

    @ExcelProperty("创建时间")
    private LocalDateTime createdAt;
}
