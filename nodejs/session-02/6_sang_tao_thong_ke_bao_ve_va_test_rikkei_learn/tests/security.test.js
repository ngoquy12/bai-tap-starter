// Test tự chấm Bài 6 (phần 2): CORS, helmet, morgan. KHÔNG sửa tệp này.
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/db/pool");
const { tokenFor } = require("./helpers/token");

afterAll(async () => {
  await pool.end();
});

const FRONTEND = "http://localhost:5173";

describe("CORS", () => {
  it("chỉ origin http://localhost:5173 nhận header CORS; origin lạ vẫn nhận 200 nhưng không có header", async () => {
    const allowed = await request(app).get("/courses/1").set("Origin", FRONTEND);
    expect(allowed.status).toBe(200);
    expect(allowed.headers["access-control-allow-origin"]).toBe(FRONTEND);
    const foreign = await request(app).get("/courses/1").set("Origin", "http://evil.example");
    expect(foreign.status).toBe(200);
    expect(foreign.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("preflight OPTIONS /courses trả 204 kèm danh sách method được phép", async () => {
    const res = await request(app)
      .options("/courses")
      .set("Origin", FRONTEND)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type,authorization");
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe(FRONTEND);
    expect(res.headers["access-control-allow-methods"]).toBe("GET,HEAD,PUT,PATCH,POST,DELETE");
  });

  it("phản hồi lỗi 401 và 404 cũng mang header CORS vì cors đứng trước mọi router", async () => {
    const unauthorized = await request(app).get("/stats").set("Origin", FRONTEND);
    expect(unauthorized.status).toBe(401);
    expect(unauthorized.headers["access-control-allow-origin"]).toBe(FRONTEND);
    const lost = await request(app).get("/khong-co").set("Origin", FRONTEND);
    expect(lost.status).toBe(404);
    expect(lost.headers["access-control-allow-origin"]).toBe(FRONTEND);
  });
});

describe("helmet và morgan", () => {
  it("helmet thêm x-content-type-options: nosniff và x-frame-options: SAMEORIGIN", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
  });

  it("phản hồi không còn tiêu đề x-powered-by", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("morgan tắt khi NODE_ENV là test: yêu cầu không để lại dòng nhật ký nào", async () => {
    const spy = vi.spyOn(process.stdout, "write");
    await request(app).get("/health");
    await request(app).get("/stats").set("Authorization", "Bearer " + tokenFor(1, "admin"));
    await new Promise((resolve) => setTimeout(resolve, 100));
    const written = spy.mock.calls.map((call) => String(call[0])).join("");
    spy.mockRestore();
    expect(written).not.toContain("/health");
    expect(written).not.toContain("/stats");
  });
});
