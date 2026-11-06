// ===== Mã nền (có sẵn, KHÔNG sửa), trừ dòng API_BASE: bạn dán endpoint crudcrud của mình vào đó =====
// Endpoint riêng của bạn, lấy ở https://crudcrud.com (dạng https://crudcrud.com/api/<32 ký tự>), không có dấu / ở cuối.
// Giá trị toàn số 0 dưới đây chỉ là mẫu: test vẫn chạy với nó, nhưng `npm run seed` và `npm run dev` cần endpoint thật.
export const API_BASE = "https://crudcrud.com/api/00000000000000000000000000000000";

// "Hôm nay" của Task Hub là hằng số, để giao diện và test không phụ thuộc ngày giờ thật.
export const TODAY = "2026-11-11";

// Số công việc trên mỗi trang (phân trang làm ở trình duyệt, vì crudcrud luôn trả cả danh sách).
export const PAGE_SIZE = 5;
