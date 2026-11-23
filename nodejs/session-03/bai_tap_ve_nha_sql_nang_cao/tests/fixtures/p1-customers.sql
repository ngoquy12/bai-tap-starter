-- Dữ liệu bổ sung cho bài P1: ba khách mới, bốn đơn hàng (đơn 7 của khách vãng lai).
-- Hai đơn của Phạm Thu Hà mua Quần jeans giá khuyến mãi 550.000 đồng.
INSERT INTO users (id, email, full_name) VALUES
    (4, 'khoa@rikkei.shop', 'Lê Minh Khoa'),
    (5, 'ha@rikkei.shop', 'Phạm Thu Hà'),
    (6, 'minh@rikkei.shop', 'Đỗ Quang Minh');

INSERT INTO orders (id, user_id, total) VALUES
    (4, 4, 1100000), (5, 5, 550000), (6, 5, 550000), (7, NULL, 160000);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
    (6, 4, 2, 1, 890000),
    (7, 4, 8, 1, 210000),
    (8, 5, 7, 1, 550000),
    (9, 6, 7, 1, 550000),
    (10, 7, 5, 1, 160000);
