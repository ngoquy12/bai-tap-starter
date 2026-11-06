// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { NavLink, Outlet } from "react-router-dom";

// Khung chung: thanh điều hướng Bootstrap và vùng hiện trang con.
function MainLayout() {
  return (
    <>
      <nav className="navbar navbar-expand navbar-dark bg-primary">
        <div className="container">
          <h1 className="navbar-brand h5 mb-0">Quản lý nhân viên Rikkei</h1>
          <div className="navbar-nav" aria-label="Điều hướng chính">
            <NavLink className="nav-link" to="/" end>
              Danh sách
            </NavLink>
            <NavLink className="nav-link" to="/employees/new">
              Thêm nhân viên
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="container py-4">
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;
