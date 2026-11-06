// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang làm" },
  { value: "completed", label: "Hoàn thành" },
];

// Ba nút lọc theo trạng thái; nút đang chọn có aria-pressed="true" và lớp active.
function TodoFilter({ value, onChange }) {
  return (
    <div className="btn-group mb-3" role="group" aria-label="Lọc việc">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          className={value === option.value ? "btn btn-outline-primary active" : "btn btn-outline-primary"}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default TodoFilter;
