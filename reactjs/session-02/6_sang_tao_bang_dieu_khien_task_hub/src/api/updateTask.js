// ===== BÀI LÀM: gửi PUT để sửa một công việc =====
import http from "./http.js";

// TODO: crudcrud không có phương thức sửa một phần. Sửa = PUT bản ghi ĐẦY ĐỦ (xem đề bài, chức năng 6) tới /tasks/<_id>.
// Thân PUT KHÔNG được chứa _id (có _id thì dịch vụ trả 500), và phản hồi PUT không có thân.
// Nhận (task, changes, signal), trả bản ghi mới (đủ trường, có _id) để cập nhật state.
async function updateTask(task, changes, signal) {
  throw new Error("Chưa làm updateTask");
}

export default updateTask;
