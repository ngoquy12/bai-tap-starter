// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import "bootstrap/dist/css/bootstrap.min.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { EmployeeProvider } from "./context/EmployeeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// Router và hai Provider bọc ngoài App để mọi trang cùng dùng chung danh sách nhân viên và người đăng nhập.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <EmployeeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </EmployeeProvider>
    </BrowserRouter>
  </StrictMode>
);
