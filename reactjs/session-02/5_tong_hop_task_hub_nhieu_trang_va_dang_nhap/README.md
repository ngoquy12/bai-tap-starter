# [Tổng hợp] Task Hub nhiều trang: đăng nhập, công việc và hồ sơ nhân viên

Dự án Vite + React 18.3.1 + React Router 6 + axios, dữ liệu lưu trên API công khai crudcrud.com. Đọc đề ở `de_bai_bai_tap.md`.

## Cách chạy

```bash
npm install
# Mở https://crudcrud.com, sao chép endpoint (https://crudcrud.com/api/<32 ký tự>) và dán vào API_BASE trong src/config.js
npm run seed    # nạp 8 nhân viên và 12 công việc vào endpoint của bạn: chạy đúng một lần (22 yêu cầu)
npm run dev     # chạy ứng dụng
npm test        # test tự chấm (không gọi mạng, không cần endpoint)
```

Mỗi endpoint chỉ nhận 100 yêu cầu và bị xóa sau 24 giờ. Hết hạn mức hoặc hết hạn thì lấy endpoint mới ở crudcrud.com, dán lại và chạy lại `npm run seed`.

## Giao diện mẫu

`giao_dien_mau/` là giao diện HTML + Bootstrap 5.3.3: mở `giao_dien_mau/index.html` bằng trình duyệt. Chuyển từng khối `Component` sang JSX bằng https://transform.tools/html-to-jsx rồi nối dữ liệu và hành vi (xem đề). Bootstrap đã cài sẵn và nạp ở `src/main.jsx`.

## Tệp cần làm

`src/context/AuthContext.jsx`, `src/components/RequireAuth.jsx`, `src/components/MainLayout.jsx`, `src/pages/LoginPage.jsx`, `TasksPage.jsx`, `TaskDetailPage.jsx`, `EmployeesPage.jsx`, `EmployeeProfilePage.jsx`, `NotFoundPage.jsx`, `src/App.jsx`

## Không được sửa

Thư mục `tests/`, `scripts/`, `giao_dien_mau/`, `db.seed.json`, `src/api/`, `src/context/DataContext.jsx`, `src/components/TaskCard.jsx`, `PriorityBadge.jsx`, `EmployeeCard.jsx`, `src/utils/`, `src/main.jsx`. Trong `src/config.js` chỉ thay giá trị `API_BASE`.

## Giao diện mẫu trên GitHub

Giao diện mẫu của bài cũng có trên GitHub: https://github.com/ngoquy12/reactjs-giao-dien-mau/tree/main/session-02/bai-5-task-hub-nhieu-trang-va-dang-nhap. Clone cả repo bằng `git clone https://github.com/ngoquy12/reactjs-giao-dien-mau.git` rồi mở `session-02/bai-5-task-hub-nhieu-trang-va-dang-nhap/index.html` bằng trình duyệt.
