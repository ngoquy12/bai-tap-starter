-- Dữ liệu bổ sung cho Lab 4: bốn đầu sách mới của danh mục Sách (id 3), có giá trùng nhau.
-- Sau khối này danh mục Sách có 6 sản phẩm: ba cuốn giá 160000, một cuốn 175000, hai cuốn 210000.
INSERT INTO products (id, category_id, name, price, stock) VALUES
    (9, 3, 'Sách Node.js', 175000, 15),
    (10, 3, 'Sách Express', 160000, 10),
    (11, 3, 'Sách MySQL', 160000, 8),
    (12, 3, 'Sách Git', 210000, 5);
