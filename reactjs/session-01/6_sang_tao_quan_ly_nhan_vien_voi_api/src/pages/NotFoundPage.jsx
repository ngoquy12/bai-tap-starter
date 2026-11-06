// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { Link } from "react-router-dom";

// Trang cho đường dẫn không có trong ứng dụng.
function NotFoundPage() {
  return (
    <section>
      <h2 className="h4">Không tìm thấy trang này.</h2>
      <Link to="/">Về danh sách nhân viên</Link>
    </section>
  );
}

export default NotFoundPage;
