// ===== BÀI LÀM: enrollment.schema.js =====
const { z } = require("zod");

// Tham số :id của ghi danh trên URL (chuỗi, ép sang số nguyên dương).
// TODO: dùng z.coerce.number()
const enrollmentIdParamSchema = z.object({});

// Body của PATCH /enrollments/:id/progress: progress là số nguyên 0-100 (chuỗi "80" bị từ chối).
// TODO: thông báo lỗi cố định ở bảng trong đề
const progressBodySchema = z.object({});

// Query của GET /enrollments (quản trị viên): page, limit, courseId, status.
// TODO: mặc định, giới hạn và thông báo lỗi theo bảng trong đề
const listEnrollmentsQuerySchema = z.object({});

module.exports = { enrollmentIdParamSchema, progressBodySchema, listEnrollmentsQuerySchema };
