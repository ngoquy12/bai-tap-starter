// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import TaskBoard from "./components/TaskBoard.jsx";
import tasks from "./data/tasks.js";
import employees from "./data/employees.js";
import { TODAY } from "./config.js";

// Trang chính của Task Hub: tiêu đề và bảng công việc dựng từ dữ liệu có sẵn.
function App() {
  return (
    <main className="container py-4">
      <h1 className="h3 mb-3">Task Hub</h1>
      <TaskBoard tasks={tasks} employees={employees} today={TODAY} />
    </main>
  );
}

export default App;
