// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const PRIORITY_LABELS = { low: "Thấp", medium: "Trung bình", high: "Cao" };
const PRIORITY_CLASSES = { low: "text-bg-secondary", medium: "text-bg-warning", high: "text-bg-danger" };

// Huy hiệu độ ưu tiên của công việc.
function PriorityBadge(props) {
  const { priority } = props;
  return (
    <span className={`badge ${PRIORITY_CLASSES[priority] ?? "text-bg-light"} me-1`}>
      {PRIORITY_LABELS[priority] ?? "Không rõ"}
    </span>
  );
}

export default PriorityBadge;
