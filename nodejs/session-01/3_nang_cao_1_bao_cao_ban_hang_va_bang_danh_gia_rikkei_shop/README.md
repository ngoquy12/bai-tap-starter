# Rikkei Shop - Bài 3: Báo cáo bán hàng và bảng đánh giá

Dự án Node.js 18+ và MySQL 8. Bài này chỉ viết SQL: một tệp tạo bảng `reviews` và 9 truy vấn báo cáo. Đề bài nằm trong `de_bai_bai_tap.md`.

## Cách chạy

```bash
cp .env.example .env       # điền DB_PASSWORD (và DB_PORT nếu MySQL không ở cổng 3306)
npm install
npm run db:setup           # tạo cơ sở dữ liệu rikkei_shop, nạp db/schema.sql và db/seed.sql
npm test                   # tự tạo lại rikkei_shop_test, chạy tệp reviews.sql của bạn rồi so kết quả 9 truy vấn
```

## Tệp bạn làm

- `src/sql/reviews.sql`: lệnh tạo bảng `reviews` cùng chỉ mục.
- `src/sql/queries.js`: 9 chuỗi truy vấn `SELECT`.

## Tệp không được sửa

- `db/` (lược đồ và dữ liệu mẫu), `src/db/pool.js`, `src/config/env.js`, `scripts/`.
- `tests/`, kể cả `tests/fixtures/` (dữ liệu bổ sung và 15 đánh giá mẫu dùng khi thử bằng tay).
