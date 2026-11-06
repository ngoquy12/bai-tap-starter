# Rikkei Shop - Bài 2: Giỏ hàng với middleware, Router và lỗi tập trung

Dự án Node.js 18+ (CommonJS) + Express 4.21.2 + Vitest + Supertest. Đề bài nằm trong `de_bai_bai_tap.md`. Bài này lưu giỏ hàng trong bộ nhớ nên chưa cần MySQL.

## Cách chạy

```bash
cp .env.example .env       # giữ API_KEY=rikkei-api-key
npm install
npm run dev                # máy chủ ở http://localhost:3000
npm test                   # chạy bộ test tự chấm (45 test)
```

## Tệp phải làm

Các tệp có dòng đầu `// ===== BÀI LÀM: ... =====`:

- `src/app.js`
- `src/routes/cart.routes.js`
- `src/middlewares/logger.js`, `requestId.js`, `requireApiKey.js`, `cartContext.js`, `notFound.js`, `errorHandler.js`, `asyncHandler.js`

## Tệp không được sửa

- Phần nằm giữa `// ===== Mã nền (có sẵn, KHÔNG sửa) =====` và `// ===== HẾT MÃ NỀN =====`: `src/data/` (sản phẩm, `productStore`, kho giỏ hàng `carts`), `src/errors/httpError.js`, `src/routes/products.routes.js`, `src/server.js`.
- Các tệp khuôn (`package.json`, `vitest.config.js`, `scripts/`, `src/config/`, `src/db/`) và thư mục `tests`.

Thử ghi dữ liệu bằng cURL: `curl -X POST http://localhost:3000/cart/items -H "Content-Type: application/json" -H "X-API-Key: rikkei-api-key" -H "X-Cart-Id: gio-cua-toi" -d '{"productId":1,"quantity":2}'`.
