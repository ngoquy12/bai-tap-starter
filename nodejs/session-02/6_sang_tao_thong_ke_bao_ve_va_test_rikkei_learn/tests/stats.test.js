// Test tự chấm Bài 6 (phần 1): GET /stats. KHÔNG sửa tệp này.
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
const student = "Bearer " + tokenFor(2, "student");

// Gọi GET /stats bằng token admin, có thể kèm chuỗi query.
function getStats(query = "") {
  return request(app).get("/stats" + query).set("Authorization", admin);
}

describe("GET /stats: số liệu trên dữ liệu mẫu", () => {
  it("totals có 5 học viên, 6 khóa học, 10 ghi danh", async () => {
    const res = await getStats();
    expect(res.status).toBe(200);
    expect(res.body.totals).toEqual({ students: 5, courses: 6, enrollments: 10 });
  });

  it("averageProgress là 72.2, tính trên 9 ghi danh không phải dropped", async () => {
    const res = await getStats();
    expect(res.body.averageProgress).toBe(72.2);
  });

  it("byStatus có 5 active, 4 completed, 1 dropped", async () => {
    const res = await getStats();
    expect(res.body.byStatus).toEqual({ active: 5, completed: 4, dropped: 1 });
  });

  it("byLevel có 6 beginner, 3 intermediate, 0 advanced (không tính dropped)", async () => {
    const res = await getStats();
    expect(res.body.byLevel).toEqual({ beginner: 6, intermediate: 3, advanced: 0 });
  });

  it("perCourse có đủ 6 khóa theo courseId tăng, không tính ghi danh dropped", async () => {
    const res = await getStats();
    expect(res.body.perCourse).toEqual([
      { courseId: 1, title: "HTML và CSS cơ bản", studentCount: 1, avgProgress: 100 },
      { courseId: 2, title: "JavaScript cơ bản", studentCount: 3, avgProgress: 91.7 },
      { courseId: 3, title: "JavaScript nâng cao", studentCount: 1, avgProgress: 40 },
      { courseId: 4, title: "ReactJS", studentCount: 1, avgProgress: 60 },
      { courseId: 5, title: "NodeJS và Express", studentCount: 1, avgProgress: 25 },
      { courseId: 6, title: "Cơ sở dữ liệu MySQL", studentCount: 2, avgProgress: 75 },
    ]);
  });

  it("topCourses mặc định có 3 khóa: 2, 6, 1 (đồng hạng thì tiến độ cao hơn đứng trước)", async () => {
    const res = await getStats();
    expect(res.body.topCourses).toEqual([
      { courseId: 2, title: "JavaScript cơ bản", studentCount: 3 },
      { courseId: 6, title: "Cơ sở dữ liệu MySQL", studentCount: 2 },
      { courseId: 1, title: "HTML và CSS cơ bản", studentCount: 1 },
    ]);
  });
});

describe("GET /stats: phân quyền", () => {
  it("không gửi token thì 401 UNAUTHORIZED", async () => {
    const res = await request(app).get("/stats");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: { code: "UNAUTHORIZED", message: "Thiếu hoặc sai mã xác thực" } });
  });

  it("token sai chữ ký, hết hạn hoặc bị sửa vai trò thành admin đều 401", async () => {
    for (const token of [forgedTokenFor(1, "admin"), expiredTokenFor(1, "admin"), tamperedToAdmin(2)]) {
      const res = await request(app).get("/stats").set("Authorization", "Bearer " + token);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    }
  });

  it("học viên nhận 403 FORBIDDEN", async () => {
    const res = await request(app).get("/stats").set("Authorization", student);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      error: { code: "FORBIDDEN", message: "Bạn không có quyền thực hiện thao tác này" },
    });
  });

  it("kiểm tra danh tính và vai trò trước khi kiểm tra top: top sai vẫn trả 401 hoặc 403", async () => {
    const anonymous = await request(app).get("/stats?top=abc");
    expect(anonymous.status).toBe(401);
    const byStudent = await request(app).get("/stats?top=abc").set("Authorization", student);
    expect(byStudent.status).toBe(403);
  });
});

describe("GET /stats: tham số top", () => {
  it("top=2 và top=5 đổi độ dài bảng xếp hạng", async () => {
    const two = await getStats("?top=2");
    expect(two.body.topCourses.map((item) => item.courseId)).toEqual([2, 6]);
    const five = await getStats("?top=5");
    expect(five.body.topCourses.map((item) => item.courseId)).toEqual([2, 6, 1, 4, 3]);
  });

  it("top=10 chỉ trả các khóa có học viên (6 khóa trên dữ liệu mẫu)", async () => {
    const res = await getStats("?top=10");
    expect(res.status).toBe(200);
    expect(res.body.topCourses).toHaveLength(6);
  });

  it("top=0, 11, abc hoặc 2.5 trả 400 VALIDATION_ERROR kèm details về trường top", async () => {
    for (const top of ["0", "11", "abc", "2.5"]) {
      const res = await getStats("?top=" + top);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.error.message).toBe("Dữ liệu không hợp lệ");
      expect(res.body.error.details).toEqual([{ field: "top", message: "top phải từ 1 đến 10" }]);
    }
  });
});

describe("GET /stats: số liệu đổi theo dữ liệu", () => {
  it("khóa học mới chưa có học viên vẫn có mặt trong perCourse với 0 học viên, tiến độ 0 và không vào topCourses", async () => {
    await pool.query("INSERT INTO courses (title, description, level) VALUES ('Docker cơ bản', '', 'beginner')");
    const res = await getStats("?top=10");
    expect(res.body.totals.courses).toBe(7);
    expect(res.body.perCourse).toHaveLength(7);
    expect(res.body.perCourse[6]).toEqual({ courseId: 7, title: "Docker cơ bản", studentCount: 0, avgProgress: 0 });
    expect(res.body.topCourses.map((item) => item.courseId)).not.toContain(7);
  });

  it("học viên ghi danh khóa 5 qua API thì số liệu tăng đúng", async () => {
    const enroll = await request(app).post("/courses/5/enroll").set("Authorization", student);
    expect(enroll.status).toBe(201);
    const res = await getStats();
    expect(res.body.totals.enrollments).toBe(11);
    expect(res.body.byStatus).toEqual({ active: 6, completed: 4, dropped: 1 });
    expect(res.body.byLevel.intermediate).toBe(4);
    expect(res.body.perCourse[4]).toEqual({ courseId: 5, title: "NodeJS và Express", studentCount: 2, avgProgress: 12.5 });
    expect(res.body.averageProgress).toBe(65);
  });

  it("ghi danh chuyển sang dropped không còn tính vào học viên, tiến độ và cấp độ nhưng tính vào byStatus", async () => {
    await pool.query("UPDATE enrollments SET status = 'dropped' WHERE id = 6");
    const res = await getStats();
    expect(res.body.byStatus).toEqual({ active: 4, completed: 4, dropped: 2 });
    expect(res.body.byLevel.beginner).toBe(5);
    expect(res.body.perCourse[1]).toEqual({ courseId: 2, title: "JavaScript cơ bản", studentCount: 2, avgProgress: 100 });
    expect(res.body.averageProgress).toBe(71.9);
  });

  it("học viên cập nhật tiến độ lên 100 qua API thì khóa đó và số trạng thái đổi theo", async () => {
    const patch = await request(app)
      .patch("/enrollments/3/progress")
      .set("Authorization", student)
      .send({ progress: 100 });
    expect(patch.status).toBe(200);
    const res = await getStats();
    expect(res.body.byStatus).toEqual({ active: 4, completed: 5, dropped: 1 });
    expect(res.body.perCourse[3]).toEqual({ courseId: 4, title: "ReactJS", studentCount: 1, avgProgress: 100 });
    expect(res.body.averageProgress).toBe(76.7);
  });

  it("trạng thái không còn hàng nào vẫn có mặt trong byStatus với giá trị 0", async () => {
    await pool.query("UPDATE enrollments SET status = 'completed', progress = 100");
    const res = await getStats();
    expect(res.body.byStatus).toEqual({ active: 0, completed: 10, dropped: 0 });
    expect(res.body.totals.enrollments).toBe(10);
  });

  it("chưa có ghi danh nào thì mọi số liệu là 0 (không phải null) và topCourses rỗng", async () => {
    await pool.query("DELETE FROM enrollments");
    const res = await getStats();
    expect(res.status).toBe(200);
    expect(res.body.totals).toEqual({ students: 5, courses: 6, enrollments: 0 });
    expect(res.body.averageProgress).toBe(0);
    expect(res.body.byStatus).toEqual({ active: 0, completed: 0, dropped: 0 });
    expect(res.body.byLevel).toEqual({ beginner: 0, intermediate: 0, advanced: 0 });
    expect(res.body.perCourse).toHaveLength(6);
    for (const item of res.body.perCourse) {
      expect(item.studentCount).toBe(0);
      expect(item.avgProgress).toBe(0);
    }
    expect(res.body.topCourses).toEqual([]);
  });
});
