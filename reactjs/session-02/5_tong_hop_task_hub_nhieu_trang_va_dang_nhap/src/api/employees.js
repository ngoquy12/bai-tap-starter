// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { http } from "./http.js";

// Lấy toàn bộ nhân viên (mảng, mỗi phần tử có `_id` do crudcrud cấp và `code` như NV01).
// crudcrud không lọc phía máy chủ nên không có tham số nào ở đây: tìm theo email làm ở trình duyệt.
export async function getEmployees(signal) {
  const response = await http.get("/employees", { signal });
  return response.data;
}
