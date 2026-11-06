// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import TodoItem from "./TodoItem.jsx";

// Danh sách việc đang hiển thị; rỗng thì hiện emptyMessage (nếu có).
function TodoList({ todos, onToggle, onDelete, emptyMessage }) {
  if (todos.length === 0) {
    return emptyMessage ? <p className="text-muted fst-italic">{emptyMessage}</p> : null;
  }
  return (
    <ul className="list-group mb-3">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}

export default TodoList;
