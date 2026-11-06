# Bài 6 (Session 02): Bảng điều khiển Task Hub

Đề bài đầy đủ nằm ở `de_bai_bai_tap.md` (ngoài thư mục `starter`).

## Cách chạy

```
npm install
# 1. Mở https://crudcrud.com, sao chép endpoint của bạn (https://crudcrud.com/api/<32 ký tự>)
# 2. Dán vào API_BASE trong src/config.js
npm run seed     # nạp 8 nhân viên và 12 công việc, chạy đúng MỘT lần cho mỗi endpoint (22 yêu cầu)
npm run dev      # mở ứng dụng, đăng nhập bằng an.nguyen@example.com
npm test         # tự chấm bằng API giả (không tốn yêu cầu nào của endpoint)
```

Mỗi endpoint crudcrud nhận tối đa 100 yêu cầu và bị xóa sau 24 giờ. Hết hạn mức (trình duyệt báo `Network Error`) thì lấy endpoint mới ở https://crudcrud.com, dán lại vào `src/config.js` và chạy lại `npm run seed`.

## Giao diện mẫu

`giao_dien_mau/index.html`: HTML kết hợp Bootstrap 5.3.3, mở bằng cách bấm đúp. Chuyển từng khối sang JSX bằng https://transform.tools/html-to-jsx (xem đề bài).

## Tệp bạn làm (có dòng đầu `// ===== BÀI LÀM: ... =====`)

- `src/utils/calcProgress.js`
- `src/api/updateTask.js`
- `src/hooks/useDashboardData.js`
- `src/pages/DashboardPage.jsx`
- `src/components/GlobalSearch.jsx`

Được thêm component mới trong `src/components/` (`StatCard`, `EmployeeProgress`, `OverdueList`).

## Tệp không được sửa

`giao_dien_mau/` (chỉ để tham khảo), mọi tệp còn lại trong `src/` (có dòng `Mã nền`; riêng `src/config.js` chỉ sửa dòng `API_BASE`), `tests/`, `db.seed.json`, `scripts/`, `package.json`, `vite.config.js`.

## Giao diện mẫu trên GitHub

Giao diện mẫu của bài cũng có trên GitHub: https://github.com/ngoquy12/reactjs-giao-dien-mau/tree/main/session-02/bai-6-bang-dieu-khien-task-hub. Clone cả repo bằng `git clone https://github.com/ngoquy12/reactjs-giao-dien-mau.git` rồi mở `session-02/bai-6-bang-dieu-khien-task-hub/index.html` bằng trình duyệt.
