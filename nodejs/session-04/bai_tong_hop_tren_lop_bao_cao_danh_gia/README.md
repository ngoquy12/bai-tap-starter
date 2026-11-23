# Bài tổng hợp trên lớp: Báo cáo đánh giá sản phẩm (Rikkei Shop)

Đề bài đầy đủ ở `de_bai.md` của buổi. Thư mục này là dự án nền: bạn chỉ viết thân ba hàm trong `src/sql/reviewReports.js`.

## Chạy dự án

```bash
cp .env.example .env     # điền DB_USER và DB_PASSWORD của MySQL trên máy bạn
npm install              # cài thư viện đúng phiên bản đã ghim
npm run db:setup         # tạo rikkei_shop_sql từ db/schema.sql, db/seed.sql và db/extra.sql
npm test                 # chạy 9 test mẫu trên cơ sở dữ liệu thử rikkei_shop_sql_test
```

## Cấu trúc

| Đường dẫn | Vai trò |
| :--- | :--- |
| `db/schema.sql`, `db/seed.sql` | Lược đồ và dữ liệu mẫu chung của Rikkei Shop (không sửa). |
| `db/extra.sql` | Bảng `reviews`, danh mục Gia dụng, 3 khách hàng mới và 17 đánh giá (không sửa). |
| `src/db/pool.js` | Pool kết nối `mysql2`, đã bật `decimalNumbers` để giá trị thập phân từ MySQL trả về kiểu số. |
| `src/sql/reviewReports.js` | Bài làm của bạn. |
| `tests/reviewReports.test.js` | Test mẫu (không sửa). |

Mỗi lần `npm test`, cơ sở dữ liệu thử được tạo lại từ ba tệp trong `db/`, nên dữ liệu bạn thêm tay vào `rikkei_shop_sql` không ảnh hưởng tới test.
