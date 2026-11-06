// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { createContext, useContext } from "react";
import useEmployees from "../hooks/useEmployees.js";

const EmployeesContext = createContext(null);

// Bọc ở App: gọi hook useEmployees MỘT lần cho cả ứng dụng, nên danh sách chỉ được tải một lần
// và mọi trang (danh sách, chi tiết, thêm, sửa) dùng chung dữ liệu đó, không tải lại khi chuyển trang.
export function EmployeesProvider({ children }) {
  const store = useEmployees();
  return <EmployeesContext.Provider value={store}>{children}</EmployeesContext.Provider>;
}

// Lấy kho nhân viên dùng chung: { employees, loading, error, reload, addEmployee, saveEmployee, removeEmployee }.
export function useEmployeeStore() {
  return useContext(EmployeesContext);
}
