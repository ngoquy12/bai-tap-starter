// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { EmployeeProvider } from "./context/EmployeeContext.jsx";
import EmployeeManager from "./components/EmployeeManager.jsx";
import employees from "./data/employees.js";

// Ứng dụng: bọc trang quản lý trong EmployeeProvider để mọi component bên trong dùng chung danh sách nhân viên.
function App() {
  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Quản lý nhân viên Rikkei</h1>
      <EmployeeProvider initialEmployees={employees}>
        <EmployeeManager />
      </EmployeeProvider>
    </div>
  );
}

export default App;
// ===== HẾT MÃ NỀN =====
