// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Bộ lọc: danh sách chọn Trạng thái và ô Tìm công việc (cả hai là ô nhập kiểm soát, state nằm ở cha).
// status: "" (Tất cả), "todo", "doing", "done".
function TaskFilters({ status, q, onStatusChange, onQChange }) {
  return (
    <div className="row g-2 mb-3">
      <div className="col-sm-4">
        <label htmlFor="filter-status" className="form-label">
          Trạng thái
        </label>
        <select id="filter-status" className="form-select" value={status} onChange={(event) => onStatusChange(event.target.value)}>
          <option value="">Tất cả</option>
          <option value="todo">Cần làm</option>
          <option value="doing">Đang làm</option>
          <option value="done">Hoàn thành</option>
        </select>
      </div>
      <div className="col-sm-8">
        <label htmlFor="filter-q" className="form-label">
          Tìm công việc
        </label>
        <input id="filter-q" className="form-control" value={q} onChange={(event) => onQChange(event.target.value)} />
      </div>
    </div>
  );
}

export default TaskFilters;
