// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import PriorityBadge from "./PriorityBadge.jsx";
import formatDate from "../utils/formatDate.js";
import { TASK_STATUS_LABELS } from "../utils/labels.js";

// Thẻ công việc (giống khối TaskCard trong giao_dien_mau).
//   heading   nội dung tiêu đề (mặc định là task.title); truyền một Link để tiêu đề bấm được
//   assignee  nội dung ở dòng "Người nhận" (tên hoặc Link); mặc định "Chưa giao"
function TaskCard({ task, heading, assignee = "Chưa giao" }) {
  return (
    <article className="card mb-3">
      <div className="card-body">
        <h3 className="card-title h6">{heading ?? task.title}</h3>
        <p className="mb-1">
          <PriorityBadge priority={task.priority} /> <span>Trạng thái: {TASK_STATUS_LABELS[task.status]}</span>
        </p>
        <p className="mb-1">Người nhận: {assignee}</p>
        <p className="mb-0 text-body-secondary">Hạn: {formatDate(task.dueDate)}</p>
      </div>
    </article>
  );
}

export default TaskCard;
