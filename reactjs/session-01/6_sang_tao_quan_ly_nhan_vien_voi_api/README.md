# Quản lý nhân viên Rikkei - Bài 6: API công khai crudcrud bằng axios

Dự án Vite + React 18.3.1 + Vitest. Đề bài nằm trong `de_bai_bai_tap.md`.

## Cách chạy

```bash
npm install      # dùng package.json đã ghim phiên bản; không chạy npm create vite
# Mở https://crudcrud.com, sao chép endpoint (https://crudcrud.com/api/<32 ký tự>), dán vào API_BASE trong src/config.js
npm run seed     # nạp 12 nhân viên mẫu vào endpoint của bạn, chạy đúng MỘT lần cho mỗi endpoint (13 yêu cầu)
npm run dev      # mở địa chỉ Vite in ra (thường là http://localhost:5173)
npm test         # chạy bộ test tự chấm (30 test, dùng bản giả của crudcrud nên không tốn yêu cầu và không cần mạng)
```

Mỗi endpoint chỉ nhận 100 yêu cầu và bị xóa sau 24 giờ. Khi ứng dụng báo `Không kết nối được máy chủ` dù mạng tốt, hãy lấy endpoint mới ở crudcrud.com, dán lại vào `src/config.js` rồi chạy `npm run seed`.

## Giao diện mẫu

`giao_dien_mau/` chứa HTML + Bootstrap 5.3.3 của ứng dụng. Mở `giao_dien_mau/index.html` bằng trình duyệt để xem, rồi chuyển từng khối sang JSX bằng https://transform.tools/html-to-jsx (xem mục (b) của đề). Không sửa các tệp trong `giao_dien_mau`.

## Tệp phải làm (có dòng đầu `// ===== BÀI LÀM: ... =====`)

- `src/config.js` (chỉ dòng `API_BASE` ở đầu tệp)
- `src/api/http.js`, `src/api/employees.js`
- `src/hooks/useEmployees.js`, `src/hooks/useEmployee.js`
- `src/pages/EmployeesPage.jsx`, `src/pages/EmployeeDetailPage.jsx`, `src/pages/EmployeeCreatePage.jsx`, `src/pages/EmployeeEditPage.jsx`

## Tệp không được sửa

- Mọi phần nằm giữa `// ===== Mã nền (có sẵn, KHÔNG sửa) =====` và `// ===== HẾT MÃ NỀN =====`, và các tệp toàn mã nền: `src/App.jsx`, `src/main.jsx`, `src/context/EmployeesContext.jsx`, `giao_dien_mau/`, `src/components/`, `src/utils/`, `src/pages/NotFoundPage.jsx`.
- Thư mục `tests`, `db.seed.json`, `scripts`, `vite.config.js`, `package.json`.

## Giao diện mẫu trên GitHub

Giao diện mẫu của bài cũng có trên GitHub: https://github.com/ngoquy12/reactjs-giao-dien-mau/tree/main/session-01/bai-6-quan-ly-nhan-vien-voi-api. Clone cả repo bằng `git clone https://github.com/ngoquy12/reactjs-giao-dien-mau.git` rồi mở `session-01/bai-6-quan-ly-nhan-vien-voi-api/index.html` bằng trình duyệt.
