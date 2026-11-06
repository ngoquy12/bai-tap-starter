// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Nhãn tiếng Việt của trạng thái và độ ưu tiên.
export const STATUS_LABELS = { todo: "Cần làm", doing: "Đang làm", done: "Hoàn thành" };
export const PRIORITY_LABELS = { low: "Thấp", medium: "Trung bình", high: "Cao" };

// Trạng thái kế tiếp khi bấm nút trên dòng: todo -> doing -> done -> todo.
const NEXT_STATUS = { todo: "doing", doing: "done", done: "todo" };

// Chữ trên nút đổi trạng thái, theo trạng thái HIỆN TẠI của việc.
export const ACTION_LABELS = { todo: "Bắt đầu", doing: "Hoàn thành", done: "Mở lại" };

export function nextStatus(status) {
  return NEXT_STATUS[status];
}
