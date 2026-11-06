// Test tự chấm Bài 6 (phần 4): helmet và CORS. Hai kiểm tra này chạy trên route công khai nên không cần token.
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/db/pool");
const { resetDatabase } = require("./helpers/db");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

const FRONTEND = "http://localhost:5173";

describe("helmet", () => {
  it("thêm tiêu đề bảo mật và bỏ X-Powered-By", async () => {
    const res = await request(app).get("/products/1");
    expect(res.status).toBe(200);
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("CORS", () => {
  it("origin http://localhost:5173 nhận header cho phép, origin lạ thì không; phản hồi lỗi 401 vẫn mang header", async () => {
    const allowed = await request(app).get("/products/1").set("Origin", FRONTEND);
    expect(allowed.headers["access-control-allow-origin"]).toBe(FRONTEND);
    const evil = await request(app).get("/products/1").set("Origin", "http://evil.example");
    expect(evil.status).toBe(200);
    expect(evil.headers["access-control-allow-origin"]).toBeUndefined();
    const unauthorized = await request(app).get("/auth/me").set("Origin", FRONTEND);
    expect(unauthorized.status).toBe(401);
    expect(unauthorized.headers["access-control-allow-origin"]).toBe(FRONTEND);
  });

  it("preflight OPTIONS: 204 và cho phép method, header của frontend", async () => {
    const res = await request(app)
      .options("/products")
      .set("Origin", FRONTEND)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type,authorization");
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe(FRONTEND);
    expect(res.headers["access-control-allow-methods"]).toContain("POST");
  });
});
