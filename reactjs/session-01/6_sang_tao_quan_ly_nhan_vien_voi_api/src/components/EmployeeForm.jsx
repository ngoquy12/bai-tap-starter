// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { useState } from "react";
import { CITIES, DEPARTMENTS, STATUSES } from "../config.js";

// Form nhân viên dùng cho cả thêm mới và sửa. Giữ giá trị đang nhập trong state của chính nó.
// Props: initialValues (nhân viên ban đầu), submitLabel (chữ trên nút lưu), submitting (đang gửi),
// onSubmit(values) được gọi với giá trị đã kiểm tra (salary là số, chuỗi đã cắt khoảng trắng đầu cuối).
function EmployeeForm({ initialValues, submitLabel, submitting, onSubmit }) {
  const [values, setValues] = useState({
    name: initialValues.name,
    email: initialValues.email,
    department: initialValues.department,
    position: initialValues.position,
    salary: String(initialValues.salary),
    city: initialValues.city,
    status: initialValues.status,
    joinedAt: initialValues.joinedAt,
  });
  const [problem, setProblem] = useState("");

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const name = values.name.trim();
    const email = values.email.trim();
    const salary = Number(values.salary);
    if (name === "") return setProblem("Họ tên không được để trống.");
    if (!email.includes("@")) return setProblem("Email không hợp lệ.");
    if (values.salary.trim() === "" || Number.isNaN(salary) || salary < 0) {
      return setProblem("Lương phải là số lớn hơn hoặc bằng 0.");
    }
    setProblem("");
    onSubmit({
      name,
      email,
      department: values.department,
      position: values.position.trim(),
      salary,
      city: values.city,
      status: values.status,
      joinedAt: values.joinedAt,
    });
  }

  return (
    <form className="row g-3" onSubmit={handleSubmit} noValidate>
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="name">
          Họ tên
        </label>
        <input className="form-control" id="name" name="name" value={values.name} onChange={handleChange} />
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="email">
          Email
        </label>
        <input className="form-control" id="email" name="email" value={values.email} onChange={handleChange} />
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="department">
          Phòng ban
        </label>
        <select className="form-select" id="department" name="department" value={values.department} onChange={handleChange}>
          {DEPARTMENTS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="position">
          Vị trí
        </label>
        <input className="form-control" id="position" name="position" value={values.position} onChange={handleChange} />
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="salary">
          Lương
        </label>
        <input className="form-control" id="salary" name="salary" value={values.salary} onChange={handleChange} />
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="city">
          Thành phố
        </label>
        <select className="form-select" id="city" name="city" value={values.city} onChange={handleChange}>
          {CITIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="status">
          Trạng thái
        </label>
        <select className="form-select" id="status" name="status" value={values.status} onChange={handleChange}>
          {STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="joinedAt">
          Ngày vào làm
        </label>
        <input className="form-control" id="joinedAt" name="joinedAt" type="date" value={values.joinedAt} onChange={handleChange} />
      </div>
      {problem && (
        <div className="col-12">
          <div className="alert alert-danger mb-0" role="alert">
            {problem}
          </div>
        </div>
      )}
      <div className="col-12">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting && <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>}
          {submitting ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default EmployeeForm;
