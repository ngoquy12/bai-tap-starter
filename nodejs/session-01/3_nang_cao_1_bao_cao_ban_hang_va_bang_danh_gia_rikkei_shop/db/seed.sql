-- Rikkei Shop: dữ liệu mẫu. Mật khẩu mọi tài khoản: Matkhau123
INSERT INTO categories (id, name) VALUES
  (1, 'Điện tử'),
  (2, 'Thời trang'),
  (3, 'Sách');

INSERT INTO products (id, category_id, name, price, stock, created_at) VALUES
  (1, 1, 'Tai nghe Bluetooth', 450000, 25, '2026-08-01 09:00:00'),
  (2, 1, 'Bàn phím cơ', 890000, 12, '2026-08-02 09:00:00'),
  (3, 2, 'Áo thun', 199000, 50, '2026-08-03 09:00:00'),
  (4, 2, 'Giày chạy bộ', 1250000, 0, '2026-08-04 09:00:00'),
  (5, 3, 'Sách Lập trình', 160000, 30, '2026-08-05 09:00:00'),
  (6, 1, 'Chuột không dây', 320000, 40, '2026-08-06 09:00:00'),
  (7, 2, 'Quần jeans', 590000, 18, '2026-08-07 09:00:00'),
  (8, 3, 'Sách Cơ sở dữ liệu', 210000, 22, '2026-08-08 09:00:00');

INSERT INTO users (id, email, password_hash, full_name, role, created_at) VALUES
  (1, 'admin@rikkei.shop', '$2a$10$yQPgiPL0o6iJZMeG8hF6s.bIuT6CLDferySLAvYC9qY0GTHn5tHjy', 'Quản trị Rikkei', 'admin', '2026-07-01 08:00:00'),
  (2, 'lan@rikkei.shop', '$2a$10$yQPgiPL0o6iJZMeG8hF6s.bIuT6CLDferySLAvYC9qY0GTHn5tHjy', 'Nguyễn Thị Lan', 'customer', '2026-07-02 08:00:00'),
  (3, 'hung@rikkei.shop', '$2a$10$yQPgiPL0o6iJZMeG8hF6s.bIuT6CLDferySLAvYC9qY0GTHn5tHjy', 'Trần Văn Hùng', 'customer', '2026-07-03 08:00:00');

INSERT INTO orders (id, user_id, status, total, created_at) VALUES
  (1, 2, 'paid', 1099000, '2026-09-01 09:00:00'),
  (2, 2, 'pending', 160000, '2026-09-02 10:00:00'),
  (3, 3, 'paid', 1530000, '2026-09-03 11:00:00'),
  (4, 3, 'cancelled', 1250000, '2026-09-04 12:00:00');

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
  (1, 1, 1, 2, 450000),
  (2, 1, 3, 1, 199000),
  (3, 2, 5, 1, 160000),
  (4, 3, 2, 1, 890000),
  (5, 3, 6, 2, 320000),
  (6, 4, 4, 1, 1250000);
