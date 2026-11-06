# Bài 4 - API khóa học đầy đủ của Rikkei Learn

Dự án Node.js 18+ (CommonJS) + Express 4.21.2 + mysql2 3.11.5 + zod 3.24.1 + MySQL 8 + Vitest + Supertest. Đọc đề ở `de_bai_bai_tap.md`.

## Cách chạy

1. Cài MySQL 8 và bảo đảm máy chủ đang chạy.
2. Tạo tệp cấu hình rồi điền mật khẩu MySQL của bạn vào `DB_PASSWORD`:

```bash
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
npm install
npm run db:setup         # tạo cơ sở dữ liệu rikkei_learn và nạp db/schema.sql, db/seed.sql
npm run dev              # chạy máy chủ (cổng PORT trong .env, mặc định 3000)
npm test                 # chạy test tự chấm (dùng cơ sở dữ liệu rikkei_learn_test, tự tạo lại mỗi test)
```

## Tệp cần làm

Các tệp có dòng đầu `// ===== BÀI LÀM: ... =====`:

`src/app.js`, `src/routes/courses.routes.js`, `src/controllers/courses.controller.js`, `src/controllers/lessons.controller.js`, `src/repositories/courses.repository.js`, `src/repositories/lessons.repository.js`, `src/schemas/course.schema.js`, `src/schemas/lesson.schema.js`, `src/middlewares/validate.js`, `src/middlewares/errorHandler.js`.

## Không được sửa

Thư mục `tests/`, `db/schema.sql`, `db/seed.sql`, và các tệp mã nền (dòng đầu `// ===== Mã nền (có sẵn, KHÔNG sửa) =====`): `src/errors/httpError.js`, `src/middlewares/asyncHandler.js`, `src/middlewares/notFound.js`, `src/server.js`, cùng khuôn `src/config/env.js`, `src/db/pool.js`, `scripts/db-setup.js`.
