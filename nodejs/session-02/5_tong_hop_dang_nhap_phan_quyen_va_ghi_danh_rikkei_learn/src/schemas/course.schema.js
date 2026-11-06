// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const { z } = require("zod");

const LEVELS = ["beginner", "intermediate", "advanced"];
const LEVEL_MESSAGE = "Cấp độ phải là beginner, intermediate hoặc advanced";

// Dữ liệu tạo mới (POST) và thay toàn bộ (PUT); trường lạ như id, createdAt bị bỏ khỏi kết quả.
const createCourseSchema = z.object({
  title: z
    .string({ required_error: "Tiêu đề không được để trống", invalid_type_error: "Tiêu đề phải là chuỗi" })
    .trim()
    .min(1, "Tiêu đề không được để trống")
    .max(120, "Tiêu đề tối đa 120 ký tự"),
  description: z
    .string({ invalid_type_error: "Mô tả phải là chuỗi" })
    .trim()
    .max(500, "Mô tả tối đa 500 ký tự")
    .default(""),
  level: z.enum(LEVELS, { message: LEVEL_MESSAGE }),
});

// PATCH: mọi trường tùy chọn, nhưng phải gửi ít nhất một trường.
const updateCourseSchema = createCourseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "Cần gửi ít nhất một trường" });

// Query string luôn là chuỗi nên dùng z.coerce.number() để ép sang số.
function queryInt(label) {
  return z.coerce.number({ invalid_type_error: label + " phải là số" }).int(label + " phải là số nguyên");
}

const listCoursesQuerySchema = z.object({
  page: queryInt("page").min(1, "page tối thiểu là 1").default(1),
  limit: queryInt("limit").min(1, "limit tối thiểu là 1").max(50, "limit tối đa là 50").default(5),
  level: z.enum(LEVELS, { message: LEVEL_MESSAGE }).optional(),
  q: z.string().trim().min(1, "q không được để trống").optional(),
  sort: z.enum(["title", "level", "createdAt"], { message: "sort chỉ nhận title, level hoặc createdAt" }).default("createdAt"),
  order: z.enum(["asc", "desc"], { message: "order chỉ nhận asc hoặc desc" }).default("asc"),
});

// Tham số :id trên URL cũng là chuỗi: ép sang số nguyên dương.
const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "id phải là số" })
    .int("id phải là số nguyên")
    .positive("id phải lớn hơn 0"),
});

module.exports = { createCourseSchema, updateCourseSchema, listCoursesQuerySchema, idParamSchema };
// ===== HẾT MÃ NỀN =====
