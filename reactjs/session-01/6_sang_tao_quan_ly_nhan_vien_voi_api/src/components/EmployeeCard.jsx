// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";

// Thẻ một nhân viên trong danh sách: tên là liên kết tới trang chi tiết.
function EmployeeCard({ employee }) {
  return (
    <article className="card mb-2">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <h3 className="h5 card-title mb-1">
            <Link className="text-decoration-none" to={`/employees/${employee._id}`}>
              {employee.name}
            </Link>
          </h3>
          <StatusBadge status={employee.status} />
        </div>
        <p className="card-text text-body-secondary mb-0">
          {employee.position} - {employee.department}
        </p>
        <p className="card-text small mb-0">{employee.email}</p>
      </div>
    </article>
  );
}

export default EmployeeCard;
