// Test tự chấm Bài 6 (phần 3): giới hạn tần suất đăng nhập. KHÔNG sửa tệp này.
// Bộ đếm của express-rate-limit nằm trong bộ nhớ của từng tệp test, nên mỗi tệp có 5 lần gọi /auth/login riêng.
// Vì vậy mỗi tệp chỉ có MỘT test dùng tới bộ đếm đăng nhập; các test còn lại không gọi /auth/login.
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

describe("Giới hạn đăng nhập", () => {
  it("5 lần đăng nhập đúng đều nhận 200, lần thứ 6 nhận 429 RATE_LIMITED kèm tiêu đề giới hạn", async () => {
    const body = { email: "an@rikkei.edu", password: "Matkhau123" };
    let first;
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post("/auth/login").send(body);
      expect(res.status).toBe(200);
      if (i === 0) first = res;
    }
    expect(first.headers["ratelimit-limit"]).toBe("5");
    expect(first.headers["ratelimit-remaining"]).toBe("4");
    const blocked = await request(app).post("/auth/login").send(body);
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ error: { code: "RATE_LIMITED", message: "Quá nhiều yêu cầu, hãy thử lại sau" } });
    expect(Number(blocked.headers["retry-after"])).toBeGreaterThan(0);
  });

  it("chỉ /auth/login bị giới hạn: các route khác gọi nhiều lần vẫn 200 và không có tiêu đề ratelimit", async () => {
    for (let i = 0; i < 8; i++) {
      const res = await request(app).get("/courses");
      expect(res.status).toBe(200);
      expect(res.headers["ratelimit-limit"]).toBeUndefined();
    }
    const health = await request(app).get("/health");
    expect(health.status).toBe(200);
  });
});
