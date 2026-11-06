// ===== BÀI LÀM: state danh sách việc và bộ lọc, các hàm thêm, đánh dấu, xóa, lọc, tóm tắt =====
import { useState } from "react";
import todos from "./data/todos.js";

// TODO: giữ state danh sách việc (bắt đầu từ initialTodos) và bộ lọc,
// rồi ghép TodoForm, TodoFilter, TodoList và dòng tóm tắt vào giao diện bên dưới (chuyển HTML từ giao_dien_mau/index.html sang JSX).
function App({ initialTodos = todos }) {
  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Todo list</h1>
    </div>
  );
}

export default App;
