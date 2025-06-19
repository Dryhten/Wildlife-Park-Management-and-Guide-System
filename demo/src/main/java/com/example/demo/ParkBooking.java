package com.example.demo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("bookings")
public class ParkBooking {
    @TableId(type = IdType.AUTO)
    private Long id;
    private int userId;
    private Long parkId;
    private LocalDateTime bookingTime;
    private String status;
} 