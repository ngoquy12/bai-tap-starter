// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const { z } = require("zod");

const PROGRESS_MESSAGE = "Tiến độ phải là số nguyên từ 0 đến 100";

// Tham số :id của ghi danh trên URL (chuỗi, ép sang số nguyên dương).
const enrollmentIdParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "id phải là số" })
    .int("id phải là số nguyên")
    .positive("id phải lớn hơn 0"),
});

// Body của PATCH /enrollments/:id/progress: progress là số nguyên 0-100 (chuỗi "80" bị từ chối).
const progressBodySchema = z.object({
  progress: z
    .number({ required_error: PROGRESS_MESSAGE, invalid_type_error: PROGRESS_MESSAGE })
    .int(PROGRESS_MESSAGE)
    .min(0, PROGRESS_MESSAGE)
    .max(100, PROGRESS_MESSAGE),
});

module.exports = { enrollmentIdParamSchema, progressBodySchema };
// ===== HẾT MÃ NỀN =====
