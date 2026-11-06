// Test tự chấm Bài 4: API /courses trên MySQL của Rikkei Learn. KHÔNG sửa tệp này.
const express = require("express");
const request = require("supertest");
const { ZodError } = require("zod");
const app = require("../src/app");
const errorHandler = require("../src/middlewares/errorHandler");
const pool = require("../src/db/pool");
const { resetDatabase } = require("./helpers/db");

beforeEach(async () => {
  await resetDatabase();
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  await pool.end();
});

// Đếm số hàng của một bảng (kiểm tra trạng thái cơ sở dữ liệu sau thao tác).
async function countRows(table, where = "1 = 1", params = []) {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM ${table} WHERE ${where}`, params);
  return rows[0].total;
}

// Thêm thẳng vào MySQL một khóa học chưa có bài học nào (id 7).
async function insertEmptyCourse() {
  const [result] = await pool.query("INSERT INTO courses (title, level) VALUES ('Docker', 'beginner')");
  return result.insertId;
}

// Dựng ứng dụng nhỏ chỉ để ném một lỗi cho errorHandler của bạn xử lý.
function appThrowing(error) {
  const mini = express();
  mini.get("/boom", (req, res, next) => next(error));
  mini.use(errorHandler);
  return mini;
}

const ids = (res) => res.body.data.map((course) => course.id);

describe("Nền tảng ứng dụng", () => {
  it("GET /health trả 200 và { status: 'ok' }", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("đường dẫn lạ trả 404 JSON chuẩn", async () => {
    const res = await request(app).get("/khong-co-duong-dan-nay");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy đường dẫn" } });
  });
});

describe("GET /courses: phân trang và lessonCount", () => {
  it("mặc định trả trang 1 gồm 5 khóa, đúng năm trường và meta { page: 1, limit: 5, total: 6, totalPages: 2 }", async () => {
    const res = await request(app).get("/courses");
    expect(res.status).toBe(200);
    expect(ids(res)).toEqual([1, 2, 3, 4, 5]);
    expect(res.body.meta).toEqual({ page: 1, limit: 5, total: 6, totalPages: 2 });
    expect(res.body.data[3]).toEqual({
      id: 4,
      title: "ReactJS",
      description: "Xây giao diện bằng component.",
      level: "intermediate",
      lessonCount: 4,
    });
    expect(res.body.data.map((course) => course.lessonCount)).toEqual([2, 3, 2, 4, 2]);
  });

  it("page=2 trả khóa 6 còn limit=2&page=2 trả khóa 3 và 4 với totalPages 3", async () => {
    const second = await request(app).get("/courses?page=2");
    expect(ids(second)).toEqual([6]);
    expect(second.body.meta).toEqual({ page: 2, limit: 5, total: 6, totalPages: 2 });
    const small = await request(app).get("/courses?limit=2&page=2");
    expect(ids(small)).toEqual([3, 4]);
    expect(small.body.meta).toEqual({ page: 2, limit: 2, total: 6, totalPages: 3 });
  });

  it("trang vượt quá tổng vẫn là 200 với data rỗng và total không đổi", async () => {
    const res = await request(app).get("/courses?page=9");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta).toEqual({ page: 9, limit: 5, total: 6, totalPages: 2 });
  });

  it("khóa chưa có bài học vẫn nằm trong danh sách với lessonCount 0 (LEFT JOIN)", async () => {
    const emptyId = await insertEmptyCourse();
    const res = await request(app).get("/courses?limit=50");
    expect(res.body.meta.total).toBe(7);
    const found = res.body.data.find((course) => course.id === emptyId);
    expect(found).toEqual({ id: 7, title: "Docker", description: "", level: "beginner", lessonCount: 0 });
  });
});

describe("GET /courses: lọc và tìm kiếm", () => {
  it("level=beginner trả khóa 1, 2, 6 và total theo bộ lọc; kết hợp limit=2&page=2 chỉ còn khóa 6", async () => {
    const all = await request(app).get("/courses?level=beginner");
    expect(ids(all)).toEqual([1, 2, 6]);
    expect(all.body.meta).toEqual({ page: 1, limit: 5, total: 3, totalPages: 1 });
    const paged = await request(app).get("/courses?level=beginner&limit=2&page=2");
    expect(ids(paged)).toEqual([6]);
    expect(paged.body.meta).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
  });

  it("q tìm theo tiêu đề không phân biệt hoa thường, bỏ khoảng trắng hai đầu, kết hợp được với level", async () => {
    const js = await request(app).get("/courses?q=javascript");
    expect(ids(js)).toEqual([2, 3]);
    expect(js.body.meta.total).toBe(2);
    const spaced = await request(app).get("/courses?q=%20REACT%20");
    expect(ids(spaced)).toEqual([4]);
    const combined = await request(app).get("/courses?q=script&level=intermediate");
    expect(ids(combined)).toEqual([3]);
    expect(combined.body.meta.total).toBe(1);
  });

  it("q chứa dấu nháy và lệnh SQL chỉ là chữ: 200, data rỗng, total 0", async () => {
    const res = await request(app).get("/courses").query({ q: "' OR 1=1 OR '" });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  it("hasLessons=true bỏ khóa chưa có bài học, hasLessons=false chỉ giữ khóa đó, total khớp bộ lọc", async () => {
    const emptyId = await insertEmptyCourse();
    const withLessons = await request(app).get("/courses?hasLessons=true&limit=50");
    expect(ids(withLessons)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(withLessons.body.meta.total).toBe(6);
    const without = await request(app).get("/courses?hasLessons=false");
    expect(ids(without)).toEqual([emptyId]);
    expect(without.body.data[0].lessonCount).toBe(0);
    expect(without.body.meta).toEqual({ page: 1, limit: 5, total: 1, totalPages: 1 });
  });
});

describe("GET /courses: sắp xếp theo danh sách trắng", () => {
  it("sort=title, sort=level (giảm dần) và sort=createdAt (giảm dần) đúng thứ tự, đồng hạng xếp theo id", async () => {
    const byTitle = await request(app).get("/courses?sort=title&limit=50");
    expect(ids(byTitle)).toEqual([6, 1, 2, 3, 5, 4]);
    const byLevel = await request(app).get("/courses?sort=level&order=desc&limit=50");
    expect(ids(byLevel)).toEqual([3, 4, 5, 1, 2, 6]);
    const byDate = await request(app).get("/courses?sort=createdAt&order=desc&limit=50");
    expect(ids(byDate)).toEqual([6, 5, 4, 3, 2, 1]);
  });

  it("sort=lessonCount&order=desc đưa khóa nhiều bài nhất lên đầu, đồng hạng xếp theo id", async () => {
    const res = await request(app).get("/courses?sort=lessonCount&order=desc&limit=50");
    expect(ids(res)).toEqual([4, 2, 1, 3, 5, 6]);
    expect(res.body.data.map((course) => course.lessonCount)).toEqual([4, 3, 2, 2, 2, 2]);
  });

  it("sort chứa lệnh SQL hoặc cột ngoài danh sách bị từ chối 400 và bảng courses còn nguyên", async () => {
    const attempts = ["title;DROP TABLE courses", "RAND()", "id", "description"];
    for (const sort of attempts) {
      const res = await request(app).get("/courses").query({ sort });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.error.details).toEqual([
        { field: "sort", message: "sort chỉ nhận title, level, createdAt hoặc lessonCount" },
      ]);
    }
    const order = await request(app).get("/courses").query({ order: "asc;--" });
    expect(order.status).toBe(400);
    expect(order.body.error.details).toEqual([{ field: "order", message: "order chỉ nhận asc hoặc desc" }]);
    expect(await countRows("courses")).toBe(6);
  });
});

describe("GET /courses: tham số sai", () => {
  it("page=0&limit=51&level=expert trả 400 với details theo thứ tự page, limit, level", async () => {
    const res = await request(app).get("/courses?page=0&limit=51&level=expert");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ",
        details: [
          { field: "page", message: "page tối thiểu là 1" },
          { field: "limit", message: "limit tối đa là 50" },
          { field: "level", message: "Cấp độ phải là beginner, intermediate hoặc advanced" },
        ],
      },
    });
  });

  it("page, limit, q, hasLessons sai kiểu hoặc ngoài biên đều bị 400", async () => {
    const cases = [
      ["page=abc", "page", "page phải là số"],
      ["page=1.5", "page", "page phải là số nguyên"],
      ["limit=0", "limit", "limit tối thiểu là 1"],
      ["limit=-3", "limit", "limit tối thiểu là 1"],
      ["q=%20%20%20", "q", "q không được để trống"],
      ["hasLessons=yes", "hasLessons", "hasLessons chỉ nhận true hoặc false"],
    ];
    for (const [query, field, message] of cases) {
      const res = await request(app).get("/courses?" + query);
      expect(res.status).toBe(400);
      expect(res.body.error.details).toEqual([{ field, message }]);
    }
  });
});

describe("GET /courses/:id", () => {
  it("trả khóa học kèm lessonCount", async () => {
    const res = await request(app).get("/courses/5");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 5,
      title: "NodeJS và Express",
      description: "Viết API với Express và MySQL.",
      level: "intermediate",
      lessonCount: 2,
    });
  });

  it("khóa học không có trả 404 NOT_FOUND", async () => {
    const res = await request(app).get("/courses/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy khóa học" } });
  });

  it("id không phải số nguyên dương trả 400 với message của trường id", async () => {
    const cases = [
      ["abc", "id phải là số"],
      ["1.5", "id phải là số nguyên"],
      ["0", "id phải lớn hơn 0"],
      ["-2", "id phải lớn hơn 0"],
    ];
    for (const [value, message] of cases) {
      const res = await request(app).get("/courses/" + value);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.error.details).toEqual([{ field: "id", message }]);
    }
  });
});

describe("POST /courses", () => {
  it("tạo khóa hợp lệ: 201, cắt khoảng trắng, description mặc định rỗng, lessonCount 0, ghi vào MySQL", async () => {
    const res = await request(app).post("/courses").send({ title: "  Docker cơ bản  ", level: "beginner" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 7, title: "Docker cơ bản", description: "", level: "beginner", lessonCount: 0 });
    expect(await countRows("courses")).toBe(7);
    const get = await request(app).get("/courses/7");
    expect(get.body.title).toBe("Docker cơ bản");
  });

  it("bỏ qua trường lạ như id và lessonCount", async () => {
    const res = await request(app)
      .post("/courses")
      .send({ id: 99, lessonCount: 50, title: "Git", description: "Quản lý mã nguồn.", level: "advanced" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 7, title: "Git", description: "Quản lý mã nguồn.", level: "advanced", lessonCount: 0 });
    expect(await countRows("courses", "id = 99")).toBe(0);
  });

  it("body rỗng trả 400 với details cho title và level, không thêm hàng nào", async () => {
    const res = await request(app).post("/courses").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ",
        details: [
          { field: "title", message: "Tiêu đề không được để trống" },
          { field: "level", message: "Cấp độ phải là beginner, intermediate hoặc advanced" },
        ],
      },
    });
    expect(await countRows("courses")).toBe(6);
  });

  it("tiêu đề toàn dấu cách bị từ chối 400 và không thêm hàng", async () => {
    const res = await request(app).post("/courses").send({ title: "     ", level: "beginner" });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([{ field: "title", message: "Tiêu đề không được để trống" }]);
    expect(await countRows("courses")).toBe(6);
  });

  it("kiểu sai và độ dài vượt giới hạn bị 400 theo từng trường", async () => {
    const cases = [
      [{ title: 123, level: "beginner" }, "title", "Tiêu đề phải là chuỗi"],
      [{ title: "a".repeat(121), level: "beginner" }, "title", "Tiêu đề tối đa 120 ký tự"],
      [{ title: "Git", description: "b".repeat(501), level: "beginner" }, "description", "Mô tả tối đa 500 ký tự"],
      [{ title: "Git", description: 7, level: "beginner" }, "description", "Mô tả phải là chuỗi"],
      [{ title: "Git", level: "expert" }, "level", "Cấp độ phải là beginner, intermediate hoặc advanced"],
    ];
    for (const [body, field, message] of cases) {
      const res = await request(app).post("/courses").send(body);
      expect(res.status).toBe(400);
      expect(res.body.error.details).toEqual([{ field, message }]);
    }
    expect(await countRows("courses")).toBe(6);
  });

  it("JSON sai cú pháp trả 400 VALIDATION_ERROR với message 'JSON không hợp lệ'", async () => {
    const res = await request(app).post("/courses").set("Content-Type", "application/json").send('{"title": "Git",');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: { code: "VALIDATION_ERROR", message: "JSON không hợp lệ" } });
  });
});

describe("PATCH /courses/:id", () => {
  it("chỉ đổi trường được gửi, các trường khác và lessonCount giữ nguyên", async () => {
    const res = await request(app).patch("/courses/2").send({ title: "  JS căn bản  " });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 2,
      title: "JS căn bản",
      description: "Biến, hàm, mảng, đối tượng.",
      level: "beginner",
      lessonCount: 3,
    });
    const [rows] = await pool.query("SELECT title, description, level FROM courses WHERE id = 2");
    expect(rows[0]).toEqual({ title: "JS căn bản", description: "Biến, hàm, mảng, đối tượng.", level: "beginner" });
  });

  it("body rỗng, chỉ có trường lạ hoặc dữ liệu sai trả 400 và không đổi dữ liệu", async () => {
    const empty = await request(app).patch("/courses/2").send({});
    expect(empty.status).toBe(400);
    expect(empty.body.error.details).toEqual([{ field: "", message: "Cần gửi ít nhất một trường" }]);
    const unknown = await request(app).patch("/courses/2").send({ foo: 1 });
    expect(unknown.status).toBe(400);
    expect(unknown.body.error.details).toEqual([{ field: "", message: "Cần gửi ít nhất một trường" }]);
    const badLevel = await request(app).patch("/courses/2").send({ level: "expert" });
    expect(badLevel.status).toBe(400);
    expect(badLevel.body.error.details).toEqual([
      { field: "level", message: "Cấp độ phải là beginner, intermediate hoặc advanced" },
    ]);
    const [rows] = await pool.query("SELECT title, level FROM courses WHERE id = 2");
    expect(rows[0]).toEqual({ title: "JavaScript cơ bản", level: "beginner" });
  });

  it("khóa học không có trả 404 NOT_FOUND", async () => {
    const res = await request(app).patch("/courses/999").send({ title: "Không có" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy khóa học" } });
  });
});

describe("DELETE /courses/:id", () => {
  it("xóa khóa chưa ghi danh: 204 không thân, bài học của khóa bị xóa theo", async () => {
    const created = await request(app).post("/courses").send({ title: "Docker", level: "beginner" });
    const courseId = created.body.id;
    await pool.query("INSERT INTO lessons (course_id, title, position) VALUES (?, 'Cài đặt', 1), (?, 'Container', 2)", [
      courseId,
      courseId,
    ]);
    expect(await countRows("lessons")).toBe(17);
    const res = await request(app).delete("/courses/" + courseId);
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect(await countRows("courses", "id = ?", [courseId])).toBe(0);
    expect(await countRows("lessons", "course_id = ?", [courseId])).toBe(0);
    expect(await countRows("lessons")).toBe(15);
    const again = await request(app).get("/courses/" + courseId);
    expect(again.status).toBe(404);
  });

  it("khóa đã có ghi danh trả 409 CONFLICT, khóa và bài học của nó còn nguyên", async () => {
    const res = await request(app).delete("/courses/1");
    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: { code: "CONFLICT", message: "Khóa học đã có học viên ghi danh, không thể xóa" },
    });
    expect(await countRows("courses", "id = 1")).toBe(1);
    expect(await countRows("lessons", "course_id = 1")).toBe(2);
    expect(await countRows("enrollments")).toBe(10);
  });

  it("khóa không có trả 404; id không phải số trả 400", async () => {
    const missing = await request(app).delete("/courses/999");
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy khóa học" } });
    const bad = await request(app).delete("/courses/abc");
    expect(bad.status).toBe(400);
    expect(bad.body.error.details).toEqual([{ field: "id", message: "id phải là số" }]);
    expect(await countRows("courses")).toBe(6);
  });
});

describe("errorHandler tập trung", () => {
  it("đổi lỗi MySQL thành mã trạng thái, code và message cố định", async () => {
    const reference = await request(appThrowing(Object.assign(new Error("fk"), { code: "ER_NO_REFERENCED_ROW_2" }))).get("/boom");
    expect(reference.status).toBe(400);
    expect(reference.body).toEqual({
      error: { code: "VALIDATION_ERROR", message: "Dữ liệu tham chiếu không tồn tại" },
    });
    const referenced = await request(appThrowing(Object.assign(new Error("fk"), { code: "ER_ROW_IS_REFERENCED_2" }))).get("/boom");
    expect(referenced.status).toBe(409);
    expect(referenced.body).toEqual({
      error: { code: "CONFLICT", message: "Khóa học đã có học viên ghi danh, không thể xóa" },
    });
    const duplicate = await request(appThrowing(Object.assign(new Error("dup"), { code: "ER_DUP_ENTRY" }))).get("/boom");
    expect(duplicate.status).toBe(409);
    expect(duplicate.body).toEqual({
      error: { code: "CONFLICT", message: "Vị trí bài học đã được dùng trong khóa học này" },
    });
  });

  it("đổi ZodError thành 400 VALIDATION_ERROR kèm details { field, message }", async () => {
    const zodError = new ZodError([{ code: "custom", path: ["title"], message: "Tiêu đề không được để trống" }]);
    const res = await request(appThrowing(zodError)).get("/boom");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ",
        details: [{ field: "title", message: "Tiêu đề không được để trống" }],
      },
    });
  });

  it("lỗi không lường trước từ MySQL trả 500 INTERNAL_ERROR và không lộ chi tiết nội bộ", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const secret = "Table 'rikkei_learn.courzes' doesn't exist";
    vi.spyOn(pool, "query").mockRejectedValue(new Error(secret));
    vi.spyOn(pool, "execute").mockRejectedValue(new Error(secret));
    const list = await request(app).get("/courses");
    expect(list.status).toBe(500);
    expect(list.body).toEqual({ error: { code: "INTERNAL_ERROR", message: "Lỗi máy chủ" } });
    const one = await request(app).get("/courses/1");
    expect(one.status).toBe(500);
    expect(JSON.stringify(one.body)).not.toContain("courzes");
  });
});
