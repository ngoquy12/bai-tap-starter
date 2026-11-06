// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Router sản phẩm chỉ đọc. Dùng try/catch rồi next(error) thay cho asyncHandler
// để router này chạy được ngay cả khi bạn chưa viết asyncHandler.
const express = require("express");
const products = require("../data/products");
const { findProductById } = require("../data/productStore");
const httpError = require("../errors/httpError");

const router = express.Router();

// Danh sách toàn bộ sản phẩm
router.get("/", (req, res) => {
  res.json(products);
});

// Chi tiết một sản phẩm; id không phải số cũng là không tìm thấy
router.get("/:id", async (req, res, next) => {
  try {
    const product = await findProductById(Number(req.params.id));
    if (!product) throw httpError(404, "NOT_FOUND", "Không tìm thấy sản phẩm");
    res.json(product);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
// ===== HẾT MÃ NỀN =====
