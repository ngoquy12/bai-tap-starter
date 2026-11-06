// ===== BÀI LÀM: courses.repository.js =====
const pool = require("../db/pool");

// TODO: viết truy vấn tham số hóa (dấu ?) cho bốn hàm dưới đây, như Lab 3.

// Mọi khóa học, theo id tăng dần; mỗi khóa có id, title, description, level.
async function findAll() {
  throw new Error("Chưa làm: findAll");
}

// Một khóa học theo id; không có thì trả null.
async function findById(id) {
  throw new Error("Chưa làm: findById");
}

// Khóa học có tiêu đề chứa từ khóa, theo id tăng dần.
async function searchByTitle(keyword) {
  throw new Error("Chưa làm: searchByTitle");
}

// Tạo khóa học mới rồi trả khóa học vừa tạo; description mặc định "", level mặc định "beginner".
async function create({ title, description = "", level = "beginner" }) {
  throw new Error("Chưa làm: create");
}

module.exports = { findAll, findById, searchByTitle, create };
