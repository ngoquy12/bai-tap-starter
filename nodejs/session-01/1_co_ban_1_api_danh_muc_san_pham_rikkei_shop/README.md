# Rikkei Shop - Bài 1: API danh mục sản phẩm trong bộ nhớ

Dự án Node.js 18+ (CommonJS) + Express 4.21.2 + Vitest + Supertest. Đề bài nằm trong `de_bai_bai_tap.md`. Bài này chạy hoàn toàn trong bộ nhớ nên chưa cần MySQL; khuôn dự án đã có sẵn phần MySQL cho các bài sau.

## Cách chạy

```bash
cp .env.example .env       # PORT=3000 là đủ cho bài này
npm install                # dùng package.json đã ghim phiên bản
npm run dev                # máy chủ ở http://localhost:3000 (nodemon tự khởi động lại khi lưu tệp)
npm test                   # chạy bộ test tự chấm (45 test)
```

## Tệp phải làm

- `src/app.js`
- `src/routes/products.routes.js`

## Tệp không được sửa

- `src/data/products.js`, `src/errors/httpError.js`, `src/server.js` (mã nền)
- Thư mục `tests`, `db`, `scripts` và các tệp cấu hình của khuôn (`package.json`, `vitest.config.js`, `.env.example`, `src/config`, `src/db`)

Thử bằng cURL hoặc Postman, ví dụ: `curl http://localhost:3000/products/2`.
