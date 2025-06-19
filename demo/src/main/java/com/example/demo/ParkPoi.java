package com.example.demo;

import lombok.Data;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;

@Data
@TableName("park_poi")
public class ParkPoi {

    @TableId
    private String id;
    
    private String name;
    
    private Double latitude;
    
    private Double longitude;
    
    private String category;
    
    private String address;

    @TableField("zoo_id")
    private Integer zooId;
} 