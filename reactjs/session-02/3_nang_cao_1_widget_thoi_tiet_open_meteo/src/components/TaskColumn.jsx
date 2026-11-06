// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import TaskCard from "./TaskCard.jsx";

// Một cột của bảng: tiêu đề kèm số công việc, thẻ sắp theo hạn tăng dần.
function TaskColumn(props) {
  const { title, tasks, employeesById, today, onMove } = props;
  // sort trên bản sao để không sửa mảng gốc; sort ổn định nên cùng hạn giữ thứ tự dữ liệu.
  const sorted = [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return (
    <section className="bg-light rounded p-2 h-100" aria-label={title}>
      <h3 className="h5">{`${title} (${tasks.length})`}</h3>
      {sorted.length === 0 ? (
        <p className="text-body-secondary">Không có công việc nào.</p>
      ) : (
        <ul className="list-unstyled mb-0">
          {sorted.map((task) => (
            <TaskCard key={task.id} task={task} assignee={employeesById[task.assigneeId]} today={today} onMove={onMove} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default TaskColumn;
