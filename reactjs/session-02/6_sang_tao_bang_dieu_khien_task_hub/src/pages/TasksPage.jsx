// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch.js";
import { getTasks } from "../api/tasks.js";
import { STATUS_LABELS } from "../utils/labels.js";

// Danh sách toàn bộ công việc; mỗi tiêu đề là liên kết tới trang chi tiết (theo _id).
function TasksPage() {
  const { data, loading, error } = useFetch((signal) => getTasks(signal), []);

  return (
    <section>
      <h2>Công việc</h2>
      {loading && <p role="status">Đang tải...</p>}
      {error && <p role="alert">{error}</p>}
      {data && (
        <ul>
          {data.map((task) => (
            <li key={task._id}>
              <Link to={`/tasks/${task._id}`}>{task.title}</Link> ({STATUS_LABELS[task.status]})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TasksPage;
