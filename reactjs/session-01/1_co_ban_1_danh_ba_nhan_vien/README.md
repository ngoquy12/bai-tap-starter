# Bài 1: Danh bạ nhân viên (Cơ bản 1)

Trang danh bạ nhân viên chỉ đọc. Mã nền đã có sẵn trang và dữ liệu; bạn viết bốn component để thẻ nhân viên hiện ra. Đọc `de_bai_bai_tap.md` để biết yêu cầu chi tiết.

## Cách chạy

```
npm install
npm run dev     # mở địa chỉ Vite in ra (mặc định http://localhost:5173)
npm test        # chạy 25 test tự chấm
```

## Giao diện mẫu

Mở `giao_dien_mau/index.html` bằng trình duyệt để xem giao diện cần làm (HTML + Bootstrap). Dán từng khối mẫu vào https://transform.tools/html-to-jsx để chuyển sang JSX, rồi tách thành component theo đề.

## Tệp bạn làm (có dòng đầu `// ===== BÀI LÀM: ... =====`)

- `src/components/StatusBadge.jsx`
- `src/components/EmployeeCard.jsx`
- `src/components/EmployeeList.jsx`
- `src/components/EmployeeSummary.jsx`

## Tệp không được sửa

- `src/main.jsx`, `src/App.jsx`, `src/data/employees.js`, `src/utils/formatVnd.js`, `src/utils/formatDate.js`
- Thư mục `tests/`, `giao_dien_mau/`, `package.json`, `vite.config.js`, `index.html`

## Giao diện mẫu trên GitHub

Giao diện mẫu của bài cũng có trên GitHub: https://github.com/ngoquy12/reactjs-giao-dien-mau/tree/main/session-01/bai-1-danh-ba-nhan-vien. Clone cả repo bằng `git clone https://github.com/ngoquy12/reactjs-giao-dien-mau.git` rồi mở `session-01/bai-1-danh-ba-nhan-vien/index.html` bằng trình duyệt.
