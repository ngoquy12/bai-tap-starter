// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { useState } from "react";
import { TODAY } from "./config.js";
import initialTasks from "./data/tasks.js";
import employees from "./data/employees.js";
import TaskForm from "./components/TaskForm.jsx";
import TaskFilters from "./components/TaskFilters.jsx";
import TaskSummary from "./components/TaskSummary.jsx";
import TaskBoard from "./components/TaskBoard.jsx";
import WeatherWidget from "./components/WeatherWidget.jsx";

// Task Hub: bảng công việc nhóm (thêm, đổi trạng thái, lọc) và widget thời tiết văn phòng ở đầu trang.
function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filters, setFilters] = useState({ keyword: "", priority: "all", assignee: "all" });

  // Thêm công việc mới vào cột "Cần làm"; id mới = id lớn nhất + 1.
  function addTask(data) {
    const nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
    setTasks([...tasks, { id: nextId, status: "todo", ...data }]);
  }

  // Đổi trạng thái một công việc, tạo mảng mới thay vì sửa trực tiếp.
  function moveTask(id, status) {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, status } : task)));
  }

  // Ba điều kiện lọc kết hợp bằng VÀ.
  const keyword = filters.keyword.trim().toLowerCase();
  const visibleTasks = tasks.filter((task) => {
    if (keyword !== "" && !task.title.toLowerCase().includes(keyword)) return false;
    if (filters.priority !== "all" && task.priority !== filters.priority) return false;
    if (filters.assignee === "none") return task.assigneeId === null || task.assigneeId === undefined;
    if (filters.assignee !== "all") return task.assigneeId === Number(filters.assignee);
    return true;
  });

  return (
    <main className="container py-4">
      <h1 className="mb-3">Task Hub</h1>
      <WeatherWidget />
      <TaskForm employees={employees} onAdd={addTask} />
      <TaskFilters filters={filters} employees={employees} onChange={setFilters} />
      <TaskSummary allTasks={tasks} visibleCount={visibleTasks.length} today={TODAY} />
      <TaskBoard tasks={visibleTasks} employees={employees} today={TODAY} onMove={moveTask} />
    </main>
  );
}

export default App;
