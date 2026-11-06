// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { http } from "./http.js";

// Lấy toàn bộ công việc (mảng). Lọc và phân trang làm ở trình duyệt, vì crudcrud bỏ qua mọi tham số truy vấn.
export async function getTasks(signal) {
  const response = await http.get("/tasks", { signal });
  return response.data;
}

// Sửa một công việc bằng PUT và trả về bản ghi mới (đã ghép `changes` vào `task`).
// crudcrud thay CẢ bản ghi, nên gửi đủ mọi trường; thân yêu cầu KHÔNG được có `_id` (có thì 500), `_id` chỉ nằm trên đường dẫn.
// PUT trả 200 không có thân, nên bản ghi mới được ghép ngay ở đây thay vì đọc lại từ máy chủ (đỡ một yêu cầu).
export async function updateTask(task, changes) {
  const { _id, ...record } = { ...task, ...changes };
  await http.put(`/tasks/${_id}`, record);
  return { ...record, _id };
}
