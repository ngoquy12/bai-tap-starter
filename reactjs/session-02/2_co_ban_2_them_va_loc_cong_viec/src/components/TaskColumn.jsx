// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import TaskCard from "./TaskCard.jsx";

// Một cột của bảng: tiêu đề kèm số công việc, thẻ sắp theo hạn tăng dần.
function TaskColumn({ title, tasks, employeesById, today, onMove }) {
  const sorted = [...tasks].sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
  return (
    <section className="col-md-4">
      <div className="bg-light rounded p-3">
        <h3 className="h5 mb-3">{`${title} (${tasks.length})`}</h3>
        {sorted.length === 0 ? (
          <p className="text-secondary mb-0">Không có công việc nào.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {sorted.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                assignee={employeesById[task.assigneeId]}
                today={today}
                onMove={onMove}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default TaskColumn;
