// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { createContext, useContext, useReducer } from "react";
import employeesReducer from "../reducers/employeesReducer.js";
import defaultEmployees from "../data/employees.js";

const EmployeeContext = createContext(null);

// Giữ danh sách nhân viên dùng chung cho cả ứng dụng (dữ liệu trong bộ nhớ, tải lại trang là về dữ liệu mẫu).
function EmployeeProvider({ children, initialEmployees = defaultEmployees }) {
  const [employees, dispatch] = useReducer(employeesReducer, initialEmployees);
  return (
    <EmployeeContext.Provider value={{ employees, dispatch }}>
      {children}
    </EmployeeContext.Provider>
  );
}

// Hook lấy { employees, dispatch }; ném lỗi khi dùng ngoài EmployeeProvider.
function useEmployees() {
  const context = useContext(EmployeeContext);
  if (context === null) {
    throw new Error("useEmployees phải được dùng bên trong EmployeeProvider");
  }
  return context;
}

export { EmployeeProvider, useEmployees };
