// ===== Mã nền (có sẵn, KHÔNG sửa), trừ dòng API_BASE: bạn dán endpoint crudcrud của mình vào đó =====
// Endpoint riêng của bạn lấy ở https://crudcrud.com (dạng https://crudcrud.com/api/<32 ký tự>), không có dấu / ở cuối.
// Giá trị dưới đây chỉ là chỗ giữ chỗ: `npm run seed` từ chối nó, nhưng `npm test` vẫn chạy được vì test dùng API giả.
export const API_BASE = "https://crudcrud.com/api/00000000000000000000000000000000";

// "Hôm nay" của ứng dụng là hằng số này (không dùng ngày giờ thật) để kết quả ổn định.
export const TODAY = "2026-11-11";
