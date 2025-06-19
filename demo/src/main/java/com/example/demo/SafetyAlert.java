package com.example.demo;

import com.alibaba.excel.annotation.ExcelProperty;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("safety_alerts")
public class SafetyAlert {

    @TableId(type = IdType.AUTO)
    @ExcelProperty("预警ID")
    private int id;

    @ExcelProperty("用户ID")
    private int userId;

    @TableField(exist = false)
    @ExcelProperty("用户名称")
    private String userName;

    @ExcelProperty("危险区域ID")
    private int zoneId;

    @TableField(exist = false)
    @ExcelProperty("危险区域名称")
    private String dangerZoneName;

    @TableField(exist = false)
    @ExcelProperty("风险级别")
    private Integer riskLevel;

    @ExcelProperty("预警时间")
    private LocalDateTime alertTime;

    @ExcelProperty("预警状态")
    private String status;

    @ExcelProperty("更新时间")
    private LocalDateTime updatedAt;

    @ExcelProperty("更新者")
    private String updatedBy;
}
