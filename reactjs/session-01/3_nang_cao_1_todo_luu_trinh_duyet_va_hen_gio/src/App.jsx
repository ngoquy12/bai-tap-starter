// ===== BÀI LÀM: lưu localStorage, tiêu đề tab, lọc theo từ khóa, ghép SearchBox và FocusTimer =====
import { useState } from "react";
import TodoForm from "./components/TodoForm.jsx";
import TodoFilter from "./components/TodoFilter.jsx";
import TodoList from "./components/TodoList.jsx";
import TodoSummary from "./components/TodoSummary.jsx";
import initialTodos from "./data/todos.js";

// TODO 1: viết hàm đọc danh sách đã lưu trong localStorage (khóa STORAGE_KEY ở src/config.js).
// Chưa có, JSON hỏng hoặc không phải mảng thì trả dữ liệu mẫu.

// Trang Todo: ghép form, bộ lọc, danh sách và tóm tắt.
function App() {
  // TODO 1: khởi tạo lười từ localStorage thay cho initialTodos.
  const [todos, setTodos] = useState(initialTodos);
  const [filter, setFilter] = useState("all");
  // TODO 3: thêm state từ khóa tìm kiếm.

  // ===== Mã nền (có sẵn, KHÔNG sửa) =====
  // Thêm việc: trả về thông báo lỗi hoặc chuỗi rỗng khi thêm được.
  function addTodo(title) {
    const text = title.trim();
    if (text === "") {
      return "Vui lòng nhập nội dung việc cần làm.";
    }
    if (todos.some((todo) => todo.title.toLowerCase() === text.toLowerCase())) {
      return "Việc này đã có trong danh sách.";
    }
    const nextId = todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
    setTodos([...todos, { id: nextId, title: text, completed: false }]);
    return "";
  }

  function toggleTodo(id) {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  }

  function deleteTodo(id) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  function clearCompleted() {
    setTodos(todos.filter((todo) => !todo.completed));
  }

  // Lọc theo trạng thái (bộ lọc của Bài 2).
  const byStatus = todos.filter((todo) => {
    if (filter === "active") {
      return !todo.completed;
    }
    if (filter === "completed") {
      return todo.completed;
    }
    return true;
  });
  // ===== HẾT MÃ NỀN =====

  // TODO 3: lọc thêm theo từ khóa (không phân biệt hoa thường) và đổi emptyMessage khi có từ khóa.
  const visibleTodos = byStatus;
  const emptyMessage = todos.length > 0 ? "Không có việc nào trong mục này." : "";

  // TODO 1: useEffect ghi todos vào localStorage mỗi khi đổi.
  // TODO 2: useEffect đặt document.title theo số việc chưa xong, có cleanup trả tiêu đề cũ.

  return (
    <main className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <h1 className="h3 mb-3">Todo list</h1>
          <section className="card shadow-sm mb-4">
            <div className="card-body">
              <TodoForm onAdd={addTodo} />
              {/* TODO 3: gắn SearchBox ở đây, onSearch cập nhật từ khóa. */}
              <TodoFilter value={filter} onChange={setFilter} />
              <TodoList
                todos={visibleTodos}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                emptyMessage={emptyMessage}
              />
              <TodoSummary todos={todos} onClearCompleted={clearCompleted} />
            </div>
          </section>
          {/* TODO 4: gắn FocusTimer ở đây (initialSeconds lấy từ FOCUS_SECONDS trong src/config.js). */}
        </div>
      </div>
    </main>
  );
}

export default App;
