// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { useState } from "react";

// Form thêm công việc: kiểm tra tên và hạn, rồi gọi onAdd với dữ liệu đã làm sạch.
function TaskForm(props) {
  const { employees, onAdd } = props;
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  // Chỉ nhân viên đang làm hoặc thử việc mới được nhận việc mới.
  const assignable = employees.filter((employee) => employee.status !== "resigned");

  function handleSubmit(event) {
    event.preventDefault();
    if (title.trim() === "") {
      setError("Vui lòng nhập tên công việc.");
      return;
    }
    if (dueDate === "") {
      setError("Vui lòng chọn hạn hoàn thành.");
      return;
    }
    onAdd({ title: title.trim(), priority, assigneeId: assigneeId === "" ? null : Number(assigneeId), dueDate });
    setTitle("");
    setPriority("medium");
    setAssigneeId("");
    setDueDate("");
    setError("");
  }

  return (
    <form className="row g-2 align-items-end mb-3" onSubmit={handleSubmit} aria-label="Thêm công việc">
      <div className="col-md-3">
        <label htmlFor="task-title" className="form-label">
          Tên công việc
        </label>
        <input id="task-title" className="form-control" value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className="col-md-2">
        <label htmlFor="task-priority" className="form-label">
          Độ ưu tiên
        </label>
        <select id="task-priority" className="form-select" value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="low">Thấp</option>
          <option value="medium">Trung bình</option>
          <option value="high">Cao</option>
        </select>
      </div>
      <div className="col-md-3">
        <label htmlFor="task-assignee" className="form-label">
          Người nhận
        </label>
        <select id="task-assignee" className="form-select" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
          <option value="">Chưa giao</option>
          {assignable.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-2">
        <label htmlFor="task-due" className="form-label">
          Hạn hoàn thành
        </label>
        <input id="task-due" type="date" className="form-control" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
      </div>
      <div className="col-md-2">
        <button type="submit" className="btn btn-primary w-100">
          Thêm công việc
        </button>
      </div>
      {error && (
        <div className="col-12">
          <div className="alert alert-danger py-2 mb-0" role="alert">
            {error}
          </div>
        </div>
      )}
    </form>
  );
}

export default TaskForm;
