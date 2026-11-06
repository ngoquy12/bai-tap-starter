// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const LABELS = {
  active: { text: "Đang làm việc", className: "text-bg-success" },
  probation: { text: "Thử việc", className: "text-bg-warning" },
  resigned: { text: "Đã nghỉ việc", className: "text-bg-secondary" },
};

// Huy hiệu trạng thái nhân viên (lớp Bootstrap theo giao_dien_mau); giá trị lạ hiện "Không rõ".
function StatusBadge({ status }) {
  const label = LABELS[status] || { text: "Không rõ", className: "text-bg-light" };
  return <span className={`badge ${label.className}`}>{label.text}</span>;
}

export default StatusBadge;
