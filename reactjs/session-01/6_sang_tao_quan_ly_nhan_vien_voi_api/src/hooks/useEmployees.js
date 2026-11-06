// ===== BÀI LÀM: hook giữ danh sách nhân viên đã tải và các thao tác ghi =====

// TODO: dùng useState, useEffect và getEmployees để tải danh sách MỘT lần; thêm addEmployee, saveEmployee,
// removeEmployee cập nhật state từ phản hồi (xem đề bài). Trả { employees, loading, error, reload, addEmployee, saveEmployee, removeEmployee }.
function useEmployees() {
  return {
    employees: [],
    loading: false,
    error: null,
    reload() {},
    async addEmployee(data) {},
    async saveEmployee(employee) {},
    async removeEmployee(id) {},
  };
}

export default useEmployees;
