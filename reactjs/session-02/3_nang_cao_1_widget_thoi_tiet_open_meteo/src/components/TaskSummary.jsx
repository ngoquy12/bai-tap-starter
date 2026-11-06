// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import isOverdue from "../utils/isOverdue.js";

// Dòng tóm tắt luôn tính trên toàn bộ công việc; dòng "Đang hiển thị" tính trên kết quả lọc.
function TaskSummary(props) {
  const { allTasks, visibleCount, today } = props;
  const overdue = allTasks.filter((task) => isOverdue(task, today)).length;
  return (
    <div className="mb-3">
      <p className="mb-0">{`Tổng: ${allTasks.length} công việc | Quá hạn: ${overdue}`}</p>
      <p className="mb-0">{`Đang hiển thị ${visibleCount} / ${allTasks.length} công việc`}</p>
    </div>
  );
}

export default TaskSummary;
