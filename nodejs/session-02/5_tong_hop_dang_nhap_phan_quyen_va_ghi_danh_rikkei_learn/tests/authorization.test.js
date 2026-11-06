// Test tự chấm Bài 5 (phần 2): authenticate, authorize và thứ tự middleware. KHÔNG sửa tệp này.
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/db/pool");
const { resetDatabase } = require("./helpers/db");
const { tokenFor, expiredTokenFor, forgedTokenFor, tamperedToAdmin } = require("./helpers/token");

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

const admin = "Bearer " + tokenFor(1, "admin");
const an = "Bearer " + tokenFor(2, "student");
const UNAUTHORIZED = { error: { code: "UNAUTHORIZED", message: "Thiếu hoặc sai mã xác thực" } };
const FORBIDDEN = { error: { code: "FORBIDDEN", message: "Bạn không có quyền thực hiện thao tác này" } };
const NEW_COURSE = { title: "Docker cơ bản", level: "beginner" };

async function countCourses() {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM courses");
  return rows[0].total;
}

describe("authenticate: kiểm tra token", () => {
  it("không gửi header Authorization thì 401 UNAUTHORIZED", async () => {
    const res = await request(app).get("/me/enrollments");
    expect(res.status).toBe(401);
    expect(res.body).toEqual(UNAUTHORIZED);
  });

  it("header sai kiểu (không phải Bearer) hoặc token rác thì 401", async () => {
    for (const header of ["Basic abc", "Bearer", "Bearer abc.def.ghi"]) {
      const res = await request(app).get("/me/enrollments").set("Authorization", header);
      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
    }
  });

  it("token ký bằng khóa bí mật khác (sai chữ ký) thì 401", async () => {
    const res = await request(app).get("/me/enrollments").set("Authorization", "Bearer " + forgedTokenFor(2, "student"));
    expect(res.status).toBe(401);
    expect(res.body).toEqual(UNAUTHORIZED);
  });

  it("token đã hết hạn thì 401", async () => {
    const res = await request(app).get("/me/enrollments").set("Authorization", "Bearer " + expiredTokenFor(2, "student"));
    expect(res.status).toBe(401);
    expect(res.body).toEqual(UNAUTHORIZED);
  });

  it("token của học viên bị sửa payload thành admin (giữ chữ ký cũ) thì 401 và không tạo được khóa học", async () => {
    const res = await request(app)
      .post("/courses")
      .set("Authorization", "Bearer " + tamperedToAdmin(2))
      .send(NEW_COURSE);
    expect(res.status).toBe(401);
    expect(res.body).toEqual(UNAUTHORIZED);
    expect(await countCourses()).toBe(6);
  });

  it("token hợp lệ nhưng người dùng không còn trong cơ sở dữ liệu thì GET /auth/me trả 401", async () => {
    const res = await request(app).get("/auth/me").set("Authorization", "Bearer " + tokenFor(999, "student"));
    expect(res.status).toBe(401);
    expect(res.body).toEqual(UNAUTHORIZED);
  });
});

describe("authorize: route ghi của khóa học chỉ dành cho admin", () => {
  it("học viên tạo khóa học bị 403 FORBIDDEN và không có khóa học mới", async () => {
    const res = await request(app).post("/courses").set("Authorization", an).send(NEW_COURSE);
    expect(res.status).toBe(403);
    expect(res.body).toEqual(FORBIDDEN);
    expect(await countCourses()).toBe(6);
  });

  it("admin tạo khóa học được 201 và khóa học nằm trong cơ sở dữ liệu", async () => {
    const res = await request(app).post("/courses").set("Authorization", admin).send(NEW_COURSE);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 7, title: "Docker cơ bản", description: "", level: "beginner" });
    expect(await countCourses()).toBe(7);
  });

  it("cùng body rỗng: không token 401, học viên 403 (chưa tới validate), admin 400", async () => {
    const anonymous = await request(app).post("/courses").send({});
    const student = await request(app).post("/courses").set("Authorization", an).send({});
    const administrator = await request(app).post("/courses").set("Authorization", admin).send({});
    expect(anonymous.status).toBe(401);
    expect(student.status).toBe(403);
    expect(administrator.status).toBe(400);
    expect(administrator.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("học viên sửa (PUT, PATCH) hoặc xóa (DELETE) khóa học đều bị 403 và dữ liệu không đổi", async () => {
    const put = await request(app).put("/courses/6").set("Authorization", an).send({ title: "Đã bị sửa", level: "advanced" });
    const patch = await request(app).patch("/courses/6").set("Authorization", an).send({ title: "Đã bị sửa" });
    const del = await request(app).delete("/courses/6").set("Authorization", an);
    expect([put.status, patch.status, del.status]).toEqual([403, 403, 403]);
    const [rows] = await pool.query("SELECT title, level FROM courses WHERE id = 6");
    expect(rows).toEqual([{ title: "Cơ sở dữ liệu MySQL", level: "beginner" }]);
  });

  it("xem khóa học công khai: danh sách, chi tiết và bài học đều 200 khi không có token", async () => {
    const list = await request(app).get("/courses");
    const detail = await request(app).get("/courses/1");
    const lessons = await request(app).get("/courses/1/lessons");
    expect(list.status).toBe(200);
    expect(list.body.meta.total).toBe(6);
    expect(detail.status).toBe(200);
    expect(detail.body.title).toBe("HTML và CSS cơ bản");
    expect(lessons.status).toBe(200);
    expect(lessons.body).toHaveLength(2);
  });
});
