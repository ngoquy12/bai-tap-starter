// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import PriorityBadge from "./PriorityBadge.jsx";
import formatDate from "../utils/formatDate.js";
import isOverdue from "../utils/isOverdue.js";

// Nút chuyển trạng thái theo từng cột: [nhãn nút, trạng thái mới].
const MOVE_ACTIONS = {
  todo: ["Bắt đầu", "doing"],
  doing: ["Hoàn thành", "done"],
  done: ["Mở lại", "todo"],
};

// Thẻ một công việc: tiêu đề, độ ưu tiên, người nhận, hạn, nhãn quá hạn và nút đổi trạng thái.
function TaskCard(props) {
  const { task, assignee, today, onMove } = props;
  const [moveLabel, nextStatus] = MOVE_ACTIONS[task.status];
  return (
    <li className="card card-body mb-2 p-2">
      <h4 className={`h6 ${task.status === "done" ? "text-decoration-line-through" : ""}`}>{task.title}</h4>
      <PriorityBadge priority={task.priority} />
      {isOverdue(task, today) && <span className="badge text-bg-danger me-1">Quá hạn</span>}
      <p className="small mb-0">{assignee ? `Người nhận: ${assignee.name}` : "Chưa giao"}</p>
      <p className="small mb-1">Hạn: {formatDate(task.dueDate)}</p>
      <button type="button" className="btn btn-sm btn-outline-primary align-self-start" onClick={() => onMove(task.id, nextStatus)}>
        {moveLabel}
      </button>
    </li>
  );
}

export default TaskCard;
