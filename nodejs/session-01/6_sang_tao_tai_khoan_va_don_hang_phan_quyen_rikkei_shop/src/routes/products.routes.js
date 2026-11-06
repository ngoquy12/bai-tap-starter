// ===== BÀI LÀM: products.routes =====
// Bản của Bài 5: mọi route đang công khai. TODO: bảo vệ các route ghi (POST, PUT, PATCH, DELETE) theo đề
const express = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const validate = require("../middlewares/validate");
const controller = require("../controllers/products.controller");
const {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  idParamSchema,
} = require("../schemas/product.schema");

const router = express.Router();

router.get("/", validate(listProductsQuerySchema, "query"), asyncHandler(controller.listProducts));
router.get("/:id", validate(idParamSchema, "params"), asyncHandler(controller.getProduct));
router.post("/", validate(createProductSchema, "body"), asyncHandler(controller.createProduct));
router.put(
  "/:id",
  validate(idParamSchema, "params"),
  validate(createProductSchema, "body"),
  asyncHandler(controller.updateProduct)
);
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateProductSchema, "body"),
  asyncHandler(controller.updateProduct)
);
router.delete("/:id", validate(idParamSchema, "params"), asyncHandler(controller.deleteProduct));

module.exports = router;
