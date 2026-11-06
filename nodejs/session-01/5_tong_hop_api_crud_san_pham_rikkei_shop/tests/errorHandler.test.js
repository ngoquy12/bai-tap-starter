// Test tự chấm Bài 5 (phần 2): errorHandler đứng riêng, nhận hai loại lỗi mà các route của bài chưa tạo ra.
const express = require("express");
const request = require("supertest");
const { z } = require("zod");
const errorHandler = require("../src/middlewares/errorHandler");

// Ứng dụng nhỏ chỉ có một route ném đúng lỗi cần thử rồi tới errorHandler
function appThrowing(error) {
  const mini = express();
  mini.get("/boom", (req, res, next) => next(error));
  mini.use(errorHandler);
  return mini;
}

describe("errorHandler đứng riêng", () => {
  it("lỗi ZodError ném thẳng: 400 VALIDATION_ERROR kèm details theo từng trường", async () => {
    const schema = z.object({ qty: z.number({ required_error: "qty là bắt buộc" }) });
    let zodError;
    try {
      schema.parse({});
    } catch (error) {
      zodError = error;
    }
    const res = await request(appThrowing(zodError)).get("/boom");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ",
        details: [{ field: "qty", message: "qty là bắt buộc" }],
      },
    });
  });

  it("ER_DUP_ENTRY của MySQL: 409 CONFLICT, không lộ nội dung lỗi gốc", async () => {
    const error = new Error("Duplicate entry 'lan@rikkei.shop' for key 'users.email'");
    error.code = "ER_DUP_ENTRY";
    const res = await request(appThrowing(error)).get("/boom");
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: { code: "CONFLICT", message: "Email đã được đăng ký" } });
  });
});
