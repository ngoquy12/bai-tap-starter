// ===== BÀI LÀM: stats.routes.js =====
const express = require("express");
const controller = require("../controllers/stats.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const { statsQuerySchema } = require("../schemas/stats.schema");

const router = express.Router();

// TODO: GET / chỉ dành cho admin (gắn ở /stats).

module.exports = router;
