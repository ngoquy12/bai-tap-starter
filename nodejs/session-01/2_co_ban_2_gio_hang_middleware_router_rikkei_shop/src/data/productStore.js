// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Mô phỏng truy vấn bất đồng bộ: Lesson 4 sẽ thay thân hàm bằng truy vấn MySQL
const products = require("./products");

async function findProductById(id) {
  return products.find((p) => p.id === id);
}

module.exports = { findProductById };
// ===== HẾT MÃ NỀN =====
