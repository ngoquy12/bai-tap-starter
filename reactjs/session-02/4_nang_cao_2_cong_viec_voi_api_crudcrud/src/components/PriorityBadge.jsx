// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { PRIORITY_LABELS } from "../utils/taskLabels.js";

// Lớp Bootstrap theo độ ưu tiên.
const BADGE_CLASSES = { low: "text-bg-success", medium: "text-bg-warning", high: "text-bg-danger" };

// Huy hiệu độ ưu tiên: Thấp, Trung bình, Cao.
function PriorityBadge({ priority }) {
  return <span className={`badge ${BADGE_CLASSES[priority]}`}>{PRIORITY_LABELS[priority]}</span>;
}

export default PriorityBadge;
