// ===== BÀI LÀM: orders.controller =====
// Giữ nguyên tên hàm; userId của đơn luôn lấy từ req.user, không lấy từ thân yêu cầu.
const repository = require("../repositories/orders.repository");
const httpError = require("../errors/httpError");

// TODO: POST /orders, trả 201 và đơn vừa tạo (đọc lại bằng repository.findById)
async function createOrder(req, res) {
  res.sendStatus(501);
}

// TODO: GET /orders, trả { data, meta: { page, limit, total, totalPages } }; khách chỉ thấy đơn của mình
async function listOrders(req, res) {
  res.sendStatus(501);
}

// TODO: GET /orders/:id, 404 khi không có đơn, 403 khi không phải chủ đơn và không phải admin
async function getOrder(req, res) {
  res.sendStatus(501);
}

// TODO: PATCH /orders/:id/status, trả đơn sau khi sửa hoặc 404 khi không có đơn
async function updateOrderStatus(req, res) {
  res.sendStatus(501);
}

module.exports = { createOrder, listOrders, getOrder, updateOrderStatus };
