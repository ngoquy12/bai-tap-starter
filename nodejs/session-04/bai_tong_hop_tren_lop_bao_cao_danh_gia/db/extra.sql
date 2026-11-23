-- Dữ liệu thêm cho bài tổng hợp "Đánh giá sản phẩm": nạp SAU schema.sql và seed.sql. Không sửa tệp này.
-- Gồm: danh mục Gia dụng (id 4) có 1 sản phẩm chưa ai đánh giá, 3 khách hàng mới (id 4-6) và bảng reviews với 17 đánh giá.
DROP TABLE IF EXISTS reviews;

INSERT INTO categories (id, name) VALUES
    (4, 'Gia dụng');

INSERT INTO products (id, category_id, name, price, stock) VALUES
    (9, 4, 'Nồi chiên không dầu', 1490000, 15);

INSERT INTO users (id, email, full_name) VALUES
    (4, 'khoa@rikkei.shop', 'Lê Minh Khoa'),
    (5, 'ha@rikkei.shop', 'Phạm Thu Hà'),
    (6, 'bao@rikkei.shop', 'Đỗ Quốc Bảo');

-- Mỗi người chỉ đánh giá một sản phẩm một lần; điểm từ 1 đến 5; xóa người dùng hoặc sản phẩm thì xóa luôn đánh giá.
CREATE TABLE reviews (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment VARCHAR(255) NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT uq_reviews_user_product UNIQUE (user_id, product_id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE
) ENGINE = InnoDB;

INSERT INTO reviews (id, user_id, product_id, rating, comment, created_at) VALUES
    (1, 2, 1, 5, 'Âm thanh rõ, pin lâu.', '2026-10-01 09:00:00'),
    (2, 3, 1, 4, NULL, '2026-10-05 10:00:00'),
    (3, 4, 1, 5, 'Đeo cả ngày không đau tai.', '2026-10-05 10:00:00'),
    (4, 5, 1, 4, 'Hộp hơi móp khi giao.', '2026-10-08 20:15:00'),
    (5, 2, 2, 4, 'Gõ êm.', '2026-10-02 08:30:00'),
    (6, 5, 2, 5, NULL, '2026-10-09 14:00:00'),
    (7, 3, 6, 3, 'Con lăn hơi rít.', '2026-10-03 11:00:00'),
    (8, 4, 6, 4, NULL, '2026-10-06 16:45:00'),
    (9, 6, 6, 2, 'Hay mất kết nối.', '2026-10-10 07:30:00'),
    (10, 2, 3, 3, 'Vải mỏng.', '2026-10-04 12:00:00'),
    (11, 4, 3, 4, NULL, '2026-10-07 18:00:00'),
    (12, 3, 4, 5, 'Đế êm, chạy 10 km không mỏi.', '2026-10-11 06:00:00'),
    (13, 2, 5, 5, 'Ví dụ dễ hiểu.', '2026-10-01 21:00:00'),
    (14, 3, 5, 5, NULL, '2026-10-04 19:30:00'),
    (15, 6, 5, 4, 'Thiếu bài tập cuối chương.', '2026-10-12 10:00:00'),
    (16, 4, 8, 4, NULL, '2026-10-06 09:15:00'),
    (17, 5, 8, 5, 'Phần index giải thích rõ.', '2026-10-13 15:00:00');
