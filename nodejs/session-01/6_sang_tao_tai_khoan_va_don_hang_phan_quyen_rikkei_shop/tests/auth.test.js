// Test tự chấm Bài 6 (phần 1): đăng ký, đăng nhập, /auth/me và middleware authenticate.
// Lưu ý: /auth/login bị giới hạn 5 yêu cầu mỗi 15 phút và bộ đếm nằm trong bộ nhớ của từng tệp test,
// nên tệp này chỉ gọi đăng nhập tối đa 4 lần; các tệp khác dùng tokenFor() để lấy token.
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/db/pool");
const { resetDatabase } = require("./helpers/db");
const { tokenFor } = require("./helpers/token");

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

const UNAUTHORIZED = { error: { code: "UNAUTHORIZED", message: "Thiếu hoặc sai mã xác thực" } };

const LAN = { id: 2, email: "lan@rikkei.shop", fullName: "Nguyễn Thị Lan", role: "customer" };

const bearer = (token) => "Bearer " + token;

describe("POST /auth/register", () => {
  it("201 với người dùng công khai: email chuẩn hóa, mật khẩu lưu dạng băm bcrypt", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "Minh@Rikkei.shop ", password: "Matkhau123", fullName: "Lê Minh" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 4, email: "minh@rikkei.shop", fullName: "Lê Minh", role: "customer" });
    const [[row]] = await pool.query("SELECT password_hash FROM users WHERE email = 'minh@rikkei.shop'");
    expect(row.password_hash).not.toBe("Matkhau123");
    expect(row.password_hash.startsWith("$2")).toBe(true);
    expect(bcrypt.compareSync("Matkhau123", row.password_hash)).toBe(true);
  });

  it("trường role do client gửi bị bỏ qua: tài khoản mới luôn là customer", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "minh@rikkei.shop", password: "Matkhau123", fullName: "Lê Minh", role: "admin" });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe("customer");
    const [[row]] = await pool.query("SELECT role FROM users WHERE email = 'minh@rikkei.shop'");
    expect(row.role).toBe("customer");
  });

  it("email đã có (kể cả viết hoa khác): 409 CONFLICT và không thêm người dùng", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "LAN@rikkei.shop", password: "Matkhau123", fullName: "Lan Khác" });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: { code: "CONFLICT", message: "Email đã được đăng ký" } });
    const [[row]] = await pool.query("SELECT COUNT(*) AS n FROM users");
    expect(row.n).toBe(3);
  });

  it("dữ liệu sai: 400 VALIDATION_ERROR theo thứ tự email, password, fullName; mật khẩu quá 72 ký tự cũng bị từ chối", async () => {
    const res = await request(app).post("/auth/register").send({ email: "abc", password: "123", fullName: "" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toBe("Dữ liệu không hợp lệ");
    expect(res.body.error.details.map((d) => d.field)).toEqual(["email", "password", "fullName"]);
    const tooLong = await request(app)
      .post("/auth/register")
      .send({ email: "minh@rikkei.shop", password: "a".repeat(73), fullName: "Lê Minh" });
    expect(tooLong.status).toBe(400);
    expect(tooLong.body.error.details.map((d) => d.field)).toEqual(["password"]);
  });
});

describe("POST /auth/login", () => {
  it("đúng email và mật khẩu: 200 { token, user }, token ký đúng, có sub, role, exp và dùng được cho /auth/me", async () => {
    const res = await request(app).post("/auth/login").send({ email: "lan@rikkei.shop", password: "Matkhau123" });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual(LAN);
    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(payload.sub).toBe("2");
    expect(payload.role).toBe("customer");
    expect(payload.exp).toBeGreaterThan(payload.iat);
    const me = await request(app).get("/auth/me").set("Authorization", bearer(res.body.token));
    expect(me.status).toBe(200);
    expect(me.body).toEqual(LAN);
  });

  it("sai mật khẩu và email lạ cho cùng một phản hồi 401 (không lộ email nào tồn tại)", async () => {
    const wrongPassword = await request(app).post("/auth/login").send({ email: "lan@rikkei.shop", password: "SaiMatKhau1" });
    const unknownEmail = await request(app).post("/auth/login").send({ email: "khong.co@rikkei.shop", password: "Matkhau123" });
    const expected = { error: { code: "UNAUTHORIZED", message: "Email hoặc mật khẩu không đúng" } };
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual(expected);
    expect(unknownEmail.body).toEqual(expected);
  });

  it("thiếu trường: 400 VALIDATION_ERROR", async () => {
    const res = await request(app).post("/auth/login").send({ email: "lan@rikkei.shop" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.map((d) => d.field)).toEqual(["password"]);
  });
});

describe("GET /auth/me và authenticate", () => {
  it("token hợp lệ: 200 với hồ sơ công khai của chính mình", async () => {
    const res = await request(app).get("/auth/me").set("Authorization", bearer(tokenFor(2, "customer")));
    expect(res.status).toBe(200);
    expect(res.body).toEqual(LAN);
  });

  it("thiếu header hoặc sai kiểu Bearer: 401", async () => {
    const none = await request(app).get("/auth/me");
    expect(none.status).toBe(401);
    expect(none.body).toEqual(UNAUTHORIZED);
    const basic = await request(app).get("/auth/me").set("Authorization", "Basic " + tokenFor(2, "customer"));
    expect(basic.status).toBe(401);
    const garbage = await request(app).get("/auth/me").set("Authorization", bearer("khong.phai.token"));
    expect(garbage.status).toBe(401);
    expect(garbage.body).toEqual(UNAUTHORIZED);
  });

  it("token hết hạn: 401", async () => {
    const expired = jwt.sign(
      { sub: "2", role: "customer", exp: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET
    );
    const res = await request(app).get("/auth/me").set("Authorization", bearer(expired));
    expect(res.status).toBe(401);
    expect(res.body).toEqual(UNAUTHORIZED);
  });

  it("token sai chữ ký (ký bằng khóa khác, hoặc sửa payload thành admin giữ chữ ký cũ): 401", async () => {
    const forged = jwt.sign({ sub: "1", role: "admin" }, "khoa-cua-ke-gian", { expiresIn: "1h" });
    const otherKey = await request(app).get("/auth/me").set("Authorization", bearer(forged));
    expect(otherKey.status).toBe(401);
    expect(otherKey.body).toEqual(UNAUTHORIZED);
    const [header, , signature] = tokenFor(2, "customer").split(".");
    const payload = Buffer.from(JSON.stringify({ sub: "1", role: "admin" })).toString("base64url");
    const tampered = await request(app)
      .get("/auth/me")
      .set("Authorization", bearer([header, payload, signature].join(".")));
    expect(tampered.status).toBe(401);
    expect(tampered.body).toEqual(UNAUTHORIZED);
  });

  it("token hợp lệ của tài khoản không còn trong cơ sở dữ liệu: 401", async () => {
    const res = await request(app).get("/auth/me").set("Authorization", bearer(tokenFor(99, "customer")));
    expect(res.status).toBe(401);
    expect(res.body).toEqual(UNAUTHORIZED);
  });
});

describe("passwordHash không rời máy chủ", () => {
  it("không phản hồi nào của register, /auth/me, /orders, /products chứa passwordHash hay chuỗi băm", async () => {
    const admin = bearer(tokenFor(1, "admin"));
    const responses = [
      await request(app).post("/auth/register").send({ email: "minh@rikkei.shop", password: "Matkhau123", fullName: "Lê Minh" }),
      await request(app).get("/auth/me").set("Authorization", admin),
      await request(app).get("/orders").set("Authorization", admin),
      await request(app).get("/orders/1").set("Authorization", admin),
      await request(app).get("/products"),
    ];
    expect(responses.map((res) => res.status)).toEqual([201, 200, 200, 200, 200]);
    for (const res of responses) {
      const text = JSON.stringify(res.body).toLowerCase();
      expect(text).not.toContain("passwordhash");
      expect(text).not.toContain("password_hash");
      expect(text).not.toContain("$2a$");
    }
  });
});
