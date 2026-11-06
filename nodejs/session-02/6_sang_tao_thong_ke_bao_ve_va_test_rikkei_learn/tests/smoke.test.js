// Test tự chấm Bài 6 (phần 4): chạy lại các luồng chính của Bài 4 và Bài 5 trên ứng dụng hoàn chỉnh. KHÔNG sửa tệp này.
// Tệp này gọi POST /auth/login đúng 1 lần (giới hạn là 5 lần mỗi tệp test).
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

describe("Luồng chính còn nguyên sau khi thêm lớp bảo vệ", () => {
  it("đăng nhập, xem /auth/me rồi ghi danh bằng chính token vừa nhận", async () => {
    const login = await request(app).post("/auth/login").send({ email: "dung@rikkei.edu", password: "Matkhau123" });
    expect(login.status).toBe(200);
    const header = "Bearer " + login.body.token;
    const me = await request(app).get("/auth/me").set("Authorization", header);
    expect(me.body).toEqual({ id: 5, email: "dung@rikkei.edu", fullName: "Phạm Quốc Dũng", role: "student" });
    const enroll = await request(app).post("/courses/4/enroll").set("Authorization", header);
    expect(enroll.status).toBe(201);
    expect(enroll.body).toMatchObject({ userId: 5, courseId: 4, status: "active", progress: 0 });
  });

  it("học viên không tạo được khóa học (403), admin tạo được (201)", async () => {
    const body = { title: "Docker cơ bản", level: "beginner" };
    const byStudent = await request(app).post("/courses").set("Authorization", "Bearer " + tokenFor(2, "student")).send(body);
    expect(byStudent.status).toBe(403);
    const byAdmin = await request(app).post("/courses").set("Authorization", "Bearer " + tokenFor(1, "admin")).send(body);
    expect(byAdmin.status).toBe(201);
    expect(byAdmin.body.id).toBe(7);
  });

  it("danh sách phân trang, tham số sai và xóa khóa đã có ghi danh vẫn đúng như Bài 4", async () => {
    const list = await request(app).get("/courses?level=beginner&sort=title");
    expect(list.body.data.map((course) => course.id)).toEqual([6, 1, 2]);
    expect(list.body.meta).toEqual({ page: 1, limit: 5, total: 3, totalPages: 1 });
    expect((await request(app).get("/courses?sort=price")).status).toBe(400);
    const blocked = await request(app).delete("/courses/1").set("Authorization", "Bearer " + tokenFor(1, "admin"));
    expect(blocked.status).toBe(409);
    expect(blocked.body.error.message).toBe("Khóa học đã có học viên ghi danh, không thể xóa");
  });
});
