package com.example.demo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@TableName("performances")
public class Performance {
    @TableId(type = IdType.AUTO)
    private Integer id;
    
    private String title;
    
    private String duration;
    
    private String location;
    
    private String description;
    
    private String imageUrl;
    
    private Integer parkId;
    
    private LocalTime showTime;
    
    private LocalDate showDate;
    
    private Integer status;
    
    private Integer maxCapacity;
    
    private Integer currentBookings;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private String updatedBy;
}
