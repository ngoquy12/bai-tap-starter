// ===== BÀI LÀM: products.repository (đọc, thêm, sửa, xóa sản phẩm) =====
// Mọi SQL của sản phẩm nằm ở đây. Giá trị đi vào SQL phải qua dấu ?.
const pool = require("../db/pool");
const httpError = require("../errors/httpError");

// TODO: mảng sản phẩm xếp theo id tăng dần, lọc tùy chọn theo filters.categoryId và filters.q
async function findAll(filters) {
  throw new Error("Chưa cài đặt findAll");
}

// TODO: một sản phẩm hoặc null
async function findById(id) {
  throw new Error("Chưa cài đặt findById");
}

// TODO: thêm sản phẩm, trả sản phẩm vừa tạo; danh mục không tồn tại thì ném lỗi 400
async function create({ name, price, stock = 0, categoryId }) {
  throw new Error("Chưa cài đặt create");
}

// TODO: sửa các trường có mặt trong changes, trả sản phẩm sau khi sửa hoặc null
async function update(id, changes) {
  throw new Error("Chưa cài đặt update");
}

// TODO: true nếu xóa được, false nếu không có sản phẩm; sản phẩm đã nằm trong đơn thì ném lỗi 409
async function remove(id) {
  throw new Error("Chưa cài đặt remove");
}

module.exports = { findAll, findById, create, update, remove };
