# [Nâng cao 2] Task Hub: quản lý công việc lưu thật qua API crudcrud.com

Dự án Vite + React 18.3.1 + Vitest. Đọc đề ở `de_bai_bai_tap.md`.

## Cách chạy

1. Mở https://crudcrud.com, sao chép địa chỉ endpoint của bạn (dạng `https://crudcrud.com/api/<32 ký tự>`).
2. Dán vào `API_BASE` trong `src/config.js` (không có dấu `/` ở cuối).
3. Chạy lệnh:

```bash
npm install
npm run seed    # nạp 8 nhân viên và 12 công việc vào endpoint của bạn, chạy đúng MỘT lần cho mỗi endpoint
npm run dev     # chạy ứng dụng
npm test        # chạy test tự chấm (không gọi mạng, không dùng hạn mức của endpoint)
```

Mỗi endpoint chỉ nhận 100 yêu cầu và bị xóa sau 24 giờ. Hết hạn mức hoặc hết hạn thì lấy endpoint mới ở crudcrud.com, dán lại vào `src/config.js` và chạy lại `npm run seed`.

## Giao diện mẫu

Mở `giao_dien_mau/index.html` bằng trình duyệt (bấm đúp). Chuyển khối `TaskManager` sang JSX bằng https://transform.tools/html-to-jsx (xem đề, đoạn "Giao diện mẫu và chuyển HTML sang JSX"). Bootstrap đã được nạp sẵn trong `src/main.jsx`.

## Tệp cần làm

- `src/api/tasks.js`
- `src/reducers/tasksReducer.js`
- `src/components/TaskManager.jsx`

## Không được sửa

Thư mục `tests/`, `db.seed.json`, `scripts/`, `giao_dien_mau/` và mọi tệp còn lại trong `src/` (đều là mã nền, dòng đầu ghi `// ===== Mã nền (có sẵn, KHÔNG sửa) =====`), trừ dòng `API_BASE` trong `src/config.js`.

## Giao diện mẫu trên GitHub

Giao diện mẫu của bài cũng có trên GitHub: https://github.com/ngoquy12/reactjs-giao-dien-mau/tree/main/session-02/bai-4-cong-viec-voi-api-crudcrud. Clone cả repo bằng `git clone https://github.com/ngoquy12/reactjs-giao-dien-mau.git` rồi mở `session-02/bai-4-cong-viec-voi-api-crudcrud/index.html` bằng trình duyệt.
