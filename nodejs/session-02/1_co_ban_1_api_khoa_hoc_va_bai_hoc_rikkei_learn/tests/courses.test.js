// Bộ test tự chấm của Bài 1: API khóa học và bài học trong bộ nhớ.
const request = require("supertest");
const app = require("../src/app");
const courses = require("../src/data/courses");
const lessons = require("../src/data/lessons");

// Bản chụp dữ liệu ban đầu; trước mỗi test, khôi phục chính hai mảng đã xuất (route đọc và ghi đúng hai mảng này).
const originalCourses = JSON.parse(JSON.stringify(courses));
const originalLessons = JSON.parse(JSON.stringify(lessons));

beforeEach(() => {
  courses.splice(0, courses.length, ...JSON.parse(JSON.stringify(originalCourses)));
  lessons.splice(0, lessons.length, ...JSON.parse(JSON.stringify(originalLessons)));
});

const ids = (list) => list.map((item) => item.id);
const validationBody = (details) => ({
  error: { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", details },
});
const notFoundBody = (message) => ({ error: { code: "NOT_FOUND", message } });

describe("Khung ứng dụng", () => {
  it("GET /health trả 200 và { status: ok }", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("đường dẫn không tồn tại trả 404 JSON NOT_FOUND", async () => {
    const res = await request(app).get("/khong-co");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toEqual(notFoundBody("Không tìm thấy đường dẫn"));
  });

  it("body JSON sai cú pháp trả 400 JSON không hợp lệ", async () => {
    const res = await request(app).post("/courses").set("Content-Type", "application/json").send('{"title":');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: { code: "VALIDATION_ERROR", message: "JSON không hợp lệ" } });
  });
});

describe("Danh sách khóa học và phân trang", () => {
  it("mặc định trả 5 khóa đầu theo id kèm meta và đúng các trường", async () => {
    const res = await request(app).get("/courses");
    expect(res.status).toBe(200);
    expect(ids(res.body.data)).toEqual([1, 2, 3, 4, 5]);
    expect(res.body.meta).toEqual({ page: 1, limit: 5, total: 6, totalPages: 2 });
    expect(res.body.data[0]).toEqual({
      id: 1,
      title: "HTML và CSS cơ bản",
      description: "Dựng trang web tĩnh từ đầu.",
      level: "beginner",
      lessonCount: 2,
    });
  });

  it("lessonCount của từng khóa bằng số bài học của khóa đó", async () => {
    const res = await request(app).get("/courses?limit=50");
    expect(res.body.data.map((course) => course.lessonCount)).toEqual([2, 3, 2, 4, 2, 2]);
  });

  it("page=2 trả khóa học còn lại ở trang sau", async () => {
    const res = await request(app).get("/courses?page=2");
    expect(res.status).toBe(200);
    expect(ids(res.body.data)).toEqual([6]);
    expect(res.body.meta).toEqual({ page: 2, limit: 5, total: 6, totalPages: 2 });
  });

  it("page vượt quá số trang trả mảng rỗng, không báo lỗi", async () => {
    const res = await request(app).get("/courses?page=3");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta).toEqual({ page: 3, limit: 5, total: 6, totalPages: 2 });
  });

});

describe("Lọc, tìm kiếm và sắp xếp", () => {
  it("lọc level=beginner chỉ giữ khóa cấp beginner và tính lại total", async () => {
    const res = await request(app).get("/courses?level=beginner");
    expect(ids(res.body.data)).toEqual([1, 2, 6]);
    expect(res.body.meta).toEqual({ page: 1, limit: 5, total: 3, totalPages: 1 });
  });

  it("q tìm theo tiêu đề, không phân biệt hoa thường", async () => {
    const res = await request(app).get("/courses?q=JAVA");
    expect(ids(res.body.data)).toEqual([2, 3]);
    expect(res.body.meta.total).toBe(2);
  });

  it("q chỉ gồm dấu cách thì không lọc", async () => {
    const res = await request(app).get("/courses?q=%20%20%20");
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(6);
  });

  it("sort=title sắp tiêu đề theo thứ tự chữ cái tăng dần", async () => {
    const res = await request(app).get("/courses?sort=title");
    expect(res.body.data.map((course) => course.title)).toEqual([
      "Cơ sở dữ liệu MySQL",
      "HTML và CSS cơ bản",
      "JavaScript cơ bản",
      "JavaScript nâng cao",
      "NodeJS và Express",
    ]);
    expect(res.body.meta.total).toBe(6);
  });

  it("sort=title&order=desc sắp giảm dần rồi mới phân trang", async () => {
    const res = await request(app).get("/courses?sort=title&order=desc&page=2&limit=2");
    expect(res.body.data.map((course) => course.title)).toEqual(["JavaScript nâng cao", "JavaScript cơ bản"]);
    expect(res.body.meta).toEqual({ page: 2, limit: 2, total: 6, totalPages: 3 });
  });
});

describe("Kiểm tra tham số của danh sách", () => {
  it("level không hợp lệ trả 400 kèm details", async () => {
    const res = await request(app).get("/courses?level=expert");
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      validationBody([{ field: "level", message: "Cấp độ phải là beginner, intermediate hoặc advanced" }])
    );
  });

  it("page không phải số nguyên dương trả 400", async () => {
    const zero = await request(app).get("/courses?page=0");
    const text = await request(app).get("/courses?page=abc");
    const expected = validationBody([{ field: "page", message: "page phải là số nguyên từ 1 trở lên" }]);
    expect(zero.status).toBe(400);
    expect(zero.body).toEqual(expected);
    expect(text.status).toBe(400);
    expect(text.body).toEqual(expected);
  });

  it("limit lớn hơn 50 trả 400", async () => {
    const res = await request(app).get("/courses?limit=51");
    expect(res.status).toBe(400);
    expect(res.body).toEqual(validationBody([{ field: "limit", message: "limit phải là số nguyên từ 1 đến 50" }]));
  });

  it("sort và order sai cùng lúc trả hai lỗi theo thứ tự sort rồi order", async () => {
    const res = await request(app).get("/courses?sort=price&order=up");
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      validationBody([
        { field: "sort", message: "sort chỉ nhận giá trị title" },
        { field: "order", message: "order chỉ nhận giá trị asc hoặc desc" },
      ])
    );
  });
});

describe("Chi tiết khóa học", () => {
  it("GET /courses/4 trả khóa học kèm bốn bài học theo position", async () => {
    const res = await request(app).get("/courses/4");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 4,
      title: "ReactJS",
      description: "Xây giao diện bằng component.",
      level: "intermediate",
      lessons: [
        { id: 8, title: "Component và JSX", position: 1 },
        { id: 9, title: "Hooks", position: 2 },
        { id: 10, title: "React Router", position: 3 },
        { id: 11, title: "Gọi API", position: 4 },
      ],
    });
  });

  it("bài học luôn theo position dù thứ tự lưu trong kho khác", async () => {
    lessons.reverse();
    const res = await request(app).get("/courses/4");
    expect(res.body.lessons.map((lesson) => lesson.position)).toEqual([1, 2, 3, 4]);
    expect(ids(res.body.lessons)).toEqual([8, 9, 10, 11]);
  });

  it("khóa học không có trả 404 Không tìm thấy khóa học", async () => {
    const res = await request(app).get("/courses/99");
    expect(res.status).toBe(404);
    expect(res.body).toEqual(notFoundBody("Không tìm thấy khóa học"));
  });

  it("id không phải số nguyên dương trả 400 thay vì 404", async () => {
    const res = await request(app).get("/courses/abc");
    expect(res.status).toBe(400);
    expect(res.body).toEqual(validationBody([{ field: "id", message: "id phải là số nguyên dương" }]));
  });
});

describe("Tạo khóa học", () => {
  it("POST hợp lệ trả 201, cắt khoảng trắng tiêu đề và mô tả mặc định rỗng", async () => {
    const res = await request(app).post("/courses").send({ title: "  Docker cơ bản  ", level: "beginner" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 7, title: "Docker cơ bản", description: "", level: "beginner" });
  });

  it("khóa vừa tạo xem lại được, chưa có bài học và lessonCount bằng 0", async () => {
    await request(app).post("/courses").send({ title: "Docker cơ bản", description: "Đóng gói ứng dụng.", level: "advanced" });
    const detail = await request(app).get("/courses/7");
    expect(detail.status).toBe(200);
    expect(detail.body.lessons).toEqual([]);
    expect(detail.body.description).toBe("Đóng gói ứng dụng.");
    const list = await request(app).get("/courses?page=2");
    expect(list.body.meta.total).toBe(7);
    expect(list.body.data[1]).toMatchObject({ id: 7, lessonCount: 0 });
  });

  it("tiêu đề chỉ gồm dấu cách trả 400 và không thêm khóa nào", async () => {
    const res = await request(app).post("/courses").send({ title: "     ", level: "beginner" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(validationBody([{ field: "title", message: "Tiêu đề không được để trống" }]));
    expect(courses).toHaveLength(6);
  });

  it("thiếu tiêu đề và cấp độ sai trả hai lỗi trong details", async () => {
    const res = await request(app).post("/courses").send({ level: "expert" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      validationBody([
        { field: "title", message: "Tiêu đề không được để trống" },
        { field: "level", message: "Cấp độ phải là beginner, intermediate hoặc advanced" },
      ])
    );
  });

  it("tiêu đề dài 121 ký tự trả 400", async () => {
    const res = await request(app).post("/courses").send({ title: "a".repeat(121), level: "beginner" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(validationBody([{ field: "title", message: "Tiêu đề tối đa 120 ký tự" }]));
  });

  it("mô tả không phải chuỗi trả 400", async () => {
    const res = await request(app).post("/courses").send({ title: "Docker", description: 123, level: "beginner" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(validationBody([{ field: "description", message: "Mô tả phải là chuỗi" }]));
  });
});

describe("Sửa khóa học", () => {
  it("PATCH chỉ đổi các trường được gửi, giữ nguyên trường còn lại", async () => {
    const res = await request(app).patch("/courses/3").send({ title: "  JavaScript async  ", level: "advanced" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 3,
      title: "JavaScript async",
      description: "Bất đồng bộ và gọi API.",
      level: "advanced",
    });
    expect((await request(app).get("/courses/3")).body.title).toBe("JavaScript async");
  });

  it("body không có trường nào của khóa học trả 400 Cần gửi ít nhất một trường", async () => {
    const res = await request(app).patch("/courses/3").send({ ghiChu: "khong dung" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(validationBody([{ field: "body", message: "Cần gửi ít nhất một trường" }]));
  });

  it("level sai trả 400 và khóa học giữ nguyên dữ liệu cũ", async () => {
    const res = await request(app).patch("/courses/3").send({ title: "Tên mới", level: "expert" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      validationBody([{ field: "level", message: "Cấp độ phải là beginner, intermediate hoặc advanced" }])
    );
    expect(courses.find((course) => course.id === 3).title).toBe("JavaScript nâng cao");
  });

  it("khóa học không tồn tại trả 404", async () => {
    const res = await request(app).patch("/courses/99").send({ title: "Tên mới" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual(notFoundBody("Không tìm thấy khóa học"));
  });
});

describe("Xóa khóa học", () => {
  it("DELETE trả 204 không thân, khóa biến mất; xóa lần hai trả 404", async () => {
    const res = await request(app).delete("/courses/2");
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect((await request(app).get("/courses/2")).status).toBe(404);
    const again = await request(app).delete("/courses/2");
    expect(again.status).toBe(404);
    expect(again.body).toEqual(notFoundBody("Không tìm thấy khóa học"));
  });

  it("xóa khóa học xóa luôn bài học của khóa, giữ bài học của khóa khác", async () => {
    await request(app).delete("/courses/4");
    expect(lessons.filter((lesson) => lesson.courseId === 4)).toHaveLength(0);
    expect(ids(lessons)).toEqual([1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15]);
  });

  it("khóa tạo sau khi xóa khóa cuối dùng lại id nhưng không thừa hưởng bài học cũ", async () => {
    await request(app).delete("/courses/6");
    const created = await request(app).post("/courses").send({ title: "Docker cơ bản", level: "beginner" });
    expect(created.body.id).toBe(6);
    const res = await request(app).get("/courses/6/lessons");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

});

describe("Danh sách bài học của khóa", () => {
  it("GET /courses/2/lessons trả ba bài học theo position, không lộ courseId", async () => {
    const res = await request(app).get("/courses/2/lessons");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 3, title: "Biến và kiểu dữ liệu", position: 1 },
      { id: 4, title: "Hàm và mảng", position: 2 },
      { id: 5, title: "Đối tượng", position: 3 },
    ]);
  });

  it("khóa học không tồn tại trả 404 Không tìm thấy khóa học", async () => {
    const res = await request(app).get("/courses/99/lessons");
    expect(res.status).toBe(404);
    expect(res.body).toEqual(notFoundBody("Không tìm thấy khóa học"));
  });
});

describe("Thêm bài học vào khóa", () => {
  it("POST trả 201, bài mới nằm cuối khóa với id nối tiếp toàn bộ bài học", async () => {
    const res = await request(app).post("/courses/2/lessons").send({ title: "  Vòng lặp  " });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 16, title: "Vòng lặp", position: 4 });
    const list = await request(app).get("/courses/2/lessons");
    expect(list.body.map((lesson) => lesson.title)).toEqual([
      "Biến và kiểu dữ liệu",
      "Hàm và mảng",
      "Đối tượng",
      "Vòng lặp",
    ]);
  });

  it("position là số lớn nhất trong khóa cộng 1, không phải số bài học cộng 1", async () => {
    lessons.find((lesson) => lesson.id === 5).position = 7;
    const res = await request(app).post("/courses/2/lessons").send({ title: "Vòng lặp" });
    expect(res.body.position).toBe(8);
  });

  it("khóa chưa có bài học nhận bài đầu tiên ở position 1", async () => {
    await request(app).post("/courses").send({ title: "Docker cơ bản", level: "beginner" });
    const res = await request(app).post("/courses/7/lessons").send({ title: "Cài đặt Docker" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 16, title: "Cài đặt Docker", position: 1 });
  });

  it("tiêu đề trùng trong cùng khóa (khác hoa thường, thừa dấu cách) trả 409 và không thêm bài", async () => {
    const res = await request(app).post("/courses/2/lessons").send({ title: "  HÀM VÀ MẢNG " });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: { code: "CONFLICT", message: "Tiêu đề bài học đã tồn tại trong khóa học" },
    });
    expect(lessons).toHaveLength(15);
  });

  it("cùng tiêu đề ở khóa khác vẫn được thêm", async () => {
    const res = await request(app).post("/courses/3/lessons").send({ title: "Hàm và mảng" });
    expect(res.status).toBe(201);
    expect(res.body.position).toBe(3);
  });

  it("tiêu đề chỉ gồm dấu cách trả 400", async () => {
    const res = await request(app).post("/courses/2/lessons").send({ title: "   " });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(validationBody([{ field: "title", message: "Tiêu đề không được để trống" }]));
    expect(lessons).toHaveLength(15);
  });

  it("khóa học không tồn tại trả 404 Không tìm thấy khóa học", async () => {
    const res = await request(app).post("/courses/99/lessons").send({ title: "Vòng lặp" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual(notFoundBody("Không tìm thấy khóa học"));
  });

});

describe("Xóa bài học và đánh lại position", () => {
  it("xóa bài đầu khóa 4 trả 204 và các bài còn lại đánh lại position từ 1", async () => {
    const res = await request(app).delete("/courses/4/lessons/8");
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    const list = await request(app).get("/courses/4/lessons");
    expect(list.body).toEqual([
      { id: 9, title: "Hooks", position: 1 },
      { id: 10, title: "React Router", position: 2 },
      { id: 11, title: "Gọi API", position: 3 },
    ]);
    const other = await request(app).get("/courses/2/lessons");
    expect(other.body.map((lesson) => lesson.position)).toEqual([1, 2, 3]);
  });

  it("bài học không tồn tại trả 404 Không tìm thấy bài học", async () => {
    const res = await request(app).delete("/courses/4/lessons/99");
    expect(res.status).toBe(404);
    expect(res.body).toEqual(notFoundBody("Không tìm thấy bài học"));
  });

  it("bài học thuộc khóa khác trả 404 và không bị xóa", async () => {
    const res = await request(app).delete("/courses/2/lessons/8");
    expect(res.status).toBe(404);
    expect(res.body).toEqual(notFoundBody("Không tìm thấy bài học"));
    expect(lessons).toHaveLength(15);
  });

});
