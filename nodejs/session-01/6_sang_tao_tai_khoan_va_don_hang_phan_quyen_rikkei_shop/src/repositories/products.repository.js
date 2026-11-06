// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Mọi SQL của sản phẩm nằm ở đây. Lỗi MySQL được để nguyên cho errorHandler xử lý, repository không tự đổi nữa
const pool = require("../db/pool");

const SELECT_PRODUCT =
  "SELECT p.id, p.name, p.price, p.stock, p.category_id AS categoryId, c.name AS categoryName " +
  "FROM products p JOIN categories c ON c.id = p.category_id";

// Danh sách trắng cột sắp xếp: client chọn khóa, server chọn tên cột
const SORT_COLUMNS = { price: "p.price", name: "p.name", createdAt: "p.created_at" };

// Cột được phép sửa: khóa là tên trong JSON, giá trị là tên cột do server viết sẵn
const UPDATABLE_COLUMNS = { name: "name", price: "price", stock: "stock", categoryId: "category_id" };

// Ghép điều kiện lọc; mọi giá trị đi qua ?
function buildWhere(filters) {
  const conditions = [];
  const params = [];
  if (filters.categoryId !== undefined) {
    conditions.push("p.category_id = ?");
    params.push(filters.categoryId);
  }
  if (filters.q !== undefined) {
    conditions.push("p.name LIKE ?");
    params.push("%" + filters.q + "%");
  }
  if (filters.minPrice !== undefined) {
    conditions.push("p.price >= ?");
    params.push(filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    conditions.push("p.price <= ?");
    params.push(filters.maxPrice);
  }
  const where = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";
  return { where, params };
}

// Một trang sản phẩm theo bộ lọc, sắp xếp ổn định (khóa phụ p.id)
async function findAll(filters) {
  const { where, params } = buildWhere(filters);
  const column = SORT_COLUMNS[filters.sort];
  const direction = filters.order === "desc" ? "DESC" : "ASC";
  const offset = (filters.page - 1) * filters.limit;
  // LIMIT/OFFSET tham số hóa phải dùng pool.query (pool.execute báo ER_WRONG_ARGUMENTS)
  const [rows] = await pool.query(
    SELECT_PRODUCT + where + " ORDER BY " + column + " " + direction + ", p.id LIMIT ? OFFSET ?",
    [...params, filters.limit, offset]
  );
  return rows;
}

// Tổng số sản phẩm khớp bộ lọc (không phân trang) để tính meta.total
async function count(filters) {
  const { where, params } = buildWhere(filters);
  const [rows] = await pool.execute("SELECT COUNT(*) AS total FROM products p" + where, params);
  return rows[0].total;
}

async function findById(id) {
  const [rows] = await pool.execute(SELECT_PRODUCT + " WHERE p.id = ?", [id]);
  return rows[0] || null;
}

async function create({ name, price, stock = 0, categoryId }) {
  const [result] = await pool.execute(
    "INSERT INTO products (name, price, stock, category_id) VALUES (?, ?, ?, ?)",
    [name, price, stock, categoryId]
  );
  return findById(result.insertId);
}

// Sửa các trường có mặt trong changes; trả sản phẩm sau khi sửa hoặc null khi không có id đó
async function update(id, changes) {
  const assignments = [];
  const params = [];
  for (const key of Object.keys(UPDATABLE_COLUMNS)) {
    if (changes[key] !== undefined) {
      assignments.push(UPDATABLE_COLUMNS[key] + " = ?");
      params.push(changes[key]);
    }
  }
  if (assignments.length === 0) {
    return findById(id);
  }
  const [result] = await pool.execute(
    "UPDATE products SET " + assignments.join(", ") + " WHERE id = ?",
    [...params, id]
  );
  if (result.affectedRows === 0) return null;
  return findById(id);
}

// true nếu xóa được, false nếu không có hàng nào khớp
async function remove(id) {
  const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, count, findById, create, update, remove };
// ===== HẾT MÃ NỀN =====
