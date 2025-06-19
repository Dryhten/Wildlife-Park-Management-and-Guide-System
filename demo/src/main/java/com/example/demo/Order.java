package com.example.demo;

import com.alibaba.excel.annotation.ExcelProperty;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@TableName("orders")
public class Order {

    @TableId(type = IdType.AUTO)
    @ExcelProperty("订单ID")
    private Integer id;

    @TableField("order_number")
    @ExcelProperty("订单号")
    private String orderNumber;

    @TableField("user_id")
    @ExcelProperty("用户ID")
    private Integer userId;

    @TableField("item_name")
    @ExcelProperty("商品名称")
    private String itemName;

    @TableField("quantity")
    @ExcelProperty("数量")
    private int quantity;

    @TableField("total_amount")
    @ExcelProperty("总金额")
    private BigDecimal totalAmount;

    @TableField("contact_name")
    @ExcelProperty("联系人姓名")
    private String contactName;

    @TableField("contact_phone")
    @ExcelProperty("联系人电话")
    private String contactPhone;

    @TableField("status")
    @ExcelProperty("订单状态")
    private String status;

    @TableField("created_at")
    @ExcelProperty("创建时间")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    @ExcelProperty("更新时间")
    private LocalDateTime updatedAt;

    @TableField("visit_date")
    @ExcelProperty("观园日期")
    private LocalDate visitDate;
} 