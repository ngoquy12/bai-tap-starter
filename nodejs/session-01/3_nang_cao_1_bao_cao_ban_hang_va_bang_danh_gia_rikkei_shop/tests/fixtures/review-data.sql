-- 15 đánh giá mẫu, nạp vào bảng reviews của bạn SAU extra-shop-data.sql.
-- Cột dùng: id, user_id, product_id, rating, comment (created_at lấy giá trị mặc định).
INSERT INTO reviews (id, user_id, product_id, rating, comment) VALUES
  (1, 2, 1, 5, 'Âm thanh rõ'),
  (2, 3, 1, 4, NULL),
  (3, 4, 1, 5, 'Pin tốt'),
  (4, 3, 2, 4, 'Gõ êm'),
  (5, 2, 2, 4, NULL),
  (6, 2, 3, 3, 'Vải hơi mỏng'),
  (7, 2, 5, 5, 'Dễ hiểu'),
  (8, 3, 5, 5, NULL),
  (9, 5, 5, 5, 'Sách hay'),
  (10, 3, 6, 4, 'Chuột mượt'),
  (11, 4, 6, 4, NULL),
  (12, 5, 6, 4, NULL),
  (13, 5, 7, 2, 'Mặc chật'),
  (14, 4, 8, 4, NULL),
  (15, 5, 8, 4, 'Đáng tiền');
