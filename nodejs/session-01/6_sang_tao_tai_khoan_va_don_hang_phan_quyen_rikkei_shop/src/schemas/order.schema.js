// ===== BÀI LÀM: order.schema =====
// Luật dữ liệu vào cho /orders, viết bằng zod. Giữ nguyên bốn tên xuất.
const { z } = require("zod");

// TODO: thân đặt hàng { items: [{ productId, quantity }] }, từ 1 đến 20 dòng
const createOrderSchema = z.object({});

// TODO: query của GET /orders: page, limit, status và userId tùy chọn
const listOrdersQuerySchema = z.object({});

// TODO: tham số :id trên URL
const orderIdParamSchema = z.object({});

// TODO: thân PATCH /orders/:id/status { status } với status thuộc paid, cancelled
const updateOrderStatusSchema = z.object({});

module.exports = { createOrderSchema, listOrdersQuerySchema, orderIdParamSchema, updateOrderStatusSchema };
