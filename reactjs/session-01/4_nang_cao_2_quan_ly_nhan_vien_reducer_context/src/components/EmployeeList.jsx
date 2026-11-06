// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import EmployeeCard from "./EmployeeCard.jsx";

// Danh sách nhân viên nhận qua props: tiêu đề kèm số lượng, rỗng thì hiện emptyMessage.
function EmployeeList({ employees, onEdit, onRemove, emptyMessage = "Chưa có nhân viên nào." }) {
  return (
    <section className="mb-4">
      <h2 className="h5 mb-3">{`Danh sách nhân viên (${employees.length})`}</h2>
      {employees.length === 0 ? (
        <p className="text-muted">{emptyMessage}</p>
      ) : (
        <ul className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 list-unstyled">
          {employees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} onEdit={onEdit} onRemove={onRemove} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default EmployeeList;
// ===== HẾT MÃ NỀN =====
