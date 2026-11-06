# Rikkei Shop - Bài 4: Kho sản phẩm và đặt hàng an toàn bằng giao dịch

Dự án Node.js 18+ (CommonJS) + MySQL 8 + Vitest. Đề bài nằm trong `de_bai_bai_tap.md`. Bài này chưa có máy chủ HTTP: bạn viết hai repository, test gọi thẳng các hàm trên dữ liệu seed Rikkei Shop.

## Cách chạy

```bash
cp .env.example .env       # điền DB_PASSWORD (và DB_PORT nếu MySQL không ở cổng 3306)
npm install
npm run db:setup           # tạo cơ sở dữ liệu rikkei_shop, nạp db/schema.sql và db/seed.sql
npm test                   # tự tạo lại cơ sở dữ liệu rikkei_shop_test trước mỗi test rồi chạy 44 test
node scripts/try.js        # gọi thử các hàm trên rikkei_shop (chạy npm run db:setup trước để dữ liệu về như seed)
```

## Tệp bạn làm

- `src/repositories/products.repository.js`: `findAll`, `findById`, `create`, `update`, `remove`.
- `src/repositories/orders.repository.js`: `createOrder`, `findOrderById`, `cancelOrder`.

## Tệp không được sửa

- `src/errors/httpError.js`, `src/db/pool.js`, `src/config/env.js`.
- `db/`, `scripts/`, `tests/`, `vitest.config.js`, `package.json`.
- `npm test` chỉ thao tác trên cơ sở dữ liệu có tên kết thúc bằng `_test` (đặt trong `DB_NAME_TEST`).
