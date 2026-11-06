// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { Link, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch.js";
import { getTask } from "../api/tasks.js";
import formatDate from "../utils/formatDate.js";
import { PRIORITY_LABELS, STATUS_LABELS } from "../utils/labels.js";

// Chi tiết một công việc theo id trên URL.
function TaskDetailPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetch((signal) => getTask(id, signal), [id]);

  return (
    <section>
      <p><Link to="/tasks">Quay lại danh sách</Link></p>
      {loading && <p role="status">Đang tải...</p>}
      {error && <p role="alert">{error}</p>}
      {data && (
        <div>
          <h2>{data.title}</h2>
          <p>Trạng thái: {STATUS_LABELS[data.status]}</p>
          <p>Độ ưu tiên: {PRIORITY_LABELS[data.priority]}</p>
          <p>Hạn: {formatDate(data.dueDate)}</p>
        </div>
      )}
    </section>
  );
}

export default TaskDetailPage;
