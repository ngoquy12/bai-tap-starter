// ===== BÀI LÀM: lớp API cho /tasks (đọc cả danh sách, thêm, sửa bằng PUT, xóa) =====
import http from "./http.js";

// TODO: GET /tasks một lần, trả MẢNG mọi công việc (crudcrud không lọc, không phân trang).
export async function getTasks(signal) {
  throw new Error("TODO: getTasks chưa viết");
}

// TODO: POST /tasks với thân là data, trả bản ghi máy chủ vừa tạo (có _id).
export async function createTask(data) {
  throw new Error("TODO: createTask chưa viết");
}

// TODO: PUT /tasks/<_id> với bản ghi ĐẦY ĐỦ nhưng BỎ _id khỏi thân; PUT trả 200 không thân nên trả lại bản ghi đầy đủ (có _id) do chính bạn ghép.
export async function updateTask(task) {
  throw new Error("TODO: updateTask chưa viết");
}

// TODO: DELETE /tasks/<_id>.
export async function deleteTask(id) {
  throw new Error("TODO: deleteTask chưa viết");
}
