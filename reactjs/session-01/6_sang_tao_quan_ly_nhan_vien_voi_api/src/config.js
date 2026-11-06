// ===== BÀI LÀM: dán endpoint crudcrud của bạn vào API_BASE =====
// Endpoint crudcrud của BẠN: mở https://crudcrud.com, sao chép địa chỉ (dạng https://crudcrud.com/api/<32 ký tự>),
// dán thay cho giá trị mẫu bên dưới (không có dấu / ở cuối), rồi chạy `npm run seed` đúng một lần.
export const API_BASE = "https://crudcrud.com/api/00000000000000000000000000000000";

// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Hằng số dùng chung của ứng dụng quản lý nhân viên.

// Số nhân viên mỗi trang của danh sách.
export const PAGE_SIZE = 5;

// "Hôm nay" của ứng dụng (cố định để kết quả không đổi theo ngày chạy).
export const TODAY = "2026-11-06";

export const DEPARTMENTS = ["Kỹ thuật", "Nhân sự", "Kinh doanh", "Kế toán"];

export const CITIES = ["Hà Nội", "Đà Nẵng", "TP. Hồ Chí Minh", "Huế"];

// Giá trị lưu trên máy chủ và nhãn hiển thị của trạng thái nhân viên.
export const STATUSES = [
  { value: "active", label: "Đang làm việc" },
  { value: "probation", label: "Thử việc" },
  { value: "resigned", label: "Đã nghỉ việc" },
];

// Giá trị ban đầu của form thêm nhân viên.
export const EMPTY_EMPLOYEE = {
  name: "",
  email: "",
  department: "Kỹ thuật",
  position: "",
  salary: 0,
  city: "Hà Nội",
  status: "active",
  joinedAt: TODAY,
};
// ===== HẾT MÃ NỀN =====
