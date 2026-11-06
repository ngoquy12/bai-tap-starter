// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Một dòng việc: ô tick có tên là nội dung việc và nút xóa.
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className="list-group-item d-flex justify-content-between align-items-center">
      <label className="d-flex align-items-center gap-2 mb-0">
        <input
          className="form-check-input mt-0"
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span className={todo.completed ? "text-decoration-line-through text-secondary" : ""}>
          {todo.title}
        </span>
      </label>
      <button
        className="btn btn-sm btn-outline-danger"
        aria-label={"Xóa " + todo.title}
        onClick={() => onDelete(todo.id)}
      >
        Xóa
      </button>
    </li>
  );
}

export default TodoItem;
