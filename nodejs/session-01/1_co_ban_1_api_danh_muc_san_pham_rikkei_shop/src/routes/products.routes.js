// ===== BÀI LÀM: Router /products (tìm kiếm, sắp xếp, phân trang, tạo, sửa, xóa) =====
const express = require("express");
const products = require("../data/products");
const httpError = require("../errors/httpError");

const router = express.Router();

// TODO: GET /, GET /:id, POST /, PATCH /:id, DELETE /:id
// Gợi ý: tách các việc lặp lại thành hàm riêng (đọc query, kiểm tra dữ liệu, tìm sản phẩm theo id)

module.exports = router;
