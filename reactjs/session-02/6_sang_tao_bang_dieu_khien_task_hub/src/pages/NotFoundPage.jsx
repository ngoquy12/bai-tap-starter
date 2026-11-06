// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { Link } from "react-router-dom";

// Trang cho mọi địa chỉ không có trong bảng tuyến.
function NotFoundPage() {
  return (
    <div className="container py-4">
      <h2>Không tìm thấy trang</h2>
      <Link to="/">Về bảng điều khiển</Link>
    </div>
  );
}

export default NotFoundPage;
