package com.example.demo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import java.time.LocalDateTime;

@TableName("park_geometries")
public class ParkGeometry {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    
    @TableField("park_id")
    private Integer parkId;
    
    @TableField("geometry")
    private String geometry;
    
    @TableField("created_at")
    private LocalDateTime createdAt;
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public Integer getParkId() {
        return parkId;
    }
    
    public void setParkId(Integer parkId) {
        this.parkId = parkId;
    }
    
    public String getGeometry() {
        return geometry;
    }
    
    public void setGeometry(String geometry) {
        this.geometry = geometry;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 