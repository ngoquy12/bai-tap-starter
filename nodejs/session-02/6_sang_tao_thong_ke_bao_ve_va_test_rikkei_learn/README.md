# Bài 6 - Thống kê, lớp bảo vệ và bộ test của riêng bạn (Rikkei Learn)

Dự án Node.js 18+ (CommonJS) + Express 4 + MySQL 8. Đọc đề ở `de_bai_bai_tap.md`.

## Cách chạy

```bash
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env, rồi điền mật khẩu MySQL
npm install
npm run db:setup         # tạo cơ sở dữ liệu rikkei_learn và nạp db/schema.sql, db/seed.sql
npm run dev              # chạy máy chủ
npm test                 # chạy test (dùng cơ sở dữ liệu rikkei_learn_test)
```

## Tệp cần làm

`src/repositories/stats.repository.js`, `src/schemas/stats.schema.js`, `src/controllers/stats.controller.js`, `src/routes/stats.routes.js`, `src/middlewares/loginLimiter.js`, `src/app.js`, và các tệp `*.test.js` của chính bạn trong `tests/student/`.

## Không được sửa

`tests/*.test.js` do đề cung cấp, `tests/helpers/`, `tests/setup.js`, `db/`, và mã nền của Bài 1 đến Bài 5 (các tệp khác trong `src/`).
