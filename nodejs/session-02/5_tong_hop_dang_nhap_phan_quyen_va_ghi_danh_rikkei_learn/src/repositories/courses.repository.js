// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const pool = require("../db/pool");

// Cột trả về cho API: snake_case của bảng đã khớp camelCase nên không cần AS.
const SELECT_COURSE = "SELECT id, title, description, level FROM courses";

// Một khóa học theo id; không có thì trả null.
async function findById(id) {
  const [rows] = await pool.execute(SELECT_COURSE + " WHERE id = ?", [id]);
  return rows[0] || null;
}

// Tìm theo tiêu đề chứa từ khóa. Dấu % ghép vào GIÁ TRỊ tham số, không ghép vào câu SQL.
async function searchByTitle(keyword) {
  const [rows] = await pool.execute(SELECT_COURSE + " WHERE title LIKE ? ORDER BY id", ["%" + keyword + "%"]);
  return rows;
}

// Tạo khóa học mới rồi đọc lại để trả đúng dạng JSON của API.
async function create({ title, description = "", level = "beginner" }) {
  const [result] = await pool.execute(
    "INSERT INTO courses (title, description, level) VALUES (?, ?, ?)",
    [title, description, level]
  );
  return findById(result.insertId);
}

// Sửa toàn bộ thông tin; không có khóa học thì trả null.
async function update(id, { title, description, level }) {
  const [result] = await pool.execute(
    "UPDATE courses SET title = ?, description = ?, level = ? WHERE id = ?",
    [title, description, level, id]
  );
  if (result.affectedRows === 0) return null;
  return findById(id);
}

// Xóa theo id; trả true nếu đã xóa một hàng, false nếu không có hàng nào.
async function remove(id) {
  const [result] = await pool.execute("DELETE FROM courses WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// Cột được phép sắp xếp: client chọn khóa, server chọn tên cột (danh sách trắng chống SQL injection).
const SORT_COLUMNS = { title: "title", level: "level", createdAt: "created_at" };

// Ghép điều kiện WHERE từ bộ lọc; mọi giá trị đi qua dấu ?.
function buildWhere({ level, q }) {
  const conditions = [];
  const params = [];
  if (level) {
    conditions.push("level = ?");
    params.push(level);
  }
  if (q) {
    conditions.push("title LIKE ?");
    params.push("%" + q + "%");
  }
  const where = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";
  return { where, params };
}

// Một trang khóa học theo bộ lọc. LIMIT/OFFSET dùng pool.query vì pool.execute đòi số nguyên đúng kiểu.
async function findAll(filters) {
  const { where, params } = buildWhere(filters);
  const column = SORT_COLUMNS[filters.sort];
  const direction = filters.order === "desc" ? "DESC" : "ASC";
  const offset = (filters.page - 1) * filters.limit;
  const sql = SELECT_COURSE + where + " ORDER BY " + column + " " + direction + ", id LIMIT ? OFFSET ?";
  const [rows] = await pool.query(sql, [...params, filters.limit, offset]);
  return rows;
}

// Tổng số khóa học khớp bộ lọc (dùng chung buildWhere để meta.total khớp với data).
async function count(filters) {
  const { where, params } = buildWhere(filters);
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM courses" + where, params);
  return rows[0].total;
}

module.exports = { findAll, count, findById, searchByTitle, create, update, remove };
// ===== HẾT MÃ NỀN =====
