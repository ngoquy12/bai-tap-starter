// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const express = require("express");
const controller = require("../controllers/courses.controller");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const { listCoursesQuerySchema, idParamSchema } = require("../schemas/course.schema");

const router = express.Router();

// Xem khóa học: công khai, không cần đăng nhập.
router.get("/", validate(listCoursesQuerySchema, "query"), asyncHandler(controller.listCourses));
router.get("/:id", validate(idParamSchema, "params"), asyncHandler(controller.getCourse));
router.get("/:id/lessons", validate(idParamSchema, "params"), asyncHandler(controller.listCourseLessons));
// ===== HẾT MÃ NỀN =====

// ===== BÀI LÀM: route ghi và route ghi danh của khóa học =====
// TODO: POST /:id/enroll (chỉ student), POST /, PUT /:id, PATCH /:id, DELETE /:id (chỉ admin).
// Dùng createCourseSchema và updateCourseSchema trong src/schemas/course.schema.js; nhớ thứ tự middleware trong đề.

module.exports = router;
