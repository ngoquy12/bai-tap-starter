// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getEmployeeByEmail } from "../api/employees.js";
import { getErrorMessage } from "../api/http.js";

// Đăng nhập bằng email nhân viên (không mật khẩu, không token). Nhân viên đã nghỉ việc không được vào.
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const employee = await getEmployeeByEmail(email.trim());
      if (!employee) {
        setError("Không tìm thấy nhân viên với email này.");
      } else if (employee.status === "resigned") {
        setError("Tài khoản đã ngừng hoạt động.");
      } else {
        login(employee);
        navigate("/");
        return;
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setBusy(false);
  }

  return (
    <div className="container py-5">
      <form onSubmit={handleSubmit} className="mx-auto col-12 col-md-6 col-lg-4">
        <h1 className="h3">Task Hub</h1>
        <h2 className="h5">Đăng nhập</h2>
        <div className="mb-3">
          <label htmlFor="login-email" className="form-label">Email</label>
          <input id="login-email" type="text" className="form-control" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy}>Đăng nhập</button>
        {error && <p role="alert" className="alert alert-danger mt-3">{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;
