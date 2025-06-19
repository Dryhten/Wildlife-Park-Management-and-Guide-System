package com.example.demo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("user_preferences")
public class UserPreference {
    @TableId(type = IdType.AUTO)
    private Long id;
    private int userId;
    private Boolean isPersonalized;
    private String transportMode;
    private String favoriteAnimals;  // JSON string
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 