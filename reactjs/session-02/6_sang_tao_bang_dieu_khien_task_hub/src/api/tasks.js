// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import http from "./http.js";

// Lấy TOÀN BỘ công việc (crudcrud không lọc, không phân trang). Trả mảng, mỗi phần tử có _id; assigneeCode trỏ tới code của nhân viên.
export async function getTasks(signal) {
  const response = await http.get("/tasks", { signal });
  return response.data;
}

// Lấy một công việc theo _id (404 nếu không có).
export async function getTask(id, signal) {
  const response = await http.get(`/tasks/${id}`, { signal });
  return response.data;
}
