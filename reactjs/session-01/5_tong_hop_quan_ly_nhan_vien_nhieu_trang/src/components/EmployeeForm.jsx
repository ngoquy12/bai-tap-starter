// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { useState } from "react";
import { useEmployees } from "../context/EmployeeContext.jsx";
import { DEPARTMENTS, CITIES, STATUS_LABELS } from "../data/options.js";
import { TODAY } from "../config.js";

// Giá trị ban đầu của form thêm mới.
const EMPTY_VALUES = {
  name: "",
  email: "",
  department: DEPARTMENTS[0],
  position: "",
  salary: "",
  city: CITIES[0],
  status: "active",
  joinedAt: TODAY,
};

// Form nhân viên dùng cho cả thêm mới và sửa.
// Props: initialValues (nhân viên đang sửa, bỏ trống khi thêm mới), onSubmit(values), onCancel().
// onSubmit nhận { name, email, department, position, salary (số), city, status, joinedAt } đã được kiểm tra.
function EmployeeForm({ initialValues, onSubmit, onCancel }) {
  const { employees } = useEmployees();
  const [values, setValues] = useState({ ...EMPTY_VALUES, ...initialValues });
  const [errors, setErrors] = useState([]);

  function handleChange(field, value) {
    setValues({ ...values, [field]: value });
  }

  // Kiểm tra dữ liệu, trả về mảng thông báo lỗi (rỗng nếu hợp lệ).
  function validate() {
    const found = [];
    const email = values.email.trim().toLowerCase();
    if (values.name.trim() === "") {
      found.push("Vui lòng nhập họ tên.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      found.push("Email không hợp lệ.");
    } else if (
      employees.some(
        (employee) =>
          employee.email.toLowerCase() === email && employee.id !== (initialValues && initialValues.id)
      )
    ) {
      found.push("Email này đã tồn tại.");
    }
    if (!(Number(values.salary) > 0)) {
      found.push("Lương phải là số lớn hơn 0.");
    }
    return found;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (found.length > 0) return;
    onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      department: values.department,
      position: values.position.trim(),
      salary: Number(values.salary),
      city: values.city,
      status: values.status,
      joinedAt: values.joinedAt,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-3">
        <label className="form-label" htmlFor="emp-name">Họ tên</label>
        <input className="form-control" id="emp-name" value={values.name} onChange={(e) => handleChange("name", e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="emp-email">Email</label>
        <input className="form-control" id="emp-email" value={values.email} onChange={(e) => handleChange("email", e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="emp-department">Phòng ban</label>
        <select className="form-select" id="emp-department" value={values.department} onChange={(e) => handleChange("department", e.target.value)}>
          {DEPARTMENTS.map((department) => (
            <option key={department} value={department}>{department}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="emp-position">Vị trí</label>
        <input className="form-control" id="emp-position" value={values.position} onChange={(e) => handleChange("position", e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="emp-salary">Lương</label>
        <input className="form-control" id="emp-salary" type="number" value={values.salary} onChange={(e) => handleChange("salary", e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="emp-city">Thành phố</label>
        <select className="form-select" id="emp-city" value={values.city} onChange={(e) => handleChange("city", e.target.value)}>
          {CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="emp-status">Trạng thái</label>
        <select className="form-select" id="emp-status" value={values.status} onChange={(e) => handleChange("status", e.target.value)}>
          {Object.keys(STATUS_LABELS).map((status) => (
            <option key={status} value={status}>{STATUS_LABELS[status]}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="emp-joined">Ngày vào làm</label>
        <input className="form-control" id="emp-joined" type="date" value={values.joinedAt} onChange={(e) => handleChange("joinedAt", e.target.value)} />
      </div>
      {errors.map((message) => (
        <div key={message} role="alert" className="alert alert-danger py-2">{message}</div>
      ))}
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary">Lưu</button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Hủy</button>
      </div>
    </form>
  );
}

export default EmployeeForm;
