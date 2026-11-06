# Bài 2 - Thống kê học tập và bảng chứng chỉ bằng SQL (Rikkei Learn)

Dự án Node.js 18+ (CommonJS) + MySQL 8 + Vitest. Đọc đề ở `de_bai_bai_tap.md`.

## Cách chạy

```bash
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
npm install
npm run db:setup         # tạo cơ sở dữ liệu rikkei_learn và nạp db/schema.sql, db/seed.sql
npm test                 # chạy test tự chấm (cơ sở dữ liệu rikkei_learn_test, tự tạo lại ở mỗi test)
```

Điền `DB_PASSWORD` trong `.env` bằng mật khẩu MySQL của bạn. Thử từng câu bằng dòng lệnh `mysql` hoặc MySQL Workbench, hoặc chạy một khóa của `queries.js` bằng `node scripts/run-query.js <tên> [tham số...]`.

## Tệp phải làm

- `src/sql/extend_schema.sql` (bảng `certificates`, cột `is_published`, chỉ mục)
- `src/sql/queries.js` (11 chuỗi SQL)

## Tệp không được sửa

`tests/`, `db/schema.sql`, `db/seed.sql`, `scripts/`, `src/config/`, `src/db/`, và dòng `DROP TABLE IF EXISTS certificates;` trong `extend_schema.sql`.
