// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const express = require("express");
const controller = require("../controllers/auth.controller");
const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const { registerSchema, loginSchema } = require("../schemas/auth.schema");

const router = express.Router();

router.post("/register", validate(registerSchema, "body"), asyncHandler(controller.register));
router.post("/login", validate(loginSchema, "body"), asyncHandler(controller.login));
router.get("/me", authenticate, asyncHandler(controller.me));

module.exports = router;
// ===== HẾT MÃ NỀN =====
