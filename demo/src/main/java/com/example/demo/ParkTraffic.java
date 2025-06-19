package com.example.demo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("park_traffic")
public class ParkTraffic {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Integer parkId;
    private Integer currentPeople;
    private Integer queuePeople;
    private LocalDateTime updatedAt;
} 