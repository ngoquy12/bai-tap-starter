// Test tự chấm Bài 5 (phần 1): đăng ký, đăng nhập, phản hồi không lộ passwordHash. KHÔNG sửa tệp này.
// Tệp này gọi POST /auth/login đúng 4 lần: Bài 6 giới hạn số lần đăng nhập, nên đừng thêm lệnh gọi đăng nhập.
const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

const NEW_USER = { email: "  Minh@Rikkei.edu ", password: "Matkhau123", fullName: "Lê Văn Minh" };
const LOGIN_ERROR = { error: { code: "UNAUTHORIZED", message: "Email hoặc mật khẩu không đúng" } };

describe("Đăng ký tài khoản", () => {
  it("đăng ký hợp lệ trả 201 và người dùng công khai gồm đúng id, email đã chuẩn hóa, fullName, role", async () => {
    const res = await request(app).post("/auth/register").send(NEW_USER);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 7, email: "minh@rikkei.edu", fullName: "Lê Văn Minh", role: "student" });
  });

  it("client gửi role admin thì bị bỏ qua: tài khoản mới trong cơ sở dữ liệu luôn là student", async () => {
    const res = await request(app).post("/auth/register").send({ ...NEW_USER, role: "admin" });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe("student");
    const [rows] = await pool.query("SELECT role FROM users WHERE id = 7");
    expect(rows[0].role).toBe("student");
  });

  it("mật khẩu được lưu dạng băm bcrypt, không phải mật khẩu thô", async () => {
    await request(app).post("/auth/register").send(NEW_USER);
    const [rows] = await pool.query("SELECT password_hash FROM users WHERE id = 7");
    const hash = rows[0].password_hash;
    expect(hash).not.toBe("Matkhau123");
    expect(hash).toHaveLength(60);
    expect(await bcrypt.compare("Matkhau123", hash)).toBe(true);
  });

  it("email đã đăng ký (kể cả viết hoa khác) trả 409 CONFLICT và không thêm người dùng", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "AN@rikkei.edu", password: "Matkhau123", fullName: "Người trùng" });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: { code: "CONFLICT", message: "Email đã được đăng ký" } });
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM users");
    expect(rows[0].total).toBe(6);
  });

  it("dữ liệu sai trả 400 VALIDATION_ERROR với details theo thứ tự email, password, fullName", async () => {
    const res = await request(app).post("/auth/register").send({ email: "abc", password: "123", fullName: "" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toBe("Dữ liệu không hợp lệ");
    expect(res.body.error.details).toEqual([
      { field: "email", message: "Email không hợp lệ" },
      { field: "password", message: "Mật khẩu phải có từ 8 đến 72 ký tự" },
      { field: "fullName", message: "Họ tên không được để trống" },
    ]);
  });

  it("đầu vào biên bị từ chối 400: mật khẩu 73 ký tự, họ tên toàn dấu cách, mật khẩu là số", async () => {
    const cases = [
      { ...NEW_USER, password: "a".repeat(73) },
      { ...NEW_USER, fullName: "     " },
      { ...NEW_USER, password: 12345678 },
    ];
    for (const body of cases) {
      const res = await request(app).post("/auth/register").send(body);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    }
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM users");
    expect(rows[0].total).toBe(6);
  });
});

describe("Đăng nhập", () => {
  it("đăng nhập đúng trả 200 { token, user }; user công khai, token có sub là chuỗi id và role", async () => {
    const res = await request(app).post("/auth/login").send({ email: "an@rikkei.edu", password: "Matkhau123" });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 2, email: "an@rikkei.edu", fullName: "Nguyễn Văn An", role: "student" });
    const payload = jwt.decode(res.body.token);
    expect(payload.sub).toBe("2");
    expect(payload.role).toBe("student");
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it("sai mật khẩu trả 401 UNAUTHORIZED với thông báo chung", async () => {
    const res = await request(app).post("/auth/login").send({ email: "an@rikkei.edu", password: "SaiMatKhau1" });
    expect(res.status).toBe(401);
    expect(res.body).toEqual(LOGIN_ERROR);
  });

  it("email chưa đăng ký trả 401 với đúng thông báo chung như sai mật khẩu", async () => {
    const res = await request(app).post("/auth/login").send({ email: "khongco@rikkei.edu", password: "Matkhau123" });
    expect(res.status).toBe(401);
    expect(res.body).toEqual(LOGIN_ERROR);
  });

  it("token nhận được khi đăng nhập dùng được ngay cho GET /auth/me", async () => {
    const login = await request(app).post("/auth/login").send({ email: "binh@rikkei.edu", password: "Matkhau123" });
    const res = await request(app).get("/auth/me").set("Authorization", "Bearer " + login.body.token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 3, email: "binh@rikkei.edu", fullName: "Trần Thị Bình", role: "student" });
  });
});

describe("Phản hồi không lộ mật khẩu băm", () => {
  it("không phản hồi nào chứa passwordHash hay chuỗi băm bcrypt", async () => {
    const admin = "Bearer " + tokenFor(1, "admin");
    const an = "Bearer " + tokenFor(2, "student");
    const responses = [
      await request(app).post("/auth/register").send(NEW_USER),
      await request(app).post("/auth/register").send(NEW_USER),
      await request(app).get("/auth/me").set("Authorization", an),
      await request(app).get("/auth/me").set("Authorization", admin),
      await request(app).get("/me/enrollments").set("Authorization", an),
      await request(app).get("/enrollments").set("Authorization", admin),
    ];
    expect(responses.map((res) => res.status)).toEqual([201, 409, 200, 200, 200, 200]);
    for (const res of responses) {
      const text = JSON.stringify(res.body);
      expect(text).not.toMatch(/passwordHash|password_hash/i);
      expect(text).not.toContain("$2");
    }
  });
});
