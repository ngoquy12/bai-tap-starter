# Bài 1 - API khóa học và bài học của Rikkei Learn

Dự án Node.js 18+ (CommonJS) + Express 4.21.2 + Vitest + Supertest. Đọc đề ở `de_bai_bai_tap.md`.

## Cách chạy

```bash
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
npm install
npm run dev              # chạy máy chủ (cổng PORT trong .env, mặc định 3000)
npm test                 # chạy test tự chấm
```

Bài này dùng dữ liệu trong bộ nhớ nên chưa cần MySQL; `npm run db:setup` dành cho các bài sau.

## Tệp phải làm

`src/app.js`, `src/routes/courses.routes.js` (dòng đầu có `// ===== BÀI LÀM`).

## Không được sửa

Thư mục `tests/` và các tệp có khối `// ===== Mã nền (có sẵn, KHÔNG sửa) =====` ... `// ===== HẾT MÃ NỀN =====`: `src/server.js`, `src/data/courses.js`, `src/data/lessons.js`, `src/errors/httpError.js`, `src/middlewares/asyncHandler.js`, `src/middlewares/errorHandler.js`, `src/middlewares/notFound.js`.
