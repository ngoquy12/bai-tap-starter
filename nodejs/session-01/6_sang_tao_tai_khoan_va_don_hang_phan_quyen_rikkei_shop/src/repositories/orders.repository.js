// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Tạo đơn hàng trong một giao dịch: hoặc trừ kho và ghi đủ orders + order_items, hoặc không đổi gì cả
const pool = require("../db/pool");
const httpError = require("../errors/httpError");

// items: [{ productId, quantity }]; trả id đơn mới (trạng thái pending)
async function createOrder(userId, items) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    let total = 0;
    const lines = [];
    for (const item of items) {
      const [rows] = await connection.execute("SELECT id, price FROM products WHERE id = ?", [item.productId]);
      if (rows.length === 0) {
        throw httpError(404, "NOT_FOUND", "Không tìm thấy sản phẩm");
      }
      // Điều kiện stock >= ? nằm trong chính câu UPDATE nên hai đơn cùng mua món cuối không thể cùng thành công
      const [updated] = await connection.execute(
        "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
        [item.quantity, item.productId, item.quantity]
      );
      if (updated.affectedRows === 0) {
        throw httpError(409, "CONFLICT", "Không đủ hàng trong kho");
      }
      total += rows[0].price * item.quantity;
      lines.push({ productId: item.productId, quantity: item.quantity, unitPrice: rows[0].price });
    }
    const [order] = await connection.execute(
      "INSERT INTO orders (user_id, status, total) VALUES (?, 'pending', ?)",
      [userId, total]
    );
    for (const line of lines) {
      await connection.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [order.insertId, line.productId, line.quantity, line.unitPrice]
      );
    }
    await connection.commit();
    return order.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
// ===== HẾT MÃ NỀN =====

// ===== BÀI LÀM: orders.repository (đọc đơn, đổi trạng thái và hoàn kho) =====
// Đơn hàng trả ra có dạng { id, userId, status, total, createdAt, items: [{ productId, name, quantity, unitPrice }] }
// Giữ nguyên tên hàm và tham số; createOrder ở khối mã nền phía trên không được sửa.

// TODO: một đơn kèm items, hoặc null khi không có
async function findById(id) {
  return undefined;
}

// TODO: một trang đơn hàng; filters gồm page, limit, userId và status (hai trường sau có thể vắng); đơn mới nhất đứng đầu
async function findAll(filters) {
  return undefined;
}

// TODO: tổng số đơn khớp filters (không phân trang)
async function count(filters) {
  return undefined;
}

// TODO: đổi trạng thái đơn trong một giao dịch, hủy đơn thì hoàn kho; trả đơn sau khi sửa, null khi không có đơn, 409 khi chuyển không hợp lệ
async function updateStatus(id, status) {
  return undefined;
}

module.exports = { createOrder, findById, findAll, count, updateStatus };
