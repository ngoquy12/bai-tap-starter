// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// "Hôm nay" của Task Hub là hằng số để kết quả không phụ thuộc ngày giờ thật.
export const TODAY = "2026-11-11";

// Nhãn tiếng Việt của độ ưu tiên (giá trị lưu trong dữ liệu: low, medium, high).
export const PRIORITY_LABELS = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
};

// Giá trị ban đầu của bộ lọc: không lọc gì cả.
// query: từ khóa trong tên công việc; priority: "all" hoặc low/medium/high;
// assignee: "all", "unassigned" (chưa giao) hoặc id nhân viên dạng chuỗi, ví dụ "7".
export const EMPTY_FILTERS = { query: "", priority: "all", assignee: "all" };
