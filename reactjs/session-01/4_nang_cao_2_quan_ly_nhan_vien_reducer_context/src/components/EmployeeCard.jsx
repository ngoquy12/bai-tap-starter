// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import StatusBadge from "./StatusBadge.jsx";
import formatVnd from "../utils/formatVnd.js";
import formatDate from "../utils/formatDate.js";

// Thẻ một nhân viên. Nhân viên đã nghỉ việc: thẻ mờ (opacity-50) và không hiện lương.
// Nút "Sửa <họ tên>" và "Xóa <họ tên>" chỉ hiện khi có onEdit / onRemove; hai hàm nhận cả đối tượng nhân viên.
function EmployeeCard({ employee, onEdit, onRemove }) {
  const resigned = employee.status === "resigned";
  return (
    <li className={resigned ? "col opacity-50" : "col"}>
      <div className="card h-100">
        <div className="card-body">
          <h3 className="h5 card-title">{employee.name}</h3>
          <p className="card-text mb-1">{`${employee.position} - ${employee.department}`}</p>
          <p className="card-text mb-1">{employee.email}</p>
          {!resigned && <p className="card-text mb-1">{`Lương: ${formatVnd(employee.salary)}`}</p>}
          <p className="card-text mb-1">{employee.city}</p>
          <p className="card-text mb-2">{`Vào làm: ${formatDate(employee.joinedAt)}`}</p>
          <StatusBadge status={employee.status} />
          <div className="d-flex gap-2 mt-3">
            {onEdit && (
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEdit(employee)}>
                {`Sửa ${employee.name}`}
              </button>
            )}
            {onRemove && (
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onRemove(employee)}>
                {`Xóa ${employee.name}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default EmployeeCard;
// ===== HẾT MÃ NỀN =====
