// ===== BÀI LÀM: course.schema.js =====
const { z } = require("zod");

// TODO: createCourseSchema (title, description, level), updateCourseSchema (PATCH),
// listCoursesQuerySchema (page, limit, level, q, hasLessons, sort, order), idParamSchema (id).
// Thông báo lỗi lấy đúng từ bảng trong đề.
const createCourseSchema = z.object({});
const updateCourseSchema = z.object({});
const listCoursesQuerySchema = z.object({});
const idParamSchema = z.object({});

module.exports = { createCourseSchema, updateCourseSchema, listCoursesQuerySchema, idParamSchema };
