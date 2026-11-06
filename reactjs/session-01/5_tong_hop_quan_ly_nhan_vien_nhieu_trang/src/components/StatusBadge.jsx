// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { STATUS_LABELS } from "../data/options.js";

// Màu huy hiệu theo trạng thái (lớp Bootstrap).
const BADGE_CLASSES = {
  active: "text-bg-success",
  probation: "text-bg-warning",
  resigned: "text-bg-secondary",
};

// Nhãn trạng thái của nhân viên; giá trị lạ hiện "Không rõ".
function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || "Không rõ";
  return <span className={"badge " + (BADGE_CLASSES[status] || "text-bg-light")}>{label}</span>;
}

export default StatusBadge;
