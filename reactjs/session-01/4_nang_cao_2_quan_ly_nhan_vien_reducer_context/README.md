# Quản lý nhân viên - Bài 4: thêm, sửa, xóa bằng reducer và context

Dự án Vite + React 18.3.1 + Vitest. Đề bài nằm trong `de_bai_bai_tap.md`. Dữ liệu nằm trong bộ nhớ, bài này không gọi mạng.

## Cách chạy

```bash
npm install      # dùng package.json đã ghim phiên bản; không chạy npm create vite
npm run dev      # mở trang tại địa chỉ Vite in ra (thường là http://localhost:5173)
npm test         # chạy bộ test tự chấm (26 test)
```

## Giao diện mẫu

Thư mục `giao_dien_mau/` có `index.html` (HTML + Bootstrap 5.3.3, mở bằng cách bấm đúp, không cần máy chủ) gồm màn hình chính và "Bảng trạng thái". Mỗi khối nằm giữa hai chú thích `Component: ...` và `Hết: ...`. Chuyển khối HTML sang JSX bằng https://transform.tools/html-to-jsx rồi tách component, nối dữ liệu và sự kiện theo `de_bai_bai_tap.md`. Dự án đã cài sẵn `bootstrap` và nhập CSS trong `src/main.jsx`; không dùng `react-bootstrap`.

## Tệp phải làm (có dòng đầu `// ===== BÀI LÀM: ... =====`)

- `src/reducers/employeesReducer.js`
- `src/context/EmployeeContext.jsx`
- `src/hooks/useDepartmentStats.js`
- `src/components/EmployeeManager.jsx`

## Tệp không được sửa

- Mọi tệp có dòng đầu `// ===== Mã nền (có sẵn, KHÔNG sửa) =====`: `src/App.jsx`, `src/config.js`, `src/data/`, `src/utils/`, `src/main.jsx` và các component còn lại trong `src/components/` (`StatusBadge`, `EmployeeCard`, `EmployeeList`, `EmployeeForm`, `DepartmentSummary`).
- Thư mục `tests/` và các tệp cấu hình (`package.json`, `vite.config.js`, `index.html`).

Khi chạy `npm run dev`, thử thêm một nhân viên trùng email, sửa rồi bấm Hủy, và xóa đúng người đang được sửa; quan sát danh sách, thông báo và bảng phòng ban cùng đổi.

## Giao diện mẫu trên GitHub

Giao diện mẫu của bài cũng có trên GitHub: https://github.com/ngoquy12/reactjs-giao-dien-mau/tree/main/session-01/bai-4-quan-ly-nhan-vien-reducer-context. Clone cả repo bằng `git clone https://github.com/ngoquy12/reactjs-giao-dien-mau.git` rồi mở `session-01/bai-4-quan-ly-nhan-vien-reducer-context/index.html` bằng trình duyệt.
