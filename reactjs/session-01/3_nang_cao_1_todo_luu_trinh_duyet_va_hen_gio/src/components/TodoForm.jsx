// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { useState } from "react";

// Form thêm việc: onAdd(title) trả về thông báo lỗi (chuỗi) hoặc chuỗi rỗng khi thêm được.
function TodoForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const message = onAdd(title);
    setError(message);
    if (message === "") {
      setTitle("");
    }
  }

  return (
    <form className="mb-3" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          className="form-control"
          placeholder="Việc cần làm"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Thêm
        </button>
      </div>
      {error !== "" && (
        <div role="alert" className="alert alert-danger py-2 mt-2 mb-0">
          {error}
        </div>
      )}
    </form>
  );
}

export default TodoForm;
