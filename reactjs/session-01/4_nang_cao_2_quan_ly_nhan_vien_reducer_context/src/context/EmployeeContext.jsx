// ===== BÀI LÀM: context chia sẻ danh sách nhân viên và dispatch =====

// TODO: tạo context, EmployeeProvider dùng useReducer với employeesReducer, và hook useEmployees.
// Khung tối thiểu bên dưới chỉ để ứng dụng mở được; hãy thay bằng mã của bạn.
export function EmployeeProvider({ children, initialEmployees }) {
  return children;
}

export function useEmployees() {
  return { employees: [], dispatch: () => {} };
}
