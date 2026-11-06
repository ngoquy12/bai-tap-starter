// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { Link, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch.js";
import { getEmployee } from "../api/employees.js";

// Hồ sơ một nhân viên theo id trên URL.
function EmployeeProfilePage() {
  const { id } = useParams();
  const { data, loading, error } = useFetch((signal) => getEmployee(id, signal), [id]);

  return (
    <section>
      <p><Link to="/employees">Quay lại danh sách</Link></p>
      {loading && <p role="status">Đang tải...</p>}
      {error && <p role="alert">{error}</p>}
      {data && (
        <div>
          <h2>{data.name}</h2>
          <p>{data.position} - {data.department}</p>
          <p>Email: {data.email}</p>
          <p>Thành phố: {data.city}</p>
        </div>
      )}
    </section>
  );
}

export default EmployeeProfilePage;
