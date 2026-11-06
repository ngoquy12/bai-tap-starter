// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Tóm tắt trên toàn bộ danh sách và nút xóa các việc đã xong.
function TodoSummary({ todos, onClearCompleted }) {
  const remaining = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - remaining;

  let text = "Còn " + remaining + " việc chưa xong";
  if (todos.length === 0) {
    text = "Chưa có việc nào.";
  } else if (remaining === 0) {
    text = "Tất cả việc đã xong";
  }

  return (
    <div className="d-flex justify-content-between align-items-center">
      <span className="text-muted">{text}</span>
      <button
        className="btn btn-sm btn-outline-secondary"
        disabled={completedCount === 0}
        onClick={onClearCompleted}
      >
        Xóa việc đã xong
      </button>
    </div>
  );
}

export default TodoSummary;
