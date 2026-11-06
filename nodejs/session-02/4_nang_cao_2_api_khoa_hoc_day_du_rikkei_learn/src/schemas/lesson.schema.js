// ===== BÀI LÀM: lesson.schema.js =====
const { z } = require("zod");

// TODO: createLessonSchema (title, position), updateLessonSchema (PATCH),
// lessonParamsSchema (id và lessonId trên URL). Thông báo lỗi lấy đúng từ bảng trong đề.
const createLessonSchema = z.object({});
const updateLessonSchema = z.object({});
const lessonParamsSchema = z.object({});

module.exports = { createLessonSchema, updateLessonSchema, lessonParamsSchema };
