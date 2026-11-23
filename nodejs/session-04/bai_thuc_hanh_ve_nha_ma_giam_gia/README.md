# Rikkei Shop - Bài thực hành về nhà Session 04: mô-đun mã giảm giá

Dự án Node.js 18+ và MySQL 8. Bài chỉ viết SQL: ba bảng, ba truy vấn, một procedure, một trigger, một view, và phản biện ba truy vấn do AI sinh. Đề bài nằm trong `de_bai.md`.

## Cách chạy

```bash
cp .env.example .env       # điền DB_USER, DB_PASSWORD (và DB_PORT nếu MySQL không ở cổng 3306)
npm install
npm test                   # tự tạo lại rikkei_shop_sql_test, chạy các tệp src/sql của bạn rồi so kết quả
npm run db:coupons         # nạp bài của bạn cùng dữ liệu mẫu vào rikkei_shop_sql để thử bằng tay
```

## Tệp bạn làm

- `src/sql/coupon_tables.sql`: Phần A, ba bảng và index.
- `src/sql/queries.js`: Phần B, ba truy vấn.
- `src/sql/sp_apply_coupon.sql`, `src/sql/coupon_trigger_view.sql`: Phần C, procedure, trigger, view.
- `src/sql/ai_reports.js`, `NHAT_KY_AI.md`: Phần D, phản biện mã AI và nhật ký.

## Tệp không được sửa

- `db/` (lược đồ và dữ liệu mẫu của Session 03), `src/db/pool.js`, `src/config/env.js`, `scripts/`.
- `tests/`, kể cả `tests/fixtures/coupon-data.sql` (dữ liệu bổ sung dùng cho test và khi thử bằng tay).

## Thứ tự test

| Tệp test | Phần | Số test |
|---|---|---|
| `tests/a-coupon-tables.test.js` | A | 16 |
| `tests/b-coupon-queries.test.js` | B | 10 |
| `tests/c-apply-coupon.test.js` | C | 15 |
| `tests/d-ai-reports.test.js` | D | 8 |

Phần B, C, D chạy trên bảng của bạn ở Phần A, nên làm Phần A trước. Chạy riêng một phần: `npx vitest run tests/b-coupon-queries.test.js`.
