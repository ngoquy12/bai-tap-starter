// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import http from "./http.js";

// Lấy TOÀN BỘ nhân viên (crudcrud không lọc, không phân trang). Trả mảng, mỗi phần tử có _id do dịch vụ cấp.
export async function getEmployees(signal) {
  const response = await http.get("/employees", { signal });
  return response.data;
}

// Đăng nhập bằng email: crudcrud không lọc phía máy chủ nên tải cả danh sách rồi tìm ở trình duyệt. Trả nhân viên hoặc null.
export async function getEmployeeByEmail(email, signal) {
  const employees = await getEmployees(signal);
  return employees.find((employee) => employee.email === email) || null;
}

// Lấy một nhân viên theo _id (404 nếu không có).
export async function getEmployee(id, signal) {
  const response = await http.get(`/employees/${id}`, { signal });
  return response.data;
}
