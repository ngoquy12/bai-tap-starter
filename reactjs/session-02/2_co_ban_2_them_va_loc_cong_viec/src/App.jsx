// ===== BÀI LÀM: state tasks và filters, addTask, moveTask, danh sách đã lọc trong App =====
// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import defaultTasks from "./data/tasks.js";
import employees from "./data/employees.js";
import { TODAY, EMPTY_FILTERS } from "./config.js";
import TaskBoard from "./components/TaskBoard.jsx";
import TaskForm from "./components/TaskForm.jsx";
import TaskFilters from "./components/TaskFilters.jsx";
// ===== HẾT MÃ NỀN =====

// Trang chính của Task Hub. Prop initialTasks (có giá trị mặc định) cho phép test dựng ứng dụng với dữ liệu riêng.
function App({ initialTasks = defaultTasks }) {
  // TODO: tạo state tasks (khởi tạo từ initialTasks) và state filters (khởi tạo từ EMPTY_FILTERS)
  // TODO: viết addTask(data) và moveTask(id, status) cập nhật tasks theo cách bất biến
  // TODO: tính danh sách đã lọc (từ khóa, độ ưu tiên, người nhận) ngay lúc render
  return (
    <div className="container py-4">
      <h1 className="h2 mb-3">Task Hub</h1>
      {/* TODO: đặt TaskForm và TaskFilters ở đây */}
      {/* TODO: thay initialTasks bằng state và danh sách đã lọc; truyền onMove={moveTask} */}
      <TaskBoard tasks={initialTasks} allTasks={initialTasks} employees={employees} today={TODAY} onMove={() => {}} />
    </div>
  );
}

export default App;
