# Bài 2: Todo list (thêm, đánh dấu, xóa, lọc)

Dự án Vite + React 18.3.1 + Vitest. Đề bài nằm trong `de_bai_bai_tap.md`.

## Cách chạy

```bash
npm install      # dùng package.json đã ghim phiên bản; không chạy npm create vite
npm run dev      # mở trang tại địa chỉ Vite in ra (thường là http://localhost:5173)
npm test         # chạy bộ test tự chấm (25 test)
```

## Giao diện mẫu

Mở `giao_dien_mau/index.html` bằng trình duyệt để xem giao diện cần làm (HTML + Bootstrap 5.3.3). Chuyển từng khối giữa hai chú thích `Component` và `Hết` sang JSX bằng https://transform.tools/html-to-jsx, rồi tách component và nối dữ liệu, hành vi theo đề. Không sửa `giao_dien_mau/`.

## Tệp bạn làm

Hoàn thiện các tệp có dòng `// ===== BÀI LÀM: ... =====` ở đầu: `src/App.jsx`, `src/components/TodoForm.jsx`, `src/components/TodoItem.jsx`, `src/components/TodoFilter.jsx`, `src/components/TodoList.jsx`. Các chú thích `TODO` chỉ chỗ cần làm; tên từng test cho biết hành vi còn thiếu.

## Tệp không được sửa

`src/main.jsx`, `src/data/todos.js` (mã nền), `giao_dien_mau/`, thư mục `tests/` và các tệp cấu hình (`package.json`, `vite.config.js`, `index.html`).

## Giao diện mẫu trên GitHub

Giao diện mẫu của bài cũng có trên GitHub: https://github.com/ngoquy12/reactjs-giao-dien-mau/tree/main/session-01/bai-2-todo-list. Clone cả repo bằng `git clone https://github.com/ngoquy12/reactjs-giao-dien-mau.git` rồi mở `session-01/bai-2-todo-list/index.html` bằng trình duyệt.
