// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Id mới cho nhân viên: id lớn nhất hiện có cộng 1 (danh sách rỗng thì là 1).
export function getNextId(employees) {
  return employees.reduce((max, employee) => Math.max(max, employee.id), 0) + 1;
}

// Reducer thuần của danh sách nhân viên.
// ADD: payload { employee } (chưa có id); UPDATE: payload { id, changes }; REMOVE: payload { id }.
function employeesReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, { ...action.payload.employee, id: getNextId(state) }];
    case "UPDATE":
      return state.map((employee) =>
        employee.id === action.payload.id
          ? { ...employee, ...action.payload.changes, id: employee.id }
          : employee
      );
    case "REMOVE":
      return state.filter((employee) => employee.id !== action.payload.id);
    default:
      return state;
  }
}

export default employeesReducer;
