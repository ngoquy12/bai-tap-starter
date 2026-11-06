// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Luật của dữ liệu vào cho /products, viết bằng zod; thông báo lỗi tiếng Việt
const { z } = require("zod");

// Query string và tham số URL luôn là chuỗi nên phải ép sang số
function queryInt(label) {
  return z.coerce.number({ invalid_type_error: label + " phải là số" }).int(label + " phải là số nguyên");
}

const createProductSchema = z.object({
  name: z
    .string({ required_error: "Tên sản phẩm là bắt buộc", invalid_type_error: "Tên sản phẩm phải là chuỗi" })
    .trim()
    .min(1, "Tên sản phẩm không được để trống")
    .max(100, "Tên sản phẩm tối đa 100 ký tự"),
  price: z
    .number({ required_error: "Giá là bắt buộc", invalid_type_error: "Giá phải là số" })
    .int("Giá phải là số nguyên")
    .positive("Giá phải lớn hơn 0"),
  stock: z
    .number({ invalid_type_error: "Tồn kho phải là số" })
    .int("Tồn kho phải là số nguyên")
    .min(0, "Tồn kho không được âm")
    .default(0),
  categoryId: z
    .number({ required_error: "Danh mục là bắt buộc", invalid_type_error: "Danh mục phải là số" })
    .int("Danh mục phải là số nguyên")
    .positive("Danh mục phải lớn hơn 0"),
});

// PATCH: mọi trường tùy chọn, nhưng phải gửi ít nhất một trường
const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "Cần gửi ít nhất một trường" });

const listProductsQuerySchema = z.object({
  page: queryInt("page").min(1, "page tối thiểu là 1").default(1),
  limit: queryInt("limit").min(1, "limit tối thiểu là 1").max(50, "limit tối đa là 50").default(5),
  categoryId: queryInt("categoryId").positive("categoryId phải lớn hơn 0").optional(),
  q: z.string().trim().min(1, "q không được để trống").optional(),
  minPrice: queryInt("minPrice").min(0, "minPrice không được âm").optional(),
  maxPrice: queryInt("maxPrice").min(0, "maxPrice không được âm").optional(),
  sort: z.enum(["price", "name", "createdAt"], { message: "sort chỉ nhận price, name hoặc createdAt" }).default("createdAt"),
  order: z.enum(["asc", "desc"], { message: "order chỉ nhận asc hoặc desc" }).default("asc"),
});

const idParamSchema = z.object({
  id: queryInt("id").positive("id phải lớn hơn 0"),
});

module.exports = { createProductSchema, updateProductSchema, listProductsQuerySchema, idParamSchema };
// ===== HẾT MÃ NỀN =====
