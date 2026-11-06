// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { PRIORITY_LABELS } from "../utils/labels.js";

// Lớp Bootstrap theo độ ưu tiên: Thấp xanh lá, Trung bình vàng, Cao đỏ.
const PRIORITY_CLASSES = { low: "text-bg-success", medium: "text-bg-warning", high: "text-bg-danger" };

// Huy hiệu độ ưu tiên: Thấp, Trung bình, Cao (màu khác nhau).
function PriorityBadge({ priority }) {
  return <span className={`badge ${PRIORITY_CLASSES[priority] ?? "text-bg-secondary"}`}>{PRIORITY_LABELS[priority] ?? "Không rõ"}</span>;
}

export default PriorityBadge;
