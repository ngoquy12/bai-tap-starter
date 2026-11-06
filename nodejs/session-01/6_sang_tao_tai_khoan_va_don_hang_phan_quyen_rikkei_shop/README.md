# Rikkei Shop - Bài 6: Tài khoản và đơn hàng có phân quyền

Dự án Node.js 18+ (CommonJS) + Express 4.21.2 + MySQL 8 + zod + bcryptjs + jsonwebtoken + Vitest + Supertest. Đề bài nằm trong `de_bai_bai_tap.md`.

## Cách chạy

```bash
cp .env.example .env       # điền DB_PASSWORD, đổi JWT_SECRET (và DB_PORT nếu MySQL không ở cổng 3306)
npm install
npm run db:setup           # tạo cơ sở dữ liệu rikkei_shop, nạp db/schema.sql và db/seed.sql
npm run dev                # máy chủ ở http://localhost:3000
npm test                   # tạo lại cơ sở dữ liệu rikkei_shop_test trước mỗi test rồi chạy 45 test
```

## Tệp bạn làm

Các tệp có dòng đầu `// ===== BÀI LÀM: ... =====` trong `src/`: `app.js`, `routes/` (ba tệp), `controllers/auth.controller.js`, `controllers/orders.controller.js`, `middlewares/authenticate.js`, `authorize.js`, `loginLimiter.js`, `schemas/auth.schema.js`, `schemas/order.schema.js`, `repositories/users.repository.js` và phần dưới khối mã nền của `repositories/orders.repository.js`.

## Tệp không được sửa

- Các khối giữa `// ===== Mã nền (có sẵn, KHÔNG sửa) =====` và `// ===== HẾT MÃ NỀN =====` (API sản phẩm của Bài 5, `createOrder` của Bài 4, `httpError`, `asyncHandler`, `notFound`, `validate`, `errorHandler`, `server.js`).
- `db/`, `tests/`, `scripts/`, `src/config/`, `src/db/`, `package.json`, `vitest.config.js`.

## Lưu ý khi thử và khi chạy test

- `/auth/login` chỉ cho gọi 5 lần mỗi 15 phút cho mỗi IP; bộ đếm nằm trong bộ nhớ nên khởi động lại máy chủ là đếm lại.
- Test ký token trực tiếp bằng `tests/helpers/token.js`, không cần đăng nhập.
- `npm test` chỉ thao tác trên cơ sở dữ liệu có tên kết thúc bằng `_test` (đặt trong `DB_NAME_TEST`).
