// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { PRIORITY_LABELS } from "../config.js";

// Lớp Bootstrap của huy hiệu theo độ ưu tiên.
const BADGE_CLASSES = {
  low: "text-bg-info",
  medium: "text-bg-warning",
  high: "text-bg-danger",
};

// Huy hiệu độ ưu tiên: Thấp, Trung bình, Cao.
function PriorityBadge({ priority }) {
  return (
    <span className={`badge ${BADGE_CLASSES[priority] ?? "text-bg-secondary"}`}>
      {PRIORITY_LABELS[priority] ?? "Không rõ"}
    </span>
  );
}

export default PriorityBadge;
