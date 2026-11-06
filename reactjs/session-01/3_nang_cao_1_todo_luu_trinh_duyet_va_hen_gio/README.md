# Bài 3: Nâng cấp Todo list (lưu trong trình duyệt, tiêu đề tab, tìm kiếm trễ, hẹn giờ tập trung)

Dự án Vite + React 18.3.1 + Vitest. Đề bài nằm trong `../de_bai_bai_tap.md`.

## Cách chạy

```bash
npm install      # dùng package.json đã ghim phiên bản; không chạy npm create vite
npm run dev      # mở trang tại địa chỉ Vite in ra (thường là http://localhost:5173)
npm test         # chạy bộ test tự chấm (26 test, dùng đồng hồ giả nên chạy nhanh)
```

Bài này không gọi API ghi dữ liệu nên không cần `npm run seed`.

## Giao diện mẫu

Mở `giao_dien_mau/index.html` bằng trình duyệt để xem giao diện (HTML + Bootstrap 5.3.3). Chuyển từng khối HTML sang JSX bằng https://transform.tools/html-to-jsx, tách component rồi nối hành vi, như hướng dẫn ở mục 2.2 của đề. Không sửa thư mục `giao_dien_mau/`.

## Tệp phải làm (có dòng đầu `// ===== BÀI LÀM: ... =====`)

- `src/App.jsx`: lưu và đọc `localStorage`, tiêu đề tab, lọc theo từ khóa, ghép `SearchBox` và `FocusTimer`.
- `src/components/SearchBox.jsx`: ô tìm kiếm trễ.
- `src/components/FocusTimer.jsx`: hẹn giờ tập trung.

## Tệp không được sửa

- Phần nằm giữa `// ===== Mã nền (có sẵn, KHÔNG sửa) =====` và `// ===== HẾT MÃ NỀN =====` trong `src/App.jsx`.
- Các tệp có dòng đầu `// ===== Mã nền (có sẵn, KHÔNG sửa) =====`: `src/main.jsx`, `src/config.js`, `src/data/todos.js`, `src/utils/formatClock.js`, `src/components/Todo*.jsx`.
- Thư mục `tests/`, `package.json`, `vite.config.js`, `index.html`, `scripts/`.

## Giao diện mẫu trên GitHub

Giao diện mẫu của bài cũng có trên GitHub: https://github.com/ngoquy12/reactjs-giao-dien-mau/tree/main/session-01/bai-3-todo-luu-trinh-duyet-va-hen-gio. Clone cả repo bằng `git clone https://github.com/ngoquy12/reactjs-giao-dien-mau.git` rồi mở `session-01/bai-3-todo-luu-trinh-duyet-va-hen-gio/index.html` bằng trình duyệt.
