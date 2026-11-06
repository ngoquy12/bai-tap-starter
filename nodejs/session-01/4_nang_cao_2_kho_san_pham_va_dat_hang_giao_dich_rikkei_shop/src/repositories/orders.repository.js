// ===== BÀI LÀM: orders.repository (đặt hàng, hủy đơn, đọc đơn) =====
// Đặt hàng và hủy đơn đều chạy trong một giao dịch: hoặc đổi đủ kho và đơn, hoặc không đổi gì cả.
const pool = require("../db/pool");
const httpError = require("../errors/httpError");

// TODO: items là [{ productId, quantity }]; trả id đơn mới (trạng thái pending)
async function createOrder(userId, items) {
  throw new Error("Chưa cài đặt createOrder");
}

// TODO: đơn kèm các dòng hàng, hoặc null khi không có
async function findOrderById(orderId) {
  throw new Error("Chưa cài đặt findOrderById");
}

// TODO: hủy đơn pending và hoàn kho trong cùng giao dịch; trả đơn sau khi hủy
async function cancelOrder(orderId) {
  throw new Error("Chưa cài đặt cancelOrder");
}

module.exports = { createOrder, findOrderById, cancelOrder };
