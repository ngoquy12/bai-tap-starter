// ===== BÀI LÀM: courses.routes.js =====
const express = require("express");
const coursesController = require("../controllers/courses.controller");
const lessonsController = require("../controllers/lessons.controller");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const courseSchemas = require("../schemas/course.schema");
const lessonSchemas = require("../schemas/lesson.schema");

const router = express.Router();

// TODO: ghép 9 route của bảng endpoint trong đề; mỗi route đi qua validate (params, query, body)
// rồi tới controller được bọc bằng asyncHandler.

module.exports = router;
