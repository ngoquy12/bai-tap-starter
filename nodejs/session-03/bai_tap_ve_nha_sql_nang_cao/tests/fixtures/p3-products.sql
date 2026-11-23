-- Dữ liệu bổ sung cho bài P3: hai sản phẩm có giá bằng giá cao nhất của danh mục, một danh mục chưa có sản phẩm.
INSERT INTO categories (id, name) VALUES (4, 'Gia dụng');
INSERT INTO products (id, category_id, name, price, stock) VALUES
    (9, 1, 'Bàn phím cơ không dây', 890000, 7),
    (10, 3, 'Sách Thuật toán', 210000, 9);
