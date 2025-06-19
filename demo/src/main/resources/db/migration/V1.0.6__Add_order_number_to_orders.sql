-- 添加order_number字段
ALTER TABLE orders ADD COLUMN order_number VARCHAR(50) NOT NULL COMMENT '订单号' AFTER id;

-- 为order_number创建唯一索引
CREATE UNIQUE INDEX idx_orders_order_number ON orders(order_number);

-- 更新现有订单的order_number
UPDATE orders SET order_number = CONCAT('ORD', LPAD(id, 8, '0')) WHERE order_number IS NULL OR order_number = ''; 