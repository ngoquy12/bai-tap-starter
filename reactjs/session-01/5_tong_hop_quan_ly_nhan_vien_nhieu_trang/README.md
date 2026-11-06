# Bài 5: Quản lý nhân viên nhiều trang với React Router

Dự án Vite + React 18.3.1 + React Router 6.30.1 + Vitest. Đề bài nằm trong `de_bai_bai_tap.md`.

## Cách chạy

```bash
npm install      # dùng package.json đã ghim phiên bản; không chạy npm create vite
npm run dev      # mở trang tại địa chỉ Vite in ra (thường là http://localhost:5173)
npm test         # chạy bộ test tự chấm (26 test, dùng MemoryRouter)
```

Bài này dùng dữ liệu trong bộ nhớ, không cần `npm run seed`.

## Giao diện mẫu

Thư mục `giao_dien_mau/` chứa HTML + Bootstrap 5.3.3 của từng màn hình (`index.html` là trang mục lục). Mở bằng trình duyệt (cần mạng), rồi chuyển từng khối sang JSX bằng https://transform.tools/html-to-jsx theo hướng dẫn trong đề. `main.jsx` đã nạp Bootstrap CSS.

## Tệp bạn phải làm (có dòng đầu `// ===== BÀI LÀM: ... =====`)

- `src/App.jsx`
- `src/components/MainLayout.jsx`, `src/components/RequireAuth.jsx`
- `src/context/AuthContext.jsx`
- `src/pages/EmployeesPage.jsx`, `EmployeeDetailPage.jsx`, `EmployeeFormPage.jsx`, `LoginPage.jsx`, `NotFoundPage.jsx`

## Tệp không được sửa

Mọi tệp còn lại trong `src/` (dòng đầu `// ===== Mã nền (có sẵn, KHÔNG sửa) =====`), thư mục `tests/` và các tệp cấu hình. `src/main.jsx` đã bọc sẵn `BrowserRouter`, `EmployeeProvider` và `AuthProvider`.

## Thử tay khi chạy `npm run dev`

Gõ thẳng lên thanh địa chỉ `/employees?department=Nhân sự&q=an`, `/employees/3`, `/employees/99`, `/employees/new` (khi chưa đăng nhập) và một địa chỉ lạ như `/abc`. Dữ liệu nằm trong bộ nhớ nên tải lại trang là về dữ liệu mẫu.

## Giao diện mẫu trên GitHub

Giao diện mẫu của bài cũng có trên GitHub: https://github.com/ngoquy12/reactjs-giao-dien-mau/tree/main/session-01/bai-5-quan-ly-nhan-vien-nhieu-trang. Clone cả repo bằng `git clone https://github.com/ngoquy12/reactjs-giao-dien-mau.git` rồi mở `session-01/bai-5-quan-ly-nhan-vien-nhieu-trang/index.html` bằng trình duyệt.
