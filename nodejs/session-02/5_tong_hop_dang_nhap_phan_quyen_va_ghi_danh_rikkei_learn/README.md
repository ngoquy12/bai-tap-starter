# Bài 5 - Đăng nhập, phân quyền và ghi danh của Rikkei Learn

Dự án Node.js 18+ (CommonJS) + Express 4.21.2 + mysql2 3.11.5 + zod 3.24.1 + bcryptjs 2.4.3 + jsonwebtoken 9.0.2 + MySQL 8 + Vitest + Supertest. Đọc đề ở `de_bai_bai_tap.md`.

## Cách chạy

1. Cài MySQL 8 và bảo đảm máy chủ đang chạy.
2. Tạo tệp cấu hình rồi điền mật khẩu MySQL của bạn vào `DB_PASSWORD`; đổi `JWT_SECRET` thành một chuỗi của riêng bạn:

```bash
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
npm install
npm run db:setup         # tạo cơ sở dữ liệu rikkei_learn và nạp db/schema.sql, db/seed.sql
npm run dev              # chạy máy chủ (cổng PORT trong .env, mặc định 3000)
npm test                 # chạy test tự chấm (dùng cơ sở dữ liệu rikkei_learn_test, tự tạo lại mỗi test)
```

Tài khoản mẫu (mật khẩu `Matkhau123`): `admin@rikkei.edu` (admin), `an@rikkei.edu`, `binh@rikkei.edu`, `chi@rikkei.edu`, `dung@rikkei.edu`, `giang@rikkei.edu` (student).

## Tệp cần làm

Các tệp có dòng đầu `// ===== BÀI LÀM: ... =====`:

`src/schemas/auth.schema.js`, `src/schemas/enrollment.schema.js`, `src/repositories/users.repository.js`, `src/repositories/enrollments.repository.js` (phần `findAll`, `count`), `src/controllers/auth.controller.js`, `src/controllers/enrollments.controller.js`, `src/middlewares/authenticate.js`, `src/middlewares/authorize.js`, `src/routes/auth.routes.js`, `src/routes/me.routes.js`, `src/routes/enrollments.routes.js`, `src/routes/courses.routes.js` (phần sau mã nền), `src/app.js`.

Không sửa: thư mục `tests/` (kể cả `tests/helpers/token.js`), `db/schema.sql`, `db/seed.sql`, và các khối `// ===== Mã nền (có sẵn, KHÔNG sửa) =====` ... `// ===== HẾT MÃ NỀN =====` (`httpError`, `asyncHandler`, `notFound`, `errorHandler`, `validate`, `course.schema`, `courses.repository`, `lessons.repository`, `courses.controller`, `server.js`, `enrollStudent`, `updateProgress`, `dropEnrollment` trong `enrollments.repository.js`).
