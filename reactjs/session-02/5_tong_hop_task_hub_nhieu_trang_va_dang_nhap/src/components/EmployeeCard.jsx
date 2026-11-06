// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import formatDate from "../utils/formatDate.js";
import formatVnd from "../utils/formatVnd.js";
import { EMPLOYEE_STATUS_LABELS } from "../utils/labels.js";

// Thẻ nhân viên (giống khối EmployeeCard trong giao_dien_mau). `heading` thay cho tên ở tiêu đề
// (truyền một Link để tên bấm được). Nhân viên đã nghỉ việc không hiện lương và thẻ mờ đi.
function EmployeeCard({ employee, heading }) {
  const resigned = employee.status === "resigned";
  return (
    <article className={`card mb-3${resigned ? " opacity-50" : ""}`}>
      <div className="card-body">
        <h3 className="card-title h6">{heading ?? employee.name}</h3>
        <p className="mb-1">
          {employee.position} - {employee.department}
        </p>
        <p className="mb-1">{employee.email}</p>
        {!resigned && <p className="mb-1">Lương: {formatVnd(employee.salary)}</p>}
        <p className="mb-1">Thành phố: {employee.city}</p>
        <p className="mb-1">Vào làm: {formatDate(employee.joinedAt)}</p>
        <p className="mb-0">
          <span className="badge text-bg-secondary">{EMPLOYEE_STATUS_LABELS[employee.status] ?? "Không rõ"}</span>
        </p>
      </div>
    </article>
  );
}

export default EmployeeCard;
