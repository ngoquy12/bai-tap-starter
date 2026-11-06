// ===== BÀI LÀM: users.repository =====
// SQL của bảng users. Giữ nguyên tên hàm và tham số; passwordHash chỉ dùng trong máy chủ, không bao giờ ra response.
const pool = require("../db/pool");

// TODO: trả người dùng { id, email, passwordHash, fullName, role } hoặc null
async function findByEmail(email) {
  return undefined;
}

// TODO: trả người dùng { id, email, passwordHash, fullName, role } hoặc null
async function findById(id) {
  return undefined;
}

// TODO: thêm người dùng mới (vai trò customer) rồi trả về người dùng vừa tạo
async function create({ email, passwordHash, fullName }) {
  return undefined;
}

module.exports = { findByEmail, findById, create };
