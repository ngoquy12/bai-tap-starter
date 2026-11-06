// ===== BÀI LÀM: lessons.repository.js =====
const pool = require("../db/pool");

// Tầng này chứa toàn bộ SQL của bài học. Mọi giá trị từ client đi qua dấu ?.

// TODO: các bài học { id, title, position } của một khóa, theo position tăng dần.
async function findByCourse(courseId) {
  throw new Error("Chưa làm: lessons.repository.findByCourse");
}

// TODO: một bài học của ĐÚNG khóa học đó; bài của khóa khác hoặc không có thì trả null.
async function findById(courseId, lessonId) {
  throw new Error("Chưa làm: lessons.repository.findById");
}

// TODO: thêm bài học vào khóa rồi trả bài học vừa tạo.
async function create(courseId, data) {
  throw new Error("Chưa làm: lessons.repository.create");
}

// TODO: sửa các trường được gửi rồi trả bài học sau khi sửa.
async function update(courseId, lessonId, fields) {
  throw new Error("Chưa làm: lessons.repository.update");
}

// TODO: xóa một bài học của khóa; trả true nếu đã xóa một hàng.
async function remove(courseId, lessonId) {
  throw new Error("Chưa làm: lessons.repository.remove");
}

module.exports = { findByCourse, findById, create, update, remove };
