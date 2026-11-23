# Rikkei Shop - Lab Session 04: lớp dữ liệu MySQL

Dự án Node.js 18+ và MySQL 8 dùng chung cho mọi chặng của `lab_guide.md`. Bạn chỉ viết SQL trong `src/sql/` và điền nhật ký `docs/nhat_ky_ai.md` ở Lab 5.

## Cách chạy

```bash
cp .env.example .env              # điền DB_PASSWORD (và DB_PORT nếu MySQL không ở cổng 3306)
npm install
npm run db:setup                  # tạo rikkei_shop_sql từ db/schema.sql và db/seed.sql
node scripts/sql.js file src/sql/lab1_wishlists.sql      # chạy một tệp .sql trên rikkei_shop_sql
node scripts/sql.js query storefront productCards        # chạy một truy vấn xuất từ src/sql/storefront.js
npx vitest run tests/lab1.test.js # chấm riêng một chặng
npm test                          # chấm cả 7 chặng trên rikkei_shop_sql_test
```

## Tệp bạn làm

| Chặng | Tệp |
|---|---|
| Lab 1 | `src/sql/lab1_wishlists.sql` |
| Lab 2 | `src/sql/storefront.js` |
| Lab 3 | `src/sql/reports.js`, `src/sql/lab3_views.sql` |
| Lab 4 | `src/sql/lab4_indexes.sql`, `src/sql/catalog.js` (hai truy vấn đầu) |
| Lab 5 | `src/sql/lab5_place_order.sql`, `docs/nhat_ky_ai.md` |
| Lab 6 (nâng cao) | `src/sql/lab6_inventory_logs.sql` |
| Lab 7 (nâng cao) | `src/sql/lab7_fulltext.sql`, `src/sql/catalog.js` (`searchProducts`) |

## Tệp không được sửa

- `db/` (lược đồ và dữ liệu mẫu chép từ `_shared/db-sql`), `src/db/pool.js`, `src/config/env.js`, `scripts/`.
- `tests/`, kể cả `tests/fixtures/` (dữ liệu bổ sung của Lab 3 và Lab 4).
