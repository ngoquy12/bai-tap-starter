// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const express = require("express");
const controller = require("../controllers/enrollments.controller");
const authenticate = require("../middlewares/authenticate");
const asyncHandler = require("../middlewares/asyncHandler");

const router = express.Router();

// Dữ liệu riêng của người đang đăng nhập (gắn ở /me).
router.get("/enrollments", authenticate, asyncHandler(controller.listMyEnrollments));

module.exports = router;
// ===== HẾT MÃ NỀN =====
