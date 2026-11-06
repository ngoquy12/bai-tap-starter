// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Khung chung của các trang sau đăng nhập: tiêu đề, menu, lời chào, nút đăng xuất.
function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="container py-3">
      <header className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <h1 className="h3 m-0">Task Hub</h1>
        <nav className="nav">
          <NavLink className="nav-link" to="/" end>Bảng điều khiển</NavLink>
          <NavLink className="nav-link" to="/tasks">Công việc</NavLink>
          <NavLink className="nav-link" to="/employees">Nhân viên</NavLink>
        </nav>
        <span className="ms-auto">Xin chào, {user.name}</span>
        <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Đăng xuất</button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
