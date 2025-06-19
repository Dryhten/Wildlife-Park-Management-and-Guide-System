package com.example.demo;

import com.alibaba.excel.annotation.ExcelProperty;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("users")
public class User {

    @TableId(type = IdType.AUTO)
    @ExcelProperty("用户ID")
    private int id;

    @ExcelProperty("用户名")
    private String name;

    @ExcelProperty("真实姓名")
    private String realName;

    @ExcelProperty("手机号")
    private String phone;

    @ExcelProperty("微信openid")
    private String openid;

    @ExcelProperty("微信session_key")
    private String sessionKey;

    @ExcelProperty("用户偏好")
    @TableField(typeHandler = JacksonTypeHandler.class) // 指定类型处理器
    private String preference;

    @ExcelProperty("性别")
    private String gender;

    @ExcelProperty("身份证号")
    private String idNumber;

    @ExcelProperty("创建时间")
    private LocalDateTime createdAt;

    @ExcelProperty("当前动物园ID")
    @TableField("current_zoo_id")
    private Integer currentZooId;
}