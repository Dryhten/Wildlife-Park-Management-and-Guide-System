package com.example.demo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("user_preferences")
public class UserPreferences {
    @TableId(type = IdType.AUTO)
    private Long id;
    private int userId;
    private Boolean isPersonalized;
    private String transportMode;
    private String favoriteAnimals; // JSON数组的字符串表示
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 