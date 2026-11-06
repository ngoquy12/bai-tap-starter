# Task Hub, Bài 1: bảng công việc dựng từ dữ liệu

Dự án Vite + React 18. Đọc đề ở `de_bai_bai_tap.md` trước khi làm.

## Cách chạy

```bash
npm install
npm run dev     # xem bảng công việc trên trình duyệt
npm test        # bộ kiểm thử tự chấm (25 test)
```

Bài này không dùng API ghi dữ liệu nên không cần `npm run seed`.

## Giao diện mẫu

Mở `giao_dien_mau/index.html` bằng trình duyệt để xem giao diện cần làm (HTML + Bootstrap 5.3.3). Dán từng khối `Component` vào https://transform.tools/html-to-jsx để chuyển sang JSX, rồi tách thành component; các bước chi tiết ở đề bài. Thư mục `giao_dien_mau/` không phải một phần của ứng dụng React.

## Tệp bạn phải làm (có dòng đầu `// ===== BÀI LÀM: ... =====`)

- `src/components/PriorityBadge.jsx`
- `src/components/TaskCard.jsx`
- `src/components/TaskColumn.jsx`
- `src/components/TaskBoard.jsx`

## Tệp không được sửa

- `src/App.jsx`, `src/main.jsx` (đã nạp CSS Bootstrap), `src/config.js`
- `src/data/tasks.js`, `src/data/employees.js`
- `src/utils/formatDate.js`, `src/utils/isOverdue.js`
- `giao_dien_mau/` (chỉ để tham khảo)
- Toàn bộ thư mục `tests/`, `scripts/` và các tệp cấu hình ở thư mục gốc

## Giao diện mẫu trên GitHub

Giao diện mẫu của bài cũng có trên GitHub: https://github.com/ngoquy12/reactjs-giao-dien-mau/tree/main/session-02/bai-1-bang-cong-viec-giao-dien. Clone cả repo bằng `git clone https://github.com/ngoquy12/reactjs-giao-dien-mau.git` rồi mở `session-02/bai-1-bang-cong-viec-giao-dien/index.html` bằng trình duyệt.
