// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import PriorityBadge from "./PriorityBadge.jsx";
import formatDate from "../utils/formatDate.js";
import isOverdue from "../utils/isOverdue.js";
import { ACTION_LABELS, STATUS_LABELS } from "../utils/taskLabels.js";
import { TODAY } from "../config.js";

// Một dòng công việc. Chỉ hiển thị và gọi callback; không gọi API.
// busy = true khi dòng đang chờ máy chủ: cả hai nút bị vô hiệu và nút đổi trạng thái hiện vòng quay.
function TaskRow({ task, assignee, busy, onChangeStatus, onDelete }) {
  return (
    <li className="list-group-item d-flex flex-column flex-md-row justify-content-between gap-2">
      <div>
        <h4 className={task.status === "done" ? "h6 mb-1 text-decoration-line-through" : "h6 mb-1"}>{task.title}</h4>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <span className="small text-body-secondary">Trạng thái: {STATUS_LABELS[task.status]}</span>
          {isOverdue(task, TODAY) && <span className="badge text-bg-danger">Quá hạn</span>}
        </div>
        <div className="small text-body-secondary">
          Người nhận: {assignee ? assignee.name : "Chưa giao"} | Hạn: {formatDate(task.dueDate)}
        </div>
      </div>
      <div className="d-flex align-items-start gap-2">
        <button type="button" className="btn btn-sm btn-outline-primary" disabled={busy} onClick={() => onChangeStatus(task)}>
          {busy && <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>}
          {ACTION_LABELS[task.status]}
        </button>
        <button type="button" className="btn btn-sm btn-outline-danger" disabled={busy} aria-label={`Xóa ${task.title}`} onClick={() => onDelete(task)}>
          Xóa
        </button>
      </div>
    </li>
  );
}

export default TaskRow;
