-- Dữ liệu bổ sung cho Lab 3: danh mục Gia dụng chưa có sản phẩm, đơn 4 (Hùng) và đơn 5 (Lan).
-- Sau khối này Thời trang có Giày chạy bộ và Quần jeans cùng bán 1 chiếc (đồng hạng 2).
INSERT INTO categories (id, name) VALUES (4, 'Gia dụng');
INSERT INTO orders (id, user_id, total) VALUES
    (4, 3, 789000), (5, 2, 1670000);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
    (6, 4, 3, 1, 199000),
    (7, 4, 7, 1, 590000),
    (8, 5, 4, 1, 1250000),
    (9, 5, 8, 2, 210000);
