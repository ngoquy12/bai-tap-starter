// Test tự chấm Bài 6 (phần 5): giới hạn đăng nhập. Bộ đếm nằm trong bộ nhớ của tệp test này nên tệp này đứng riêng.
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

describe("giới hạn tần suất đăng nhập", () => {
  it("năm lần sai đầu nhận 401, lần thứ sáu nhận 429 RATE_LIMITED", async () => {
    const body = { email: "lan@rikkei.shop", password: "SaiMatKhau1" };
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post("/auth/login").send(body);
      expect(res.status).toBe(401);
    }
    const blocked = await request(app).post("/auth/login").send(body);
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ error: { code: "RATE_LIMITED", message: "Quá nhiều yêu cầu, hãy thử lại sau" } });
  });

  it("giới hạn chỉ áp dụng cho /auth/login: các đường dẫn khác vẫn hoạt động", async () => {
    const products = await request(app).get("/products/1");
    expect(products.status).toBe(200);
    const register = await request(app)
      .post("/auth/register")
      .send({ email: "minh@rikkei.shop", password: "Matkhau123", fullName: "Lê Minh" });
    expect(register.status).toBe(201);
  });
});
