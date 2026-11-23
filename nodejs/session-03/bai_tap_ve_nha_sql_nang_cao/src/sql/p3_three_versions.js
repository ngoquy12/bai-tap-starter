// P3 (Mức AI: AI-0): ba cách viết "sản phẩm giá cao nhất của mỗi danh mục" mà ba bạn trong nhóm đã nộp.
// npm run p3 chạy cả ba trên dữ liệu tests/fixtures/p3-products.sql và in kết quả. Không sửa tệp này.

const versionA = `
SELECT p.category_id AS categoryId, p.id, p.name, p.price
FROM products p
WHERE p.price = (
    SELECT MAX(price) FROM products WHERE category_id = p.category_id
)
ORDER BY categoryId, p.id`;

const versionB = `
WITH ranked AS (
    SELECT category_id, id, name, price,
        ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC, id) AS row_num
    FROM products
)
SELECT category_id AS categoryId, id, name, price
FROM ranked
WHERE row_num = 1
ORDER BY categoryId, id`;

const versionC = `
WITH ranked AS (
    SELECT category_id, id, name, price,
        RANK() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_no
    FROM products
)
SELECT category_id AS categoryId, id, name, price
FROM ranked
WHERE rank_no = 1
ORDER BY categoryId, id`;

module.exports = { versionA, versionB, versionC };
