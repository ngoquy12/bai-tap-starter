// Test tự chấm Bài 5 (phần 3): ghi danh, tiến độ, rút khỏi khóa và danh sách của quản trị viên. KHÔNG sửa tệp này.
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

const admin = "Bearer " + tokenFor(1, "admin");
const an = "Bearer " + tokenFor(2, "student");
const binh = "Bearer " + tokenFor(3, "student");
const chi = "Bearer " + tokenFor(4, "student");
const FORBIDDEN = { error: { code: "FORBIDDEN", message: "Bạn không có quyền thực hiện thao tác này" } };

// Đọc thẳng hàng ghi danh trong MySQL để kiểm tra dữ liệu thật sự đã đổi (hoặc không đổi).
async function enrollmentRow(id) {
  const [rows] = await pool.query("SELECT user_id, course_id, status, progress FROM enrollments WHERE id = ?", [id]);
  return rows[0];
}

async function countEnrollments() {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM enrollments");
  return rows[0].total;
}

describe("Ghi danh vào khóa học", () => {
  it("học viên ghi danh khóa 5: 201, học viên lấy từ token (userId trong body bị bỏ qua), hàng được ghi vào MySQL", async () => {
    const res = await request(app).post("/courses/5/enroll").set("Authorization", an).send({ userId: 3 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 11,
      userId: 2,
      courseId: 5,
      courseTitle: "NodeJS và Express",
      status: "active",
      progress: 0,
    });
    expect(await enrollmentRow(11)).toEqual({ user_id: 2, course_id: 5, status: "active", progress: 0 });
  });

  it("ghi danh khóa đã ghi danh trả 409 CONFLICT và không thêm hàng", async () => {
    const res = await request(app).post("/courses/2/enroll").set("Authorization", an);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: { code: "CONFLICT", message: "Học viên đã ghi danh khóa học này" } });
    expect(await countEnrollments()).toBe(10);
  });

  it("khóa học không tồn tại trả 404 NOT_FOUND; id không phải số trả 400 VALIDATION_ERROR", async () => {
    const missing = await request(app).post("/courses/999/enroll").set("Authorization", an);
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy khóa học" } });
    const invalid = await request(app).post("/courses/abc/enroll").set("Authorization", an);
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("khóa học chưa có bài học trả 409 và không thêm hàng", async () => {
    const created = await request(app).post("/courses").set("Authorization", admin).send({ title: "Khóa trống", level: "beginner" });
    expect(created.status).toBe(201);
    const res = await request(app).post("/courses/" + created.body.id + "/enroll").set("Authorization", an);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: { code: "CONFLICT", message: "Khóa học chưa có bài học" } });
    expect(await countEnrollments()).toBe(10);
  });

  it("hai yêu cầu ghi danh đồng thời cùng một khóa: đúng một yêu cầu 201, một yêu cầu 409, MySQL chỉ có một hàng", async () => {
    const results = await Promise.all([
      request(app).post("/courses/5/enroll").set("Authorization", an),
      request(app).post("/courses/5/enroll").set("Authorization", an),
    ]);
    expect(results.map((res) => res.status).sort()).toEqual([201, 409]);
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM enrollments WHERE user_id = 2 AND course_id = 5");
    expect(rows[0].total).toBe(1);
  });

  it("admin không được ghi danh (chỉ student): 403, không token: 401", async () => {
    const asAdmin = await request(app).post("/courses/5/enroll").set("Authorization", admin);
    expect(asAdmin.status).toBe(403);
    expect(asAdmin.body).toEqual(FORBIDDEN);
    const anonymous = await request(app).post("/courses/5/enroll");
    expect(anonymous.status).toBe(401);
    expect(await countEnrollments()).toBe(10);
  });
});

describe("Rút khỏi khóa học và ghi danh lại", () => {
  it("chủ ghi danh rút khỏi khóa: 204 không thân, hàng vẫn còn với status dropped và tiến độ giữ nguyên", async () => {
    const res = await request(app).delete("/enrollments/3").set("Authorization", an);
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect(await enrollmentRow(3)).toEqual({ user_id: 2, course_id: 4, status: "dropped", progress: 60 });
  });

  it("rút khỏi khóa rồi ghi danh lại: 201, vẫn là ghi danh cũ, status active, tiến độ cũ, MySQL không thêm hàng", async () => {
    await request(app).delete("/enrollments/3").set("Authorization", an);
    const res = await request(app).post("/courses/4/enroll").set("Authorization", an);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 3, userId: 2, courseId: 4, status: "active", progress: 60 });
    expect(await countEnrollments()).toBe(10);
  });

  it("người khác rút hộ ghi danh thì 403 và ghi danh không đổi", async () => {
    const res = await request(app).delete("/enrollments/3").set("Authorization", binh);
    expect(res.status).toBe(403);
    expect(res.body).toEqual(FORBIDDEN);
    expect(await enrollmentRow(3)).toEqual({ user_id: 2, course_id: 4, status: "active", progress: 60 });
  });

  it("không rút được: ghi danh không có 404, đã rút rồi 409, khóa đã hoàn thành 409", async () => {
    const missing = await request(app).delete("/enrollments/999").set("Authorization", an);
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy ghi danh" } });
    const dropped = await request(app).delete("/enrollments/7").set("Authorization", chi);
    expect(dropped.status).toBe(409);
    expect(dropped.body).toEqual({ error: { code: "CONFLICT", message: "Ghi danh đã bị hủy trước đó" } });
    const completed = await request(app).delete("/enrollments/1").set("Authorization", an);
    expect(completed.status).toBe(409);
    expect(completed.body).toEqual({ error: { code: "CONFLICT", message: "Khóa học đã hoàn thành, không thể rút" } });
  });
});

describe("Ghi danh của tôi", () => {
  it("GET /me/enrollments trả đúng ghi danh của người gọi theo id tăng, mỗi mục đủ trường; không token 401", async () => {
    const res = await request(app).get("/me/enrollments").set("Authorization", an);
    expect(res.status).toBe(200);
    expect(res.body.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(res.body[2]).toMatchObject({
      id: 3,
      userId: 2,
      courseId: 4,
      courseTitle: "ReactJS",
      status: "active",
      progress: 60,
    });
    expect(typeof res.body[2].enrolledAt).toBe("string");
    expect((await request(app).get("/me/enrollments")).status).toBe(401);
  });

  it("học viên không thấy ghi danh của người khác; admin chưa ghi danh gì thì mảng rỗng", async () => {
    const res = await request(app).get("/me/enrollments").set("Authorization", binh);
    expect(res.body.map((item) => item.id)).toEqual([4, 5]);
    expect(res.body.every((item) => item.userId === 3)).toBe(true);
    const empty = await request(app).get("/me/enrollments").set("Authorization", admin);
    expect(empty.status).toBe(200);
    expect(empty.body).toEqual([]);
  });
});

describe("Cập nhật tiến độ học", () => {
  it("chủ ghi danh cập nhật 80 thì vẫn active, cập nhật 100 thì completed; MySQL đổi theo", async () => {
    const first = await request(app).patch("/enrollments/3/progress").set("Authorization", an).send({ progress: 80 });
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({ id: 3, userId: 2, status: "active", progress: 80 });
    expect(await enrollmentRow(3)).toMatchObject({ status: "active", progress: 80 });
    const second = await request(app).patch("/enrollments/3/progress").set("Authorization", an).send({ progress: 100 });
    expect(second.status).toBe(200);
    expect(second.body).toMatchObject({ status: "completed", progress: 100 });
    expect(await enrollmentRow(3)).toMatchObject({ status: "completed", progress: 100 });
  });

  it("học viên sửa tiến độ ghi danh của người khác bị 403 và tiến độ không đổi; admin sửa hộ được 200", async () => {
    const res = await request(app).patch("/enrollments/3/progress").set("Authorization", binh).send({ progress: 90 });
    expect(res.status).toBe(403);
    expect(res.body).toEqual(FORBIDDEN);
    expect(await enrollmentRow(3)).toMatchObject({ progress: 60 });
    const byAdmin = await request(app).patch("/enrollments/3/progress").set("Authorization", admin).send({ progress: 90 });
    expect(byAdmin.status).toBe(200);
    expect(await enrollmentRow(3)).toMatchObject({ progress: 90 });
  });

  it("tiến độ không phải số nguyên từ 0 đến 100 trả 400 và không ghi gì vào MySQL", async () => {
    for (const progress of [150, -1, 80.5, "80", null]) {
      const res = await request(app).patch("/enrollments/3/progress").set("Authorization", an).send({ progress });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.error.details).toEqual([{ field: "progress", message: "Tiến độ phải là số nguyên từ 0 đến 100" }]);
    }
    const empty = await request(app).patch("/enrollments/3/progress").set("Authorization", an).send({});
    expect(empty.status).toBe(400);
    expect(await enrollmentRow(3)).toMatchObject({ status: "active", progress: 60 });
  });

  it("kiểm tra dữ liệu chạy trước quyền sở hữu: người khác gửi tiến độ sai nhận 400, gửi tiến độ đúng nhận 403", async () => {
    const invalid = await request(app).patch("/enrollments/3/progress").set("Authorization", binh).send({ progress: 150 });
    expect(invalid.status).toBe(400);
    const valid = await request(app).patch("/enrollments/3/progress").set("Authorization", binh).send({ progress: 70 });
    expect(valid.status).toBe(403);
  });

  it("tiến độ giảm trả 409 CONFLICT và giữ nguyên giá trị cũ", async () => {
    const res = await request(app).patch("/enrollments/3/progress").set("Authorization", an).send({ progress: 50 });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: { code: "CONFLICT", message: "Tiến độ không được giảm" } });
    expect(await enrollmentRow(3)).toMatchObject({ progress: 60 });
  });

  it("ghi danh không có trả 404; ghi danh đã rút (dropped) trả 409; không token 401", async () => {
    const missing = await request(app).patch("/enrollments/999/progress").set("Authorization", an).send({ progress: 50 });
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy ghi danh" } });
    const dropped = await request(app).patch("/enrollments/7/progress").set("Authorization", chi).send({ progress: 50 });
    expect(dropped.status).toBe(409);
    expect(dropped.body).toEqual({
      error: { code: "CONFLICT", message: "Ghi danh đã bị hủy, không thể cập nhật tiến độ" },
    });
    const anonymous = await request(app).patch("/enrollments/3/progress").send({ progress: 70 });
    expect(anonymous.status).toBe(401);
  });
});

describe("Quản trị viên xem danh sách ghi danh", () => {
  it("GET /enrollments trả { data, meta } mặc định trang 1, limit 5, ghi danh theo id tăng", async () => {
    const res = await request(app).get("/enrollments").set("Authorization", admin);
    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 1, limit: 5, total: 10, totalPages: 2 });
    expect(res.body.data.map((item) => item.id)).toEqual([1, 2, 3, 4, 5]);
    expect(res.body.data[0]).toMatchObject({
      id: 1,
      userId: 2,
      studentName: "Nguyễn Văn An",
      courseId: 1,
      courseTitle: "HTML và CSS cơ bản",
      status: "completed",
      progress: 100,
    });
  });

  it("lọc theo courseId, theo status và kết hợp cả hai; meta.total tính theo bộ lọc", async () => {
    const byCourse = await request(app).get("/enrollments?courseId=2").set("Authorization", admin);
    expect(byCourse.body.data.map((item) => item.id)).toEqual([2, 4, 6]);
    expect(byCourse.body.meta).toEqual({ page: 1, limit: 5, total: 3, totalPages: 1 });
    const byStatus = await request(app).get("/enrollments?status=dropped").set("Authorization", admin);
    expect(byStatus.body.data.map((item) => item.id)).toEqual([7]);
    const both = await request(app).get("/enrollments?courseId=4&status=active").set("Authorization", admin);
    expect(both.body.data.map((item) => item.id)).toEqual([3]);
    const none = await request(app).get("/enrollments?courseId=1&status=dropped").set("Authorization", admin);
    expect(none.body.data).toEqual([]);
    expect(none.body.meta).toEqual({ page: 1, limit: 5, total: 0, totalPages: 0 });
  });

  it("phân trang: page=2&limit=4 trả ghi danh 5 đến 8; trang vượt quá trả mảng rỗng nhưng total vẫn đúng", async () => {
    const page2 = await request(app).get("/enrollments?page=2&limit=4").set("Authorization", admin);
    expect(page2.body.data.map((item) => item.id)).toEqual([5, 6, 7, 8]);
    expect(page2.body.meta).toEqual({ page: 2, limit: 4, total: 10, totalPages: 3 });
    const beyond = await request(app).get("/enrollments?page=9").set("Authorization", admin);
    expect(beyond.status).toBe(200);
    expect(beyond.body.data).toEqual([]);
    expect(beyond.body.meta.total).toBe(10);
  });

  it("query sai trả 400 VALIDATION_ERROR theo từng tham số: status, limit, page, courseId", async () => {
    const cases = [
      ["status=abc", "status", "status chỉ nhận active, completed hoặc dropped"],
      ["limit=0", "limit", "limit phải là số nguyên từ 1 đến 50"],
      ["limit=51", "limit", "limit phải là số nguyên từ 1 đến 50"],
      ["page=0", "page", "page phải là số nguyên từ 1 trở lên"],
      ["courseId=abc", "courseId", "courseId phải là số nguyên dương"],
    ];
    for (const [query, field, message] of cases) {
      const res = await request(app).get("/enrollments?" + query).set("Authorization", admin);
      expect(res.status).toBe(400);
      expect(res.body.error.details).toEqual([{ field, message }]);
    }
  });

  it("chỉ admin được xem: học viên 403, không token 401 (học viên không thấy ghi danh của người khác)", async () => {
    const student = await request(app).get("/enrollments").set("Authorization", an);
    expect(student.status).toBe(403);
    expect(student.body).toEqual(FORBIDDEN);
    const anonymous = await request(app).get("/enrollments");
    expect(anonymous.status).toBe(401);
  });
});
