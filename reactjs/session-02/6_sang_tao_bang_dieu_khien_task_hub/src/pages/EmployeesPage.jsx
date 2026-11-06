// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch.js";
import { getEmployees } from "../api/employees.js";

// Danh sách toàn bộ nhân viên; mỗi tên là liên kết tới hồ sơ (theo _id).
function EmployeesPage() {
  const { data, loading, error } = useFetch((signal) => getEmployees(signal), []);

  return (
    <section>
      <h2>Nhân viên</h2>
      {loading && <p role="status">Đang tải...</p>}
      {error && <p role="alert">{error}</p>}
      {data && (
        <ul>
          {data.map((employee) => (
            <li key={employee._id}>
              <Link to={`/employees/${employee._id}`}>{employee.name}</Link> - {employee.position}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default EmployeesPage;
