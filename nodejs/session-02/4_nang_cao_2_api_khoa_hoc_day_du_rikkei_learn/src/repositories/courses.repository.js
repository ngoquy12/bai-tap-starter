// ===== BÀI LÀM: courses.repository.js =====
const pool = require("../db/pool");

// Tầng này chứa toàn bộ SQL của khóa học. Mọi giá trị từ client đi qua dấu ?.
// Cột ORDER BY chỉ được lấy từ một danh sách trắng do bạn viết.

// TODO: một trang khóa học (kèm lessonCount) theo bộ lọc { page, limit, level, q, hasLessons, sort, order }.
async function findAll(filters) {
  throw new Error("Chưa làm: courses.repository.findAll");
}

// TODO: tổng số khóa học khớp cùng bộ lọc với findAll.
async function count(filters) {
  throw new Error("Chưa làm: courses.repository.count");
}

// TODO: một khóa học kèm lessonCount theo id; không có thì trả null.
async function findById(id) {
  throw new Error("Chưa làm: courses.repository.findById");
}

// TODO: thêm khóa học rồi trả khóa học vừa tạo (kèm lessonCount).
async function create(data) {
  throw new Error("Chưa làm: courses.repository.create");
}

// TODO: sửa các trường được gửi rồi trả khóa học sau khi sửa.
async function update(id, fields) {
  throw new Error("Chưa làm: courses.repository.update");
}

// TODO: xóa theo id; trả true nếu đã xóa một hàng, false nếu không có hàng nào.
async function remove(id) {
  throw new Error("Chưa làm: courses.repository.remove");
}

module.exports = { findAll, count, findById, create, update, remove };
