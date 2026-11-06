// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import "bootstrap/dist/css/bootstrap.min.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { DataProvider } from "./context/DataContext.jsx";

// BrowserRouter, DataProvider (nhân viên và công việc tải một lần) và AuthProvider bọc ngoài App:
// mọi trang dùng được router, dữ liệu dùng chung và thông tin đăng nhập.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  </StrictMode>
);
