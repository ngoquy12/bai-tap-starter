# Bài 3 - Ghi danh và tiến độ học bằng mysql2 cho Rikkei Learn

Dự án Node.js 18+ (CommonJS) + mysql2 3.11.5 + MySQL 8 + Vitest. Đọc đề ở `de_bai_bai_tap.md`.

## Cách chạy

```bash
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
# mở .env và điền mật khẩu MySQL của bạn vào DB_PASSWORD
npm install
npm run db:setup         # tạo cơ sở dữ liệu rikkei_learn và nạp db/schema.sql, db/seed.sql
npm test                 # chạy test tự chấm (cơ sở dữ liệu rikkei_learn_test, nạp lại trước mỗi test)
```

Bài này chưa có HTTP nên không có `npm run dev`. Để thử bằng tay, gọi từng hàm bằng script có sẵn:

```bash
node scripts/call.js enrollStudent 2 5
```

## Tệp cần làm

- `src/repositories/courses.repository.js`
- `src/repositories/enrollments.repository.js` (phần sau dòng `// ===== HẾT MÃ NỀN =====`)

## Không được sửa

`tests/`, `db/schema.sql`, `db/seed.sql`, `scripts/`, `src/errors/httpError.js`, `src/db/pool.js`, `src/config/env.js`, và khối mã nền trong `enrollments.repository.js` (hàm `findById` và hằng `SELECT_ENROLLMENT`).
