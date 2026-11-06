// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const express = require("express");
const controller = require("../controllers/courses.controller");
const enrollmentsController = require("../controllers/enrollments.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const {
  createCourseSchema,
  updateCourseSchema,
  listCoursesQuerySchema,
  idParamSchema,
} = require("../schemas/course.schema");

const router = express.Router();

// Xem khóa học: công khai, không cần đăng nhập.
router.get("/", validate(listCoursesQuerySchema, "query"), asyncHandler(controller.listCourses));
router.get("/:id", validate(idParamSchema, "params"), asyncHandler(controller.getCourse));
router.get("/:id/lessons", validate(idParamSchema, "params"), asyncHandler(controller.listCourseLessons));

// Ghi danh: chỉ học viên (student); học viên là người trong token.
router.post(
  "/:id/enroll",
  authenticate,
  authorize("student"),
  validate(idParamSchema, "params"),
  asyncHandler(enrollmentsController.enrollInCourse)
);

// Tạo, sửa, xóa khóa học: chỉ admin. Thứ tự: authenticate, authorize, validate, controller.
router.post("/", authenticate, authorize("admin"), validate(createCourseSchema, "body"), asyncHandler(controller.createCourse));
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(idParamSchema, "params"),
  validate(createCourseSchema, "body"),
  asyncHandler(controller.updateCourse)
);
router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(idParamSchema, "params"),
  validate(updateCourseSchema, "body"),
  asyncHandler(controller.updateCourse)
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(idParamSchema, "params"),
  asyncHandler(controller.deleteCourse)
);

module.exports = router;
// ===== HẾT MÃ NỀN =====
