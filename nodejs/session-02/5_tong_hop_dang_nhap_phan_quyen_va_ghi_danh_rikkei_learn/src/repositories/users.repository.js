// ===== BÀI LÀM: users.repository.js =====
const pool = require("../db/pool");
const httpError = require("../errors/httpError");

// Hàng người dùng từ repository có passwordHash nên KHÔNG trả thẳng cho client.

// Một người dùng theo email (đã chuẩn hóa chữ thường); không có thì trả null.
async function findByEmail(email) {
  // TODO: SELECT id, email, password_hash AS passwordHash, full_name AS fullName, role FROM users WHERE email = ?
  return null;
}

// Một người dùng theo id; không có thì trả null.
async function findById(id) {
  // TODO: cùng các cột như findByEmail, điều kiện theo id
  return null;
}

// Tạo tài khoản mới (role lấy mặc định của bảng); email trùng thì ném lỗi 409 (thông báo cố định trong đề).
async function create({ email, passwordHash, fullName }) {
  // TODO: INSERT rồi đọc lại bằng findById; đổi lỗi ER_DUP_ENTRY thành httpError
  throw new Error("Chưa cài đặt");
}

module.exports = { findByEmail, findById, create };
