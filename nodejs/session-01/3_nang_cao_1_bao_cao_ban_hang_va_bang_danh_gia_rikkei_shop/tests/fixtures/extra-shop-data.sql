-- Dữ liệu bổ sung cho bài 3, nạp SAU db/seed.sql: một danh mục chưa có sản phẩm, hai khách hàng mới và một đơn đã thanh toán.
-- Mật khẩu mọi tài khoản: Matkhau123
INSERT INTO categories (id, name) VALUES
  (4, 'Gia dụng');

INSERT INTO users (id, email, password_hash, full_name, role, created_at) VALUES
  (4, 'khoa@rikkei.shop', '$2a$10$yQPgiPL0o6iJZMeG8hF6s.bIuT6CLDferySLAvYC9qY0GTHn5tHjy', 'Lê Minh Khoa', 'customer', '2026-07-04 08:00:00'),
  (5, 'ha@rikkei.shop', '$2a$10$yQPgiPL0o6iJZMeG8hF6s.bIuT6CLDferySLAvYC9qY0GTHn5tHjy', 'Phạm Thu Hà', 'customer', '2026-07-05 08:00:00');

INSERT INTO orders (id, user_id, status, total, created_at) VALUES
  (5, 4, 'paid', 718000, '2026-09-05 09:00:00');

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
  (7, 5, 3, 2, 199000),
  (8, 5, 6, 1, 320000);
