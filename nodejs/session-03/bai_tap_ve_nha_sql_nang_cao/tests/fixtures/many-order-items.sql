-- Dữ liệu bổ sung cho bài P2: mỗi đơn 4 đến 20003 có một dòng đơn (sản phẩm 1 đến 8, số lượng 1 đến 5).
-- Chạy sau tests/fixtures/many-orders.sql. Bài P2 chỉ đo kế hoạch đọc nên không khớp lại orders.total.
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT id, 1 + id % 8, 1 + (id * 7) % 5, 100000
FROM orders
WHERE id > 3;
ANALYZE TABLE order_items;
