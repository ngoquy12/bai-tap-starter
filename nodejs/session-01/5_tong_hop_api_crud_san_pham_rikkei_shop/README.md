# Rikkei Shop - Bài 5: API CRUD sản phẩm hoàn chỉnh

Dự án Node.js 18+ (CommonJS) + Express 4 + MySQL 8 + zod + Vitest + Supertest. Đề bài nằm trong `de_bai_bai_tap.md`.

## Cách chạy

```bash
cp .env.example .env       # điền DB_PASSWORD (và DB_PORT nếu MySQL không ở cổng 3306)
npm install
npm run db:setup           # tạo cơ sở dữ liệu rikkei_shop, nạp db/schema.sql và db/seed.sql
npm run dev                # máy chủ ở http://localhost:3000
npm test                   # tự tạo lại cơ sở dữ liệu rikkei_shop_test rồi chạy 45 test
```

## Tệp bạn làm (dòng đầu là `// ===== BÀI LÀM: ... =====`)

- `src/schemas/product.schema.js`
- `src/middlewares/validate.js`, `src/middlewares/errorHandler.js`
- `src/repositories/products.repository.js`, `src/repositories/categories.repository.js`
- `src/controllers/products.controller.js`, `src/controllers/categories.controller.js`
- `src/routes/products.routes.js`, `src/routes/categories.routes.js`
- `src/app.js`

## Tệp không được sửa

`src/errors/httpError.js`, `src/middlewares/asyncHandler.js`, `src/middlewares/notFound.js`, `src/server.js`, `src/db/pool.js`, `src/config/env.js`, thư mục `db/`, thư mục `tests/`, `scripts/`.

`npm test` chỉ thao tác trên cơ sở dữ liệu có tên kết thúc bằng `_test` (đặt trong `DB_NAME_TEST`).
