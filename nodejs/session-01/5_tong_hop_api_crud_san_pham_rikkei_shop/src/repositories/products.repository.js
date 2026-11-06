// ===== BÀI LÀM: products.repository =====
// TODO: mọi SQL của sản phẩm nằm ở đây; giá trị đi qua ?, cột ORDER BY chỉ lấy từ danh sách trắng.
// Không bắt lỗi MySQL ở đây: để lỗi đi tiếp tới errorHandler.
const pool = require("../db/pool");

async function findAll(filters) {
  throw new Error("TODO: findAll chưa viết");
}

async function count(filters) {
  throw new Error("TODO: count chưa viết");
}

async function findById(id) {
  throw new Error("TODO: findById chưa viết");
}

async function create(data) {
  throw new Error("TODO: create chưa viết");
}

async function update(id, changes) {
  throw new Error("TODO: update chưa viết");
}

async function remove(id) {
  throw new Error("TODO: remove chưa viết");
}

module.exports = { findAll, count, findById, create, update, remove };
