# Bài 2 - Task Hub: thêm, đổi trạng thái và lọc công việc

Dự án Vite + React 18.3.1 + Vitest. Đọc đề ở `de_bai_bai_tap.md`.

## Cách chạy

```bash
npm install
npm run dev     # chạy ứng dụng
npm test        # chạy test tự chấm
```

Bài này dùng dữ liệu cục bộ, không cần `npm run seed`.

## Giao diện mẫu

Mở `giao_dien_mau/index.html` bằng trình duyệt để xem trang HTML + Bootstrap mẫu. Chuyển từng khối (`TaskForm`, `TaskFilters`) sang JSX bằng https://transform.tools/html-to-jsx rồi nối state và hành vi. Chi tiết ở `de_bai_bai_tap.md`.

## Tệp cần làm

- `src/App.jsx`: state `tasks` và `filters`, hàm `addTask`, `moveTask`, danh sách đã lọc.
- `src/components/TaskForm.jsx`
- `src/components/TaskFilters.jsx`

Các tệp này có dòng đầu `// ===== BÀI LÀM: ... =====`.

## Không được sửa

Thư mục `tests/`, `src/config.js`, `src/data/`, `src/utils/`, `src/main.jsx` và các component `PriorityBadge`, `TaskCard`, `TaskColumn`, `TaskBoard` (mã nền). Khối mã giữa `// ===== Mã nền (có sẵn, KHÔNG sửa) =====` và `// ===== HẾT MÃ NỀN =====` cũng là mã nền.

## Giao diện mẫu trên GitHub

Giao diện mẫu của bài cũng có trên GitHub: https://github.com/ngoquy12/reactjs-giao-dien-mau/tree/main/session-02/bai-2-them-va-loc-cong-viec. Clone cả repo bằng `git clone https://github.com/ngoquy12/reactjs-giao-dien-mau.git` rồi mở `session-02/bai-2-them-va-loc-cong-viec/index.html` bằng trình duyệt.
