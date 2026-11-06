// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { useState } from "react";
import { CITIES, DEPARTMENTS, STATUS_OPTIONS } from "../data/constants.js";

const EMPTY_VALUES = {
  name: "",
  email: "",
  department: DEPARTMENTS[0],
  position: "",
  salary: "",
  city: CITIES[0],
  status: "active",
};

// Chuyển nhân viên có sẵn thành giá trị của các ô nhập (lương là chuỗi).
function toFormValues(initialValues) {
  if (!initialValues) return EMPTY_VALUES;
  return {
    name: initialValues.name,
    email: initialValues.email,
    department: initialValues.department,
    position: initialValues.position,
    salary: String(initialValues.salary),
    city: initialValues.city,
    status: initialValues.status,
  };
}

// Form nhân viên: giữ giá trị các ô trong state riêng, KHÔNG tự kiểm tra dữ liệu.
// - onSubmit(values) nhận chuỗi người dùng gõ (chưa cắt khoảng trắng); trả true khi dữ liệu đã được chấp nhận.
//   Form thêm mới (không có initialValues) tự xóa trắng khi onSubmit trả true.
// - errors: { name, email, salary } là câu báo lỗi hiện dưới ô tương ứng (lớp is-invalid và invalid-feedback).
// - Nút Hủy chỉ hiện khi có onCancel.
function EmployeeForm({ initialValues, onSubmit, onCancel, errors = {}, submitLabel = "Thêm" }) {
  const [values, setValues] = useState(() => toFormValues(initialValues));

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const accepted = onSubmit(values);
    if (accepted === true && !initialValues) {
      setValues(EMPTY_VALUES);
    }
  }

  // Một ô chữ có nhãn; lỗi (nếu có) hiện ngay dưới ô.
  function renderText(name, label, error) {
    return (
      <div className="col-md-4">
        <label htmlFor={`emp-${name}`} className="form-label">
          {label}
        </label>
        <input
          id={`emp-${name}`}
          name={name}
          className={error ? "form-control is-invalid" : "form-control"}
          value={values[name]}
          onChange={handleChange}
        />
        {error && (
          <div className="invalid-feedback" role="alert">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card card-body mb-3">
      <div className="row g-3">
        {renderText("name", "Họ tên", errors.name)}
        {renderText("email", "Email", errors.email)}
        <div className="col-md-4">
          <label htmlFor="emp-department" className="form-label">
            Phòng ban
          </label>
          <select
            id="emp-department"
            name="department"
            className="form-select"
            value={values.department}
            onChange={handleChange}
          >
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>
        {renderText("position", "Vị trí")}
        {renderText("salary", "Lương", errors.salary)}
        <div className="col-md-4">
          <label htmlFor="emp-city" className="form-label">
            Thành phố
          </label>
          <select id="emp-city" name="city" className="form-select" value={values.city} onChange={handleChange}>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="emp-status" className="form-label">
            Trạng thái
          </label>
          <select
            id="emp-status"
            name="status"
            className="form-select"
            value={values.status}
            onChange={handleChange}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 d-flex gap-2">
          <button type="submit" className="btn btn-primary">
            {submitLabel}
          </button>
          {onCancel && (
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
              Hủy
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

export default EmployeeForm;
// ===== HẾT MÃ NỀN =====
