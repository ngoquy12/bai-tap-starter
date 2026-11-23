# Rikkei Shop - Bài tập về nhà Session 03: SQL nâng cao

Dự án Node.js 18+ và MySQL 8 cho 16 bài của ngân hàng bài tập về nhà. Đề bài nằm trong `de_bai.md`; bạn chỉ làm các bài giảng viên giao.

## Cách chạy

```bash
cp .env.example .env       # điền DB_USER, DB_PASSWORD (và DB_PORT nếu MySQL không ở cổng 3306)
npm install
npx vitest run tests/c2.test.js   # chạy test của một bài
npm test                   # chạy test của mọi bài (khoảng 40 giây)
npm run p2                 # bài P2: in EXPLAIN và thời gian ba truy vấn
npm run p3                 # bài P3: in kết quả ba cách viết
npm run p4                 # bài P4: chạy hai phiếu nhập kho song song
```

Mọi test và lệnh `npm run p2/p3/p4` chỉ dùng cơ sở dữ liệu `DB_NAME_TEST` (mặc định `rikkei_shop_sql_test`), xóa và tạo lại nó từ `db/schema.sql`, `db/seed.sql`. Tên phải kết thúc bằng `_test`, nên dữ liệu `rikkei_shop_sql` của bạn không bị đụng tới.

## Tệp theo bài

| Bài | Tệp bạn làm | Tệp test |
|---|---|---|
| C1 | `src/sql/c1_suppliers.sql` | `tests/c1.test.js` (6) |
| C2 | `src/sql/c2_customer_spending.js` | `tests/c2.test.js` (3) |
| C3 | `src/sql/c3_customers_without_category.js` | `tests/c3.test.js` (4) |
| C4 | `src/sql/c4_price_position.js` | `tests/c4.test.js` (3) |
| N1 | `src/sql/n1_orders_index.sql`, `src/sql/n1_big_orders.js` | `tests/n1.test.js` (6) |
| N2 | `src/sql/n2_exchange_item.js` | `tests/n2.test.js` (6) |
| N3 | `src/sql/n3_sp_merge_tags.sql` | `tests/n3.test.js` (5) |
| N4 | `src/sql/n4_order_total_triggers.sql` | `tests/n4.test.js` (4) |
| P1 | `src/sql/p1_ai_customer_report.js`, `NHAT_KY_P1.md` | `tests/p1.test.js` (7) |
| P2 | `src/sql/p2_indexes.sql`, `BAO_CAO_P2.md` (tự tạo) | `npm run p2` |
| P3 | `BAO_CAO_P3.md` (tự tạo) | `npm run p3` |
| P4 | `src/sql/p4_restock_sessions.js`, `BAO_CAO_P4.md` (tự tạo) | `npm run p4` |
| S1-S4 | Tệp ghi trong đề (tự tạo) | `tests/s1.test.js` đến `tests/s4.test.js` (tự viết) |

## Tệp không được sửa

- `db/` (lược đồ và dữ liệu mẫu của Session 03), `src/db/pool.js`, `src/config/env.js`, `scripts/`.
- `tests/` có sẵn, kể cả `tests/fixtures/` và `tests/helpers/`. Bài Sáng tạo chỉ thêm tệp test mới.
- `src/sql/p2_queries.js` chỉ được viết lại câu `ordersFromThousand`; `src/sql/p3_three_versions.js` giữ nguyên.
