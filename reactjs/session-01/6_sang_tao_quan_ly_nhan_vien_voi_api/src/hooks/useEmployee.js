// ===== BÀI LÀM: hook lấy một nhân viên theo _id từ danh sách đã tải =====

// TODO: dùng useEmployeeStore (src/context/EmployeesContext.jsx) để tìm nhân viên theo _id; trả { employee, loading, error, notFound } (xem đề bài).
function useEmployee(id) {
  return { employee: null, loading: false, error: null, notFound: false };
}

export default useEmployee;
