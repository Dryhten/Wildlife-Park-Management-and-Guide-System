-- 删除原有的唯一索引
DROP INDEX idx_orders_order_number ON orders;

-- 重新创建普通索引
CREATE INDEX idx_orders_order_number ON orders(order_number); 