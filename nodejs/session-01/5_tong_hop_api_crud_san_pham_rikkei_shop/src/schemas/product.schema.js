// ===== BÀI LÀM: luật dữ liệu vào của /products bằng zod =====
// TODO: thay bốn schema rỗng dưới đây bằng schema đúng theo đề bài (thông báo tiếng Việt, đúng từng chữ).
// Gợi ý: query string và tham số URL luôn là chuỗi nên cần ép sang số (Lesson 5, mục 2.2).
const { z } = require("zod");

const createProductSchema = z.object({});
const updateProductSchema = z.object({});
const listProductsQuerySchema = z.object({});
const idParamSchema = z.object({});

module.exports = { createProductSchema, updateProductSchema, listProductsQuerySchema, idParamSchema };
