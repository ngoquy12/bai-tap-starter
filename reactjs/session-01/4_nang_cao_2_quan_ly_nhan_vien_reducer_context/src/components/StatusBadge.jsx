// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { STATUS_OPTIONS } from "../data/constants.js";

// Lớp Bootstrap của huy hiệu theo trạng thái (khớp giao_dien_mau).
const BADGE_CLASSES = {
  active: "badge text-bg-success",
  probation: "badge text-bg-warning",
  resigned: "badge text-bg-secondary",
};

// Huy hiệu trạng thái nhân viên; giá trị lạ hiện "Không rõ".
function StatusBadge({ status }) {
  const option = STATUS_OPTIONS.find((item) => item.value === status);
  const className = BADGE_CLASSES[status] ?? "badge text-bg-light border";
  return <span className={className}>{option ? option.label : "Không rõ"}</span>;
}

export default StatusBadge;
// ===== HẾT MÃ NỀN =====
