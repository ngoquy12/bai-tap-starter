// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import PriorityBadge from "./PriorityBadge.jsx";
import formatDate from "../utils/formatDate.js";
import isOverdue from "../utils/isOverdue.js";

// Nút đổi trạng thái của từng cột: nhãn nút và trạng thái mới.
const NEXT_STEP = {
  todo: { label: "Bắt đầu", status: "doing" },
  doing: { label: "Hoàn thành", status: "done" },
  done: { label: "Mở lại", status: "todo" },
};

// Một thẻ công việc. Bấm nút đổi trạng thái gọi onMove(task.id, trạng thái mới).
function TaskCard({ task, assignee, today, onMove }) {
  const step = NEXT_STEP[task.status];
  const isDone = task.status === "done";
  return (
    <li className="card mb-2">
      <div className="card-body p-3">
        <h4 className={`h6 card-title${isDone ? " text-decoration-line-through" : ""}`}>{task.title}</h4>
        <div className="mb-2">
          <PriorityBadge priority={task.priority} />
          {isOverdue(task, today) && <span className="badge text-bg-danger ms-1">Quá hạn</span>}
        </div>
        <p className="card-text small mb-1">{assignee ? `Người nhận: ${assignee.name}` : "Chưa giao"}</p>
        <p className="card-text small text-secondary mb-2">{`Hạn: ${formatDate(task.dueDate)}`}</p>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onMove(task.id, step.status)}>
          {step.label}
        </button>
      </div>
    </li>
  );
}

export default TaskCard;
