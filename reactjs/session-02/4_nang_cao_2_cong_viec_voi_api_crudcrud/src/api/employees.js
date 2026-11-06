// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import http from "./http.js";

// Lấy toàn bộ nhân viên (8 người) để chọn người nhận việc. Mỗi nhân viên có _id do crudcrud cấp và mã nghiệp vụ code (NV01...).
export async function getEmployees(signal) {
  const response = await http.get("/employees", { signal });
  return response.data;
}
