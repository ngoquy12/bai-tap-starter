-- Dữ liệu bổ sung cho bài N1 và P2: thêm 20.000 đơn hàng (đơn 4 đến 20003).
-- Đơn chia đều cho Lan (user_id 2), Hùng (user_id 3) và khách vãng lai (NULL); giá trị đơn từ 50.000 đến 2.045.000.
SET SESSION cte_max_recursion_depth = 20000;
INSERT INTO orders (user_id, total)
WITH RECURSIVE seq (n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 20000
)
SELECT ELT(1 + n % 3, 2, 3, NULL), 50000 + (n * 7919) % 400 * 5000
FROM seq;
ANALYZE TABLE orders;
