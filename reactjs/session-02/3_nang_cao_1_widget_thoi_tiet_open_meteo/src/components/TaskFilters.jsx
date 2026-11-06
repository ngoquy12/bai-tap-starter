// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Bộ lọc công việc: tên, độ ưu tiên, người nhận. Nút "Xóa bộ lọc" đưa về mặc định.
function TaskFilters(props) {
  const { filters, employees, onChange } = props;
  return (
    <div className="row g-2 align-items-end mb-3" role="search" aria-label="Lọc công việc">
      <div className="col-md-3">
        <label htmlFor="filter-keyword" className="form-label">
          Tìm công việc
        </label>
        <input
          id="filter-keyword"
          className="form-control"
          value={filters.keyword}
          onChange={(event) => onChange({ ...filters, keyword: event.target.value })}
        />
      </div>
      <div className="col-md-3">
        <label htmlFor="filter-priority" className="form-label">
          Lọc độ ưu tiên
        </label>
        <select
          id="filter-priority"
          className="form-select"
          value={filters.priority}
          onChange={(event) => onChange({ ...filters, priority: event.target.value })}
        >
          <option value="all">Tất cả</option>
          <option value="low">Thấp</option>
          <option value="medium">Trung bình</option>
          <option value="high">Cao</option>
        </select>
      </div>
      <div className="col-md-4">
        <label htmlFor="filter-assignee" className="form-label">
          Lọc người nhận
        </label>
        <select
          id="filter-assignee"
          className="form-select"
          value={filters.assignee}
          onChange={(event) => onChange({ ...filters, assignee: event.target.value })}
        >
          <option value="all">Tất cả</option>
          <option value="none">Chưa giao</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-2">
        <button
          type="button"
          className="btn btn-outline-secondary w-100"
          onClick={() => onChange({ keyword: "", priority: "all", assignee: "all" })}
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
}

export default TaskFilters;
