// Test tự chấm Bài 4: API /courses/:id/lessons trên MySQL của Rikkei Learn. KHÔNG sửa tệp này.
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/db/pool");
const { resetDatabase } = require("./helpers/db");

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

// Đếm số hàng của một bảng (kiểm tra trạng thái cơ sở dữ liệu sau thao tác).
async function countRows(table, where = "1 = 1", params = []) {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM ${table} WHERE ${where}`, params);
  return rows[0].total;
}

// Đọc thẳng một bài học từ MySQL.
async function readLesson(id) {
  const [rows] = await pool.query("SELECT id, course_id AS courseId, title, position FROM lessons WHERE id = ?", [id]);
  return rows[0] || null;
}

describe("GET /courses/:id/lessons", () => {
  it("trả mảng { id, title, position } theo thứ tự position, kể cả bài thêm sau với position nhỏ hơn", async () => {
    const res = await request(app).get("/courses/4/lessons");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 8, title: "Component và JSX", position: 1 },
      { id: 9, title: "Hooks", position: 2 },
      { id: 10, title: "React Router", position: 3 },
      { id: 11, title: "Gọi API", position: 4 },
    ]);
    await pool.query("INSERT INTO lessons (course_id, title, position) VALUES (5, 'Router', 5), (5, 'Lỗi', 3)");
    const course5 = await request(app).get("/courses/5/lessons");
    expect(course5.body.map((lesson) => lesson.position)).toEqual([1, 2, 3, 5]);
  });

  it("khóa chưa có bài học trả 200 và []; khóa không có trả 404; id sai trả 400", async () => {
    const [result] = await pool.query("INSERT INTO courses (title, level) VALUES ('Docker', 'beginner')");
    const empty = await request(app).get("/courses/" + result.insertId + "/lessons");
    expect(empty.status).toBe(200);
    expect(empty.body).toEqual([]);
    const missing = await request(app).get("/courses/999/lessons");
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy khóa học" } });
    const bad = await request(app).get("/courses/abc/lessons");
    expect(bad.status).toBe(400);
    expect(bad.body.error.details).toEqual([{ field: "id", message: "id phải là số" }]);
  });
});

describe("POST /courses/:id/lessons", () => {
  it("tạo bài học: 201, cắt khoảng trắng tiêu đề, ghi vào MySQL và lessonCount của khóa tăng 1", async () => {
    const res = await request(app).post("/courses/5/lessons").send({ title: "  Router  ", position: 3 });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 16, title: "Router", position: 3 });
    expect(await readLesson(16)).toEqual({ id: 16, courseId: 5, title: "Router", position: 3 });
    const course = await request(app).get("/courses/5");
    expect(course.body.lessonCount).toBe(3);
  });

  it("position trùng trong cùng khóa trả 409 CONFLICT và không thêm hàng; khóa khác dùng lại được số đó", async () => {
    const res = await request(app).post("/courses/5/lessons").send({ title: "Router", position: 2 });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: { code: "CONFLICT", message: "Vị trí bài học đã được dùng trong khóa học này" },
    });
    expect(await countRows("lessons")).toBe(15);
    const other = await request(app).post("/courses/6/lessons").send({ title: "Khóa chính", position: 3 });
    expect(other.status).toBe(201);
    expect(other.body.position).toBe(3);
  });

  it("dữ liệu sai bị 400 theo từng trường và không thêm hàng", async () => {
    const empty = await request(app).post("/courses/5/lessons").send({});
    expect(empty.status).toBe(400);
    expect(empty.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ",
        details: [
          { field: "title", message: "Tiêu đề bài học không được để trống" },
          { field: "position", message: "Vị trí là bắt buộc" },
        ],
      },
    });
    const cases = [
      [{ title: "     ", position: 3 }, "title", "Tiêu đề bài học không được để trống"],
      [{ title: "a".repeat(121), position: 3 }, "title", "Tiêu đề bài học tối đa 120 ký tự"],
      [{ title: 5, position: 3 }, "title", "Tiêu đề bài học phải là chuỗi"],
      [{ title: "Router", position: 0 }, "position", "Vị trí phải lớn hơn 0"],
      [{ title: "Router", position: -4 }, "position", "Vị trí phải lớn hơn 0"],
      [{ title: "Router", position: 1.5 }, "position", "Vị trí phải là số nguyên"],
      [{ title: "Router", position: "3" }, "position", "Vị trí phải là số"],
      [{ title: "Router", position: 99999999999 }, "position", "Vị trí tối đa là 1000"],
    ];
    for (const [body, field, message] of cases) {
      const res = await request(app).post("/courses/5/lessons").send(body);
      expect(res.status).toBe(400);
      expect(res.body.error.details).toEqual([{ field, message }]);
    }
    expect(await countRows("lessons")).toBe(15);
  });

  it("khóa không có trả 404, id khóa sai trả 400, JSON hỏng trả 400, đều không thêm hàng", async () => {
    const missing = await request(app).post("/courses/999/lessons").send({ title: "Router", position: 1 });
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy khóa học" } });
    const bad = await request(app).post("/courses/abc/lessons").send({ title: "Router", position: 1 });
    expect(bad.status).toBe(400);
    expect(bad.body.error.details).toEqual([{ field: "id", message: "id phải là số" }]);
    const broken = await request(app)
      .post("/courses/5/lessons")
      .set("Content-Type", "application/json")
      .send('{"title": "Router", "position": ');
    expect(broken.status).toBe(400);
    expect(broken.body).toEqual({ error: { code: "VALIDATION_ERROR", message: "JSON không hợp lệ" } });
    expect(await countRows("lessons")).toBe(15);
  });
});

describe("PATCH /courses/:id/lessons/:lessonId", () => {
  it("đổi riêng tiêu đề rồi riêng position, trường không gửi giữ nguyên", async () => {
    const title = await request(app).patch("/courses/4/lessons/9").send({ title: "  React Hooks  " });
    expect(title.status).toBe(200);
    expect(title.body).toEqual({ id: 9, title: "React Hooks", position: 2 });
    const position = await request(app).patch("/courses/4/lessons/9").send({ position: 10 });
    expect(position.status).toBe(200);
    expect(position.body).toEqual({ id: 9, title: "React Hooks", position: 10 });
    expect(await readLesson(9)).toEqual({ id: 9, courseId: 4, title: "React Hooks", position: 10 });
  });

  it("đổi sang position đang dùng trả 409 CONFLICT và bài học giữ nguyên; giữ nguyên position của chính nó vẫn là 200", async () => {
    const clash = await request(app).patch("/courses/4/lessons/9").send({ position: 3 });
    expect(clash.status).toBe(409);
    expect(clash.body).toEqual({
      error: { code: "CONFLICT", message: "Vị trí bài học đã được dùng trong khóa học này" },
    });
    expect((await readLesson(9)).position).toBe(2);
    const same = await request(app).patch("/courses/4/lessons/9").send({ position: 2 });
    expect(same.status).toBe(200);
  });

  it("body rỗng hoặc sai trả 400; lessonId không phải số trả 400; không đổi dữ liệu", async () => {
    const empty = await request(app).patch("/courses/4/lessons/9").send({});
    expect(empty.status).toBe(400);
    expect(empty.body.error.details).toEqual([{ field: "", message: "Cần gửi ít nhất một trường" }]);
    const badPosition = await request(app).patch("/courses/4/lessons/9").send({ position: 0 });
    expect(badPosition.status).toBe(400);
    expect(badPosition.body.error.details).toEqual([{ field: "position", message: "Vị trí phải lớn hơn 0" }]);
    const badId = await request(app).patch("/courses/4/lessons/abc").send({ title: "Hooks" });
    expect(badId.status).toBe(400);
    expect(badId.body.error.details).toEqual([{ field: "lessonId", message: "lessonId phải là số" }]);
    expect(await readLesson(9)).toEqual({ id: 9, courseId: 4, title: "Hooks", position: 2 });
  });

  it("bài học của khóa khác, bài học lạ và khóa lạ đều trả 404 và không đổi dữ liệu", async () => {
    const otherCourse = await request(app).patch("/courses/2/lessons/9").send({ title: "Đổi trộm" });
    expect(otherCourse.status).toBe(404);
    expect(otherCourse.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy bài học" } });
    const missingLesson = await request(app).patch("/courses/4/lessons/999").send({ title: "Không có" });
    expect(missingLesson.status).toBe(404);
    expect(missingLesson.body.error.message).toBe("Không tìm thấy bài học");
    const missingCourse = await request(app).patch("/courses/999/lessons/9").send({ title: "Không có" });
    expect(missingCourse.status).toBe(404);
    expect(missingCourse.body.error.message).toBe("Không tìm thấy khóa học");
    expect((await readLesson(9)).title).toBe("Hooks");
  });
});

describe("DELETE /courses/:id/lessons/:lessonId", () => {
  it("xóa bài học: 204 không thân, hàng mất khỏi MySQL, các bài khác và lessonCount còn đúng", async () => {
    const res = await request(app).delete("/courses/4/lessons/10");
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect(await readLesson(10)).toBeNull();
    expect(await countRows("lessons")).toBe(14);
    const course = await request(app).get("/courses/4");
    expect(course.body.lessonCount).toBe(3);
    const lessons = await request(app).get("/courses/4/lessons");
    expect(lessons.body.map((lesson) => lesson.position)).toEqual([1, 2, 4]);
  });

  it("bài học của khóa khác, bài học lạ, khóa lạ trả 404; id sai trả 400; không mất bài nào", async () => {
    const otherCourse = await request(app).delete("/courses/2/lessons/9");
    expect(otherCourse.status).toBe(404);
    expect(otherCourse.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy bài học" } });
    const missingLesson = await request(app).delete("/courses/4/lessons/999");
    expect(missingLesson.status).toBe(404);
    const missingCourse = await request(app).delete("/courses/999/lessons/9");
    expect(missingCourse.status).toBe(404);
    expect(missingCourse.body.error.message).toBe("Không tìm thấy khóa học");
    const bad = await request(app).delete("/courses/4/lessons/0");
    expect(bad.status).toBe(400);
    expect(bad.body.error.details).toEqual([{ field: "lessonId", message: "lessonId phải lớn hơn 0" }]);
    expect(await countRows("lessons")).toBe(15);
  });
});
