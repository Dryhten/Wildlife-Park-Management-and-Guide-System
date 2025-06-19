package com.example.demo;

import lombok.Data;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import java.time.LocalDateTime;

@Data
@TableName("danger_zones")
public class DangerZone {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String name;
    private String description;
    private String geometry;
    private Integer riskLevel;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
} 