// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import TaskColumn from "./TaskColumn.jsx";
import isOverdue from "../utils/isOverdue.js";

const COLUMNS = [
  { status: "todo", title: "Cần làm" },
  { status: "doing", title: "Đang làm" },
  { status: "done", title: "Hoàn thành" },
];

// Bảng ba cột. tasks là danh sách ĐÃ LỌC để vẽ cột; allTasks là toàn bộ công việc để tính tóm tắt.
function TaskBoard({ tasks, allTasks, employees, today, onMove }) {
  const employeesById = {};
  employees.forEach((employee) => {
    employeesById[employee.id] = employee;
  });
  const overdueCount = allTasks.filter((task) => isOverdue(task, today)).length;
  return (
    <div>
      <p className="mb-1 fw-semibold">{`Tổng: ${allTasks.length} công việc | Quá hạn: ${overdueCount}`}</p>
      <p className="text-secondary">{`Đang hiển thị ${tasks.length} / ${allTasks.length} công việc`}</p>
      <div className="row g-3">
        {COLUMNS.map((column) => (
          <TaskColumn
            key={column.status}
            title={column.title}
            tasks={tasks.filter((task) => task.status === column.status)}
            employeesById={employeesById}
            today={today}
            onMove={onMove}
          />
        ))}
      </div>
    </div>
  );
}

export default TaskBoard;
