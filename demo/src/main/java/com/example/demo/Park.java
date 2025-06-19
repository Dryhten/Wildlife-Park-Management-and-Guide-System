package com.example.demo;

import com.alibaba.excel.annotation.ExcelProperty;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
class AnimalDistribution {
    private List<String> animals;
    private List<String> regions;
}

@Data
@TableName(value = "parks", autoResultMap = true)
public class Park {

    @TableId(type = IdType.AUTO)
    @ExcelProperty("园区ID")
    private Integer id;

    @TableField("zoo_id")
    @ExcelProperty("所属动物园ID")
    private Integer zooId;

    @ExcelProperty("园区名称")
    private String name;

    @ExcelProperty("背景信息")
    private String background;

    @ExcelProperty("特色景点")
    private String features;

    @ExcelProperty("动物分布")
    @TableField(typeHandler = JacksonTypeHandler.class)
    private AnimalDistribution animalDistribution;

    @ExcelProperty("语音播报介绍")
    private String audioGuide;

    @ExcelProperty("创建时间")
    private LocalDateTime createdAt;
}
