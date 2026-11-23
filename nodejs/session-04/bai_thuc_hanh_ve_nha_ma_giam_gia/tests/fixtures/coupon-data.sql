-- Dữ liệu bổ sung cho mô-đun mã giảm giá. Nạp SAU db/schema.sql, db/seed.sql và src/sql/coupon_tables.sql.
-- Không sửa tệp này: test và kết quả trong đề bài đều tính trên đúng dữ liệu dưới đây.

-- Danh mục Gia dụng chưa có sản phẩm, hai khách hàng mới.
INSERT INTO categories (id, name) VALUES (4, 'Gia dụng');

INSERT INTO users (id, email, full_name) VALUES
    (4, 'khoa@rikkei.shop', 'Lê Minh Khoa'),
    (5, 'ha@rikkei.shop', 'Phạm Thu Hà');

-- Sáu đơn mới. Đơn 5 của khách vãng lai nên user_id là NULL.
INSERT INTO orders (id, user_id, total) VALUES
    (4, 4, 930000),
    (5, NULL, 800000),
    (6, 3, 320000),
    (7, 5, 398000),
    (8, 2, 1089000),
    (9, 5, 210000);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
    (6, 4, 1, 1, 450000),
    (7, 4, 5, 3, 160000),
    (8, 5, 7, 1, 590000),
    (9, 5, 8, 1, 210000),
    (10, 6, 6, 1, 320000),
    (11, 7, 3, 2, 199000),
    (12, 8, 2, 1, 890000),
    (13, 8, 3, 1, 199000),
    (14, 9, 8, 1, 210000);

-- Sáu mã giảm giá: SUMMER20 đã hết hạn, FLASH5 đã dùng hết lượt, NEWBIE chưa ai dùng.
INSERT INTO coupons (id, code, discount_type, discount_value, max_uses, used_count, expires_at) VALUES
    (1, 'TECH10', 'percent', 10, 5, 2, '2099-12-31 23:59:59'),
    (2, 'BOOK50K', 'amount', 50000, 3, 1, '2099-06-30 23:59:59'),
    (3, 'SUMMER20', 'percent', 20, 5, 1, '2024-08-31 23:59:59'),
    (4, 'ALL100K', 'amount', 100000, 2, 1, '2099-12-31 23:59:59'),
    (5, 'NEWBIE', 'amount', 30000, 10, 0, '2099-12-31 23:59:59'),
    (6, 'FLASH5', 'percent', 5, 1, 1, '2099-12-31 23:59:59');

-- Danh mục: 1 Điện tử, 2 Thời trang, 3 Sách, 4 Gia dụng.
INSERT INTO coupon_categories (coupon_id, category_id) VALUES
    (1, 1),
    (2, 3),
    (3, 2),
    (4, 1), (4, 2), (4, 3),
    (5, 2), (5, 4),
    (6, 1);

-- Sáu lượt áp mã đã có; tiền giảm chỉ tính trên các dòng hàng thuộc danh mục của mã.
INSERT INTO coupon_redemptions (id, coupon_id, order_id, discount_amount, redeemed_at) VALUES
    (1, 1, 1, 90000, '2026-11-02 09:15:00'),
    (2, 2, 2, 50000, '2026-11-03 10:00:00'),
    (3, 1, 3, 153000, '2026-11-05 14:30:00'),
    (4, 4, 5, 100000, '2026-11-05 14:30:00'),
    (5, 6, 6, 16000, '2026-11-06 08:00:00'),
    (6, 3, 8, 39800, '2024-08-15 20:00:00');
