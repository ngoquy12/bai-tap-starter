// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const express = require("express");
const controller = require("../controllers/enrollments.controller");
const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const { enrollmentIdParamSchema, progressBodySchema } = require("../schemas/enrollment.schema");

const router = express.Router();

// Thứ tự: authenticate (biết bạn là ai), validate (dữ liệu đúng dạng), controller (quyền sở hữu).
router.patch(
  "/:id/progress",
  authenticate,
  validate(enrollmentIdParamSchema, "params"),
  validate(progressBodySchema, "body"),
  asyncHandler(controller.updateEnrollmentProgress)
);

module.exports = router;
// ===== HẾT MÃ NỀN =====
