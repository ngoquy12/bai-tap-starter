// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import TaskColumn from "./TaskColumn.jsx";

const COLUMNS = [
  { status: "todo", title: "Cần làm" },
  { status: "doing", title: "Đang làm" },
  { status: "done", title: "Hoàn thành" },
];

// Bảng ba cột; chia công việc vào cột theo status.
function TaskBoard(props) {
  const { tasks, employees, today, onMove } = props;
  const employeesById = {};
  employees.forEach((employee) => {
    employeesById[employee.id] = employee;
  });
  return (
    <div className="row g-3">
      {COLUMNS.map((column) => (
        <div className="col-md-4" key={column.status}>
          <TaskColumn
            title={column.title}
            tasks={tasks.filter((task) => task.status === column.status)}
            employeesById={employeesById}
            today={today}
            onMove={onMove}
          />
        </div>
      ))}
    </div>
  );
}

export default TaskBoard;
