package com.example.demo;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("user_locations")
public class UserLocation {
    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    @TableField("latitude")
    private Double latitude;

    @TableField("longitude")
    private Double longitude;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private java.sql.Timestamp updatedAt;
}