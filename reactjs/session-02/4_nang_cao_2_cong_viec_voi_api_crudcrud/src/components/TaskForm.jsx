// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { useState } from "react";
import { PRIORITY_LABELS } from "../utils/taskLabels.js";

// Form thêm công việc. onAdd(draft) phải trả Promise<boolean>:
// true = máy chủ đã nhận (form xóa chữ), false = lỗi (form GIỮ chữ để bấm lại).
// draft = { title, priority, assigneeCode (mã nhân viên như "NV02", hoặc null khi chưa giao), dueDate }.
// busy = true khi đang chờ máy chủ: nút Thêm công việc bị vô hiệu.
function TaskForm({ employees, onAdd, busy }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assigneeCode, setAssigneeCode] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const assignable = employees.filter((employee) => employee.status !== "resigned");

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    if (title.trim() === "") {
      setError("Vui lòng nhập tên công việc.");
      return;
    }
    if (dueDate === "") {
      setError("Vui lòng chọn hạn hoàn thành.");
      return;
    }
    setError("");
    const ok = await onAdd({
      title: title.trim(),
      priority,
      assigneeCode: assigneeCode === "" ? null : assigneeCode,
      dueDate,
    });
    if (ok) {
      setTitle("");
      setPriority("medium");
      setAssigneeCode("");
      setDueDate("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card card-body mb-3">
      <div className="row g-2">
        <div className="col-12">
          <label htmlFor="task-title" className="form-label">
            Tên công việc
          </label>
          <input id="task-title" className="form-control" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="col-md-4">
          <label htmlFor="task-priority" className="form-label">
            Độ ưu tiên
          </label>
          <select id="task-priority" className="form-select" value={priority} onChange={(event) => setPriority(event.target.value)}>
            {Object.keys(PRIORITY_LABELS).map((key) => (
              <option key={key} value={key}>
                {PRIORITY_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="task-assignee" className="form-label">
            Người nhận
          </label>
          <select id="task-assignee" className="form-select" value={assigneeCode} onChange={(event) => setAssigneeCode(event.target.value)}>
            <option value="">Chưa giao</option>
            {assignable.map((employee) => (
              <option key={employee._id} value={employee.code}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="task-due" className="form-label">
            Hạn hoàn thành
          </label>
          <input id="task-due" type="date" className="form-control" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-danger small mt-2 mb-0">
          {error}
        </p>
      )}
      <div className="mt-3">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          Thêm công việc
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
