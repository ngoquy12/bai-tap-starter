// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import StatusBadge from "./StatusBadge.jsx";
import formatVnd from "../utils/formatVnd.js";
import formatDate from "../utils/formatDate.js";

// Thẻ thông tin đầy đủ của một nhân viên (dùng ở trang chi tiết).
function EmployeeCard({ employee }) {
  return (
    <article className="card mb-3">
      <div className="card-body">
      <h3 className="card-title h5">{employee.name}</h3>
      <p className="card-subtitle text-muted mb-2">{`${employee.position} - ${employee.department}`}</p>
      <p className="mb-1">{employee.email}</p>
      <p className="mb-1">{`Lương: ${formatVnd(employee.salary)}`}</p>
      <p className="mb-1">{`Thành phố: ${employee.city}`}</p>
      <p className="mb-2">{`Vào làm: ${formatDate(employee.joinedAt)}`}</p>
      <StatusBadge status={employee.status} />
      </div>
    </article>
  );
}

export default EmployeeCard;
