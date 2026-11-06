// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const pool = require("../db/pool");
const httpError = require("../errors/httpError");

// Đổi snake_case sang camelCase bằng AS. Hàng này có passwordHash nên KHÔNG trả thẳng cho client.
const SELECT_USER = "SELECT id, email, password_hash AS passwordHash, full_name AS fullName, role FROM users";

// Một người dùng theo email (đã chuẩn hóa chữ thường); không có thì trả null.
async function findByEmail(email) {
  const [rows] = await pool.execute(SELECT_USER + " WHERE email = ?", [email]);
  return rows[0] || null;
}

// Một người dùng theo id; không có thì trả null.
async function findById(id) {
  const [rows] = await pool.execute(SELECT_USER + " WHERE id = ?", [id]);
  return rows[0] || null;
}

// Tạo tài khoản student; email trùng làm MySQL ném ER_DUP_ENTRY, đổi thành lỗi 409.
async function create({ email, passwordHash, fullName }) {
  try {
    const [result] = await pool.execute(
      "INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)",
      [email, passwordHash, fullName]
    );
    return findById(result.insertId);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw httpError(409, "CONFLICT", "Email đã được đăng ký");
    }
    throw error;
  }
}

module.exports = { findByEmail, findById, create };
// ===== HẾT MÃ NỀN =====
