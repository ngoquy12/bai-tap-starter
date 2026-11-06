// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import TaskManager from "./components/TaskManager.jsx";

// Component gốc của Task Hub: tiêu đề và trình quản lý công việc.
function App() {
  return (
    <main className="container py-4">
      <h1 className="h3 mb-3">Task Hub</h1>
      <TaskManager />
    </main>
  );
}

export default App;
