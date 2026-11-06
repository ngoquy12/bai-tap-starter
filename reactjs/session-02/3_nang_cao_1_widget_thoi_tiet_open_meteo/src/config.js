// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Cấu hình chung của Task Hub.

// "Hôm nay" của ứng dụng là hằng số để kết quả không đổi theo ngày giờ thật.
export const TODAY = "2026-11-11";

// Bốn văn phòng của công ty, thứ tự này cũng là thứ tự trong danh sách chọn.
export const OFFICES = ["Hà Nội", "Đà Nẵng", "TP. Hồ Chí Minh", "Huế"];

// Từ khóa gửi cho API tìm thành phố khi tên văn phòng không phải tên mà API biết.
// Văn phòng không có trong bảng này thì dùng thẳng tên văn phòng làm từ khóa.
export const OFFICE_SEARCH_NAMES = {
  "TP. Hồ Chí Minh": "Hồ Chí Minh",
};
