-- Rikkei Shop cho phần SQL nâng cao: dữ liệu mẫu.
INSERT INTO categories (id, name) VALUES
    (1, 'Điện tử'), (2, 'Thời trang'), (3, 'Sách');

INSERT INTO products (id, category_id, name, price, stock) VALUES
    (1, 1, 'Tai nghe Bluetooth', 450000, 25),
    (2, 1, 'Bàn phím cơ', 890000, 12),
    (3, 2, 'Áo thun', 199000, 50),
    (4, 2, 'Giày chạy bộ', 1250000, 0),
    (5, 3, 'Sách Lập trình', 160000, 30),
    (6, 1, 'Chuột không dây', 320000, 40),
    (7, 2, 'Quần jeans', 590000, 18),
    (8, 3, 'Sách Cơ sở dữ liệu', 210000, 22);

INSERT INTO users (id, email, full_name) VALUES
    (1, 'admin@rikkei.shop', 'Quản trị Rikkei'),
    (2, 'lan@rikkei.shop', 'Nguyễn Thị Lan'),
    (3, 'hung@rikkei.shop', 'Trần Văn Hùng');

INSERT INTO user_profiles (id, user_id, phone, address) VALUES
    (1, 2, '0901234567', 'Cầu Giấy, Hà Nội'),
    (2, 3, '0912345678', 'Hải Châu, Đà Nẵng');

INSERT INTO tags (id, name) VALUES
    (1, 'Bán chạy'), (2, 'Giảm giá'), (3, 'Hàng mới');

INSERT INTO product_tags (product_id, tag_id) VALUES
    (1, 1), (1, 2), (2, 1), (3, 2), (6, 2), (6, 3), (8, 3);

INSERT INTO orders (id, user_id, total) VALUES
    (1, 2, 1099000), (2, 2, 160000), (3, 3, 1530000);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 1, 2, 450000),
    (2, 1, 3, 1, 199000),
    (3, 2, 5, 1, 160000),
    (4, 3, 2, 1, 890000),
    (5, 3, 6, 2, 320000);
