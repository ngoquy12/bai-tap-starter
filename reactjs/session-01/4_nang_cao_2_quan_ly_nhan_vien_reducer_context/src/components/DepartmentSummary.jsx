// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import formatVnd from "../utils/formatVnd.js";

// Bảng thống kê theo phòng ban; stats là mảng { department, count, totalSalary }.
function DepartmentSummary({ stats }) {
  return (
    <section className="mb-4">
      <h2 className="h5 mb-3">Thống kê theo phòng ban</h2>
      {stats.length === 0 ? (
        <p className="text-muted">Chưa có dữ liệu phòng ban.</p>
      ) : (
        <ul className="list-group">
          {stats.map((item) => (
            <li key={item.department} className="list-group-item">
              {`${item.department}: ${item.count} người, lương ${formatVnd(item.totalSalary)}`}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default DepartmentSummary;
// ===== HẾT MÃ NỀN =====
