// Test tự chấm Bài 3: ghi danh và tiến độ học bằng mysql2. KHÔNG sửa tệp này.
// Test gọi thẳng các hàm repository trên cơ sở dữ liệu rikkei_learn_test (được nạp lại trước mỗi test).
const pool = require("../src/db/pool");
const coursesRepository = require("../src/repositories/courses.repository");
const enrollmentsRepository = require("../src/repositories/enrollments.repository");
const { resetDatabase } = require("./helpers/db");

const MSG_ALREADY = "Học viên đã ghi danh khóa học này";
const MSG_NO_COURSE = "Không tìm thấy khóa học";
const MSG_NO_ENROLLMENT = "Không tìm thấy ghi danh";
const MSG_PROGRESS_RANGE = "Tiến độ phải là số nguyên từ 0 đến 100";
const MSG_PROGRESS_DECREASE = "Tiến độ không được giảm";
const MSG_PROGRESS_DROPPED = "Ghi danh đã bị hủy, không thể cập nhật tiến độ";

// Chạy một promise và trả lỗi nó ném ra (null nếu không ném).
async function captureError(promise) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  return null;
}

// Kiểm tra một lỗi httpError có đúng mã trạng thái, code và message.
function expectHttpError(error, status, code, message) {
  expect(error).not.toBeNull();
  expect(error.status).toBe(status);
  expect(error.code).toBe(code);
  expect(error.message).toBe(message);
}

// Đếm hàng của một bảng bằng pool (tên bảng do test tự chọn, không phải đầu vào người dùng).
async function countRows(table) {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM ${table}`);
  return rows[0].total;
}

// Đọc thẳng một ghi danh từ bảng theo id.
async function rowById(id) {
  const [rows] = await pool.query("SELECT user_id, course_id, status, progress FROM enrollments WHERE id = ?", [id]);
  return rows[0] || null;
}

// Đọc thẳng ghi danh của một cặp học viên và khóa học.
async function rowOf(userId, courseId) {
  const [rows] = await pool.query(
    "SELECT id, status, progress FROM enrollments WHERE user_id = ? AND course_id = ?",
    [userId, courseId]
  );
  return rows[0] || null;
}

// Thêm một khóa học chưa có bài học nào (id 7 trên dữ liệu mẫu).
async function insertEmptyCourse() {
  const [result] = await pool.query("INSERT INTO courses (title) VALUES ('Khóa học chưa có bài')");
  return result.insertId;
}

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

describe("courses.repository: đọc, tìm và tạo khóa học", () => {
  it("findAll trả 6 khóa học theo id tăng, mỗi khóa có đúng bốn trường id, title, description, level", async () => {
    const courses = await coursesRepository.findAll();
    expect(courses.map((course) => course.id)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(Object.keys(courses[4]).sort()).toEqual(["description", "id", "level", "title"]);
    expect(courses[4].title).toBe("NodeJS và Express");
  });

  it("findById trả khóa học theo id, trả null khi id không có hoặc không phải số", async () => {
    const course = await coursesRepository.findById(5);
    expect(course).toEqual({
      id: 5,
      title: "NodeJS và Express",
      description: "Viết API với Express và MySQL.",
      level: "intermediate",
    });
    expect(await coursesRepository.findById(999)).toBeNull();
    expect(await coursesRepository.findById("abc")).toBeNull();
  });

  it("searchByTitle tìm theo tiêu đề không phân biệt hoa thường, theo id tăng, không khớp thì trả mảng rỗng", async () => {
    const found = await coursesRepository.searchByTitle("javascript");
    expect(found.map((course) => course.title)).toEqual(["JavaScript cơ bản", "JavaScript nâng cao"]);
    expect(await coursesRepository.searchByTitle("khong-co-khoa-nao")).toEqual([]);
  });

  it("create trả khóa học mới có description rỗng và level beginner khi không truyền", async () => {
    const created = await coursesRepository.create({ title: "Docker cơ bản" });
    expect(created).toEqual({ id: 7, title: "Docker cơ bản", description: "", level: "beginner" });
  });

  it("create giữ nguyên description và level được truyền vào, bảng courses có thêm một hàng", async () => {
    const created = await coursesRepository.create({
      title: "TypeScript",
      description: "Kiểu tĩnh cho JavaScript.",
      level: "advanced",
    });
    expect(created).toEqual({
      id: 7,
      title: "TypeScript",
      description: "Kiểu tĩnh cho JavaScript.",
      level: "advanced",
    });
    expect(await countRows("courses")).toBe(7);
  });
});

describe("enrollStudent: ghi danh vào khóa học", () => {
  it("ghi danh thành công: trả ghi danh mới (active, tiến độ 0, kèm courseTitle) và bảng có thêm một hàng", async () => {
    const enrollment = await enrollmentsRepository.enrollStudent(2, 5);
    expect(enrollment).toMatchObject({
      id: 11,
      userId: 2,
      courseId: 5,
      courseTitle: "NodeJS và Express",
      status: "active",
      progress: 0,
    });
    expect(enrollment.enrolledAt).toBeTruthy();
    expect(await rowOf(2, 5)).toEqual({ id: 11, status: "active", progress: 0 });
    expect(await countRows("enrollments")).toBe(11);
  });

  it("khóa học không tồn tại hoặc id không phải số: 404 NOT_FOUND, bảng không đổi", async () => {
    const missing = await captureError(enrollmentsRepository.enrollStudent(2, 99));
    expectHttpError(missing, 404, "NOT_FOUND", MSG_NO_COURSE);
    const notNumber = await captureError(enrollmentsRepository.enrollStudent(2, "abc"));
    expectHttpError(notNumber, 404, "NOT_FOUND", MSG_NO_COURSE);
    expect(await countRows("enrollments")).toBe(10);
  });

  it("khóa học chưa có bài học: 409 CONFLICT, bảng không đổi", async () => {
    const emptyCourseId = await insertEmptyCourse();
    const error = await captureError(enrollmentsRepository.enrollStudent(2, emptyCourseId));
    expectHttpError(error, 409, "CONFLICT", "Khóa học chưa có bài học");
    expect(await countRows("enrollments")).toBe(10);
  });

  it("đã ghi danh và đang học: 409 CONFLICT, ghi danh cũ giữ nguyên", async () => {
    const error = await captureError(enrollmentsRepository.enrollStudent(2, 4));
    expectHttpError(error, 409, "CONFLICT", MSG_ALREADY);
    expect(await rowOf(2, 4)).toEqual({ id: 3, status: "active", progress: 60 });
    expect(await countRows("enrollments")).toBe(10);
  });

  it("đã ghi danh và đã hoàn thành: 409 CONFLICT, ghi danh cũ giữ nguyên", async () => {
    const error = await captureError(enrollmentsRepository.enrollStudent(2, 1));
    expectHttpError(error, 409, "CONFLICT", MSG_ALREADY);
    expect(await rowOf(2, 1)).toEqual({ id: 1, status: "completed", progress: 100 });
    expect(await countRows("enrollments")).toBe(10);
  });

  it("ghi danh lại sau khi đã rút (dropped): dùng lại đúng ghi danh cũ, chuyển active và giữ nguyên tiến độ", async () => {
    expect(await rowOf(4, 4)).toEqual({ id: 7, status: "dropped", progress: 10 });
    const enrollment = await enrollmentsRepository.enrollStudent(4, 4);
    expect(enrollment).toMatchObject({ id: 7, userId: 4, courseId: 4, status: "active", progress: 10 });
    expect(await rowOf(4, 4)).toEqual({ id: 7, status: "active", progress: 10 });
    expect(await countRows("enrollments")).toBe(10);
  });

  it("sau khi ghi danh lại, lần ghi danh tiếp theo vào cùng khóa bị từ chối 409", async () => {
    await enrollmentsRepository.enrollStudent(4, 4);
    const error = await captureError(enrollmentsRepository.enrollStudent(4, 4));
    expectHttpError(error, 409, "CONFLICT", MSG_ALREADY);
    expect(await rowOf(4, 4)).toEqual({ id: 7, status: "active", progress: 10 });
  });
});

describe("updateProgress: cập nhật tiến độ", () => {
  it("tăng tiến độ từ 60 lên 80: ghi vào bảng, vẫn active, trả ghi danh sau khi sửa", async () => {
    const enrollment = await enrollmentsRepository.updateProgress(3, 80);
    expect(enrollment).toMatchObject({ id: 3, courseTitle: "ReactJS", status: "active", progress: 80 });
    expect(await rowById(3)).toMatchObject({ status: "active", progress: 80 });
  });

  it("đạt 100 thì tự chuyển sang completed", async () => {
    const enrollment = await enrollmentsRepository.updateProgress(6, 100);
    expect(enrollment).toMatchObject({ id: 6, status: "completed", progress: 100 });
    expect(await rowById(6)).toMatchObject({ status: "completed", progress: 100 });
  });

  it("giá trị bằng tiến độ hiện tại vẫn hợp lệ: 60 giữ 60, 100 giữ completed, 0 giữ 0", async () => {
    expect(await enrollmentsRepository.updateProgress(3, 60)).toMatchObject({ status: "active", progress: 60 });
    expect(await enrollmentsRepository.updateProgress(1, 100)).toMatchObject({ status: "completed", progress: 100 });
    const created = await enrollmentsRepository.enrollStudent(6, 5);
    expect(await enrollmentsRepository.updateProgress(created.id, 0)).toMatchObject({ status: "active", progress: 0 });
  });

  it("tiến độ giảm bị từ chối 409 (kể cả ghi danh completed), tiến độ cũ giữ nguyên", async () => {
    const active = await captureError(enrollmentsRepository.updateProgress(3, 50));
    expectHttpError(active, 409, "CONFLICT", MSG_PROGRESS_DECREASE);
    expect(await rowById(3)).toMatchObject({ status: "active", progress: 60 });
    const completed = await captureError(enrollmentsRepository.updateProgress(1, 99));
    expectHttpError(completed, 409, "CONFLICT", MSG_PROGRESS_DECREASE);
    expect(await rowById(1)).toMatchObject({ status: "completed", progress: 100 });
  });

  it("ghi danh đã rút (dropped) không cập nhật được dù tiến độ mới cao hơn hay thấp hơn: 409", async () => {
    const higher = await captureError(enrollmentsRepository.updateProgress(7, 50));
    expectHttpError(higher, 409, "CONFLICT", MSG_PROGRESS_DROPPED);
    const lower = await captureError(enrollmentsRepository.updateProgress(7, 5));
    expectHttpError(lower, 409, "CONFLICT", MSG_PROGRESS_DROPPED);
    expect(await rowById(7)).toMatchObject({ status: "dropped", progress: 10 });
  });

  it("tiến độ ngoài khoảng 0 đến 100 (-1, 101, 1000): 400 VALIDATION_ERROR, bảng không đổi", async () => {
    for (const progress of [-1, 101, 1000]) {
      const error = await captureError(enrollmentsRepository.updateProgress(3, progress));
      expectHttpError(error, 400, "VALIDATION_ERROR", MSG_PROGRESS_RANGE);
    }
    expect(await rowById(3)).toMatchObject({ status: "active", progress: 60 });
  });

  it("tiến độ không phải số nguyên kiểu number (50.5, chuỗi, null, undefined, NaN): 400 VALIDATION_ERROR", async () => {
    for (const progress of [50.5, "80", "abc", null, undefined, NaN]) {
      const error = await captureError(enrollmentsRepository.updateProgress(3, progress));
      expectHttpError(error, 400, "VALIDATION_ERROR", MSG_PROGRESS_RANGE);
    }
    expect(await rowById(3)).toMatchObject({ status: "active", progress: 60 });
  });

  it("ghi danh không tồn tại hoặc id không phải số: 404 NOT_FOUND; tiến độ sai được báo 400 trước", async () => {
    const missing = await captureError(enrollmentsRepository.updateProgress(999, 50));
    expectHttpError(missing, 404, "NOT_FOUND", MSG_NO_ENROLLMENT);
    const notNumber = await captureError(enrollmentsRepository.updateProgress("abc", 50));
    expectHttpError(notNumber, 404, "NOT_FOUND", MSG_NO_ENROLLMENT);
    const invalid = await captureError(enrollmentsRepository.updateProgress(999, 200));
    expectHttpError(invalid, 400, "VALIDATION_ERROR", MSG_PROGRESS_RANGE);
  });
});

describe("dropEnrollment và findByUser: rút khỏi khóa học và xem ghi danh của một học viên", () => {
  it("dropEnrollment đổi ghi danh đang học sang dropped, giữ nguyên tiến độ và trả ghi danh sau khi sửa", async () => {
    const enrollment = await enrollmentsRepository.dropEnrollment(3);
    expect(enrollment).toMatchObject({ id: 3, courseTitle: "ReactJS", status: "dropped", progress: 60 });
    expect(await rowById(3)).toMatchObject({ status: "dropped", progress: 60 });
  });

  it("dropEnrollment từ chối ghi danh đã hoàn thành: 409, trạng thái giữ nguyên", async () => {
    const error = await captureError(enrollmentsRepository.dropEnrollment(1));
    expectHttpError(error, 409, "CONFLICT", "Khóa học đã hoàn thành, không thể rút");
    expect(await rowById(1)).toMatchObject({ status: "completed", progress: 100 });
  });

  it("dropEnrollment từ chối ghi danh đã rút từ trước: 409", async () => {
    const error = await captureError(enrollmentsRepository.dropEnrollment(7));
    expectHttpError(error, 409, "CONFLICT", "Ghi danh đã bị hủy từ trước");
  });

  it("dropEnrollment với ghi danh không tồn tại: 404 NOT_FOUND", async () => {
    const error = await captureError(enrollmentsRepository.dropEnrollment(999));
    expectHttpError(error, 404, "NOT_FOUND", MSG_NO_ENROLLMENT);
  });

  it("findByUser trả các ghi danh của học viên theo id tăng, kèm courseTitle và đủ trường", async () => {
    const list = await enrollmentsRepository.findByUser(2);
    expect(list.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(list.map((item) => item.courseTitle)).toEqual(["HTML và CSS cơ bản", "JavaScript cơ bản", "ReactJS"]);
    expect(list.every((item) => item.userId === 2)).toBe(true);
    expect(Object.keys(list[2]).sort()).toEqual(
      ["courseId", "courseTitle", "enrolledAt", "id", "progress", "status", "userId"]
    );
  });

  it("findByUser gồm cả ghi danh đã rút; học viên chưa ghi danh hoặc không tồn tại thì trả mảng rỗng", async () => {
    const list = await enrollmentsRepository.findByUser(4);
    expect(list.map((item) => [item.id, item.status])).toEqual([[6, "active"], [7, "dropped"]]);
    expect(await enrollmentsRepository.findByUser(1)).toEqual([]);
    expect(await enrollmentsRepository.findByUser(999)).toEqual([]);
  });
});

describe("enrollStudentInCourses: ghi danh nhiều khóa trong một giao dịch và rollback khi lỗi giữa chừng", () => {
  it("thành công: trả mảng ghi danh đúng thứ tự danh sách khóa, bảng có thêm hai hàng", async () => {
    const list = await enrollmentsRepository.enrollStudentInCourses(6, [3, 1]);
    expect(list[0].id).toBeGreaterThan(10);
    expect(list[1].id).toBeGreaterThan(list[0].id);
    expect(list.map((item) => item.courseTitle)).toEqual(["JavaScript nâng cao", "HTML và CSS cơ bản"]);
    expect(list.every((item) => item.userId === 6 && item.status === "active" && item.progress === 0)).toBe(true);
    expect(await countRows("enrollments")).toBe(12);
  });

  it("khóa thứ hai không tồn tại: 404 và ghi danh khóa thứ nhất bị hoàn tác (rollback)", async () => {
    const error = await captureError(enrollmentsRepository.enrollStudentInCourses(2, [3, 99]));
    expectHttpError(error, 404, "NOT_FOUND", MSG_NO_COURSE);
    expect(await rowOf(2, 3)).toBeNull();
    expect(await countRows("enrollments")).toBe(10);
  });

  it("khóa thứ hai đã ghi danh từ trước: 409 và khóa thứ nhất không được ghi danh", async () => {
    const error = await captureError(enrollmentsRepository.enrollStudentInCourses(2, [3, 4]));
    expectHttpError(error, 409, "CONFLICT", MSG_ALREADY);
    expect(await rowOf(2, 3)).toBeNull();
    expect(await countRows("enrollments")).toBe(10);
  });

  it("danh sách có hai lần cùng một khóa: 409 và không khóa nào được ghi danh", async () => {
    const error = await captureError(enrollmentsRepository.enrollStudentInCourses(2, [5, 5]));
    expectHttpError(error, 409, "CONFLICT", MSG_ALREADY);
    expect(await rowOf(2, 5)).toBeNull();
    expect(await countRows("enrollments")).toBe(10);
  });

  it("ghi danh lại khóa đã rút rồi gặp lỗi giữa chừng: ghi danh cũ vẫn là dropped với tiến độ cũ", async () => {
    const error = await captureError(enrollmentsRepository.enrollStudentInCourses(4, [4, 99]));
    expectHttpError(error, 404, "NOT_FOUND", MSG_NO_COURSE);
    expect(await rowById(7)).toMatchObject({ status: "dropped", progress: 10 });
  });

  it("học viên không tồn tại: 400 VALIDATION_ERROR và không có hàng nào được thêm", async () => {
    const error = await captureError(enrollmentsRepository.enrollStudentInCourses(999, [1, 2]));
    expectHttpError(error, 400, "VALIDATION_ERROR", "Học viên không tồn tại");
    expect(await countRows("enrollments")).toBe(10);
  });

  it("danh sách rỗng hoặc không phải mảng: 400 VALIDATION_ERROR", async () => {
    for (const courseIds of [[], null, "5"]) {
      const error = await captureError(enrollmentsRepository.enrollStudentInCourses(2, courseIds));
      expectHttpError(error, 400, "VALIDATION_ERROR", "Danh sách khóa học không được rỗng");
    }
    expect(await countRows("enrollments")).toBe(10);
  });
});

describe("giải phóng kết nối: pool có connectionLimit 10, nên 12 lời gọi liên tiếp phải trả kết nối về pool", () => {
  it("25 lời gọi enrollStudent liên tiếp đều lỗi, sau đó vẫn ghi danh được", async () => {
    const attempts = [[2, 99], [2, 4], [999, 5], [2, 1]];
    for (let index = 0; index < 25; index += 1) {
      const [userId, courseId] = attempts[index % attempts.length];
      const error = await captureError(enrollmentsRepository.enrollStudent(userId, courseId));
      expect(error).not.toBeNull();
    }
    const enrollment = await enrollmentsRepository.enrollStudent(2, 5);
    expect(enrollment).toMatchObject({ userId: 2, courseId: 5, status: "active", progress: 0 });
    expect(await countRows("enrollments")).toBe(11);
  });

  it("15 lời gọi enrollStudentInCourses lỗi giữa chừng liên tiếp, sau đó vẫn ghi danh được", async () => {
    for (let index = 0; index < 15; index += 1) {
      const error = await captureError(enrollmentsRepository.enrollStudentInCourses(2, [3, 99]));
      expect(error).not.toBeNull();
    }
    expect(await countRows("enrollments")).toBe(10);
    const list = await enrollmentsRepository.enrollStudentInCourses(2, [3, 5]);
    expect(list).toHaveLength(2);
  });

  it("12 vòng ghi danh lại rồi rút liên tiếp đều thành công (đường thành công cũng trả kết nối)", async () => {
    for (let round = 0; round < 12; round += 1) {
      const enrollment = await enrollmentsRepository.enrollStudent(4, 4);
      expect(enrollment).toMatchObject({ id: 7, status: "active", progress: 10 });
      const dropped = await enrollmentsRepository.dropEnrollment(7);
      expect(dropped.status).toBe("dropped");
    }
    expect(await rowOf(4, 4)).toEqual({ id: 7, status: "dropped", progress: 10 });
  });
});

describe("hai lời gọi đồng thời: chỉ một lời gọi được ghi danh", () => {
  it("hai enrollStudent đồng thời cho cùng học viên và khóa mới: đúng một thành công, lỗi còn lại là 409", async () => {
    for (const courseId of [1, 2, 3, 4]) {
      const results = await Promise.allSettled([
        enrollmentsRepository.enrollStudent(6, courseId),
        enrollmentsRepository.enrollStudent(6, courseId),
      ]);
      const fulfilled = results.filter((result) => result.status === "fulfilled");
      const rejected = results.filter((result) => result.status === "rejected");
      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expectHttpError(rejected[0].reason, 409, "CONFLICT", MSG_ALREADY);
      const [rows] = await pool.query(
        "SELECT COUNT(*) AS total FROM enrollments WHERE user_id = 6 AND course_id = ?",
        [courseId]
      );
      expect(rows[0].total).toBe(1);
    }
    expect(await countRows("enrollments")).toBe(14);
  });

  it("hai enrollStudent đồng thời kích hoạt lại cùng một ghi danh dropped: đúng một thành công, lỗi còn lại là 409", async () => {
    for (let round = 0; round < 3; round += 1) {
      if (round > 0) {
        await enrollmentsRepository.dropEnrollment(7);
      }
      const results = await Promise.allSettled([
        enrollmentsRepository.enrollStudent(4, 4),
        enrollmentsRepository.enrollStudent(4, 4),
      ]);
      const rejected = results.filter((result) => result.status === "rejected");
      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expectHttpError(rejected[0].reason, 409, "CONFLICT", MSG_ALREADY);
      expect(await rowOf(4, 4)).toEqual({ id: 7, status: "active", progress: 10 });
    }
    expect(await countRows("enrollments")).toBe(10);
  });

  it("hai học viên khác nhau cùng ghi danh một khóa đồng thời đều thành công", async () => {
    const results = await Promise.allSettled([
      enrollmentsRepository.enrollStudent(5, 1),
      enrollmentsRepository.enrollStudent(6, 1),
      enrollmentsRepository.enrollStudent(6, 2),
    ]);
    expect(results.every((result) => result.status === "fulfilled")).toBe(true);
    expect(await countRows("enrollments")).toBe(13);
  });
});

describe("chuỗi độc hại và đổi lỗi MySQL theo error.code", () => {
  it("searchByTitle với chuỗi tấn công chỉ coi là dữ liệu tìm kiếm: trả mảng rỗng và các bảng còn nguyên", async () => {
    const attacks = [
      "' OR 1=1 -- ",
      "' UNION SELECT id, email, password_hash, role FROM users -- ",
      "'; DROP TABLE enrollments; -- ",
    ];
    for (const attack of attacks) {
      expect(await coursesRepository.searchByTitle(attack)).toEqual([]);
    }
    expect(await countRows("courses")).toBe(6);
    expect(await countRows("lessons")).toBe(15);
    expect(await countRows("enrollments")).toBe(10);
  });

  it("findByUser với chuỗi tấn công không trả ghi danh của học viên khác", async () => {
    const list = await enrollmentsRepository.findByUser("2 OR 1=1").catch(() => []);
    expect(list.every((item) => item.userId === 2)).toBe(true);
  });

  it("create lưu nguyên văn tiêu đề chứa câu lệnh SQL và không làm hỏng bảng", async () => {
    const title = "Robert'); DROP TABLE courses; --";
    const created = await coursesRepository.create({ title });
    expect(created.title).toBe(title);
    expect(await countRows("courses")).toBe(7);
    expect(await countRows("enrollments")).toBe(10);
  });

  it("học viên không tồn tại (ER_NO_REFERENCED_ROW_2): 400 VALIDATION_ERROR, bảng không đổi", async () => {
    const error = await captureError(enrollmentsRepository.enrollStudent(999, 5));
    expectHttpError(error, 400, "VALIDATION_ERROR", "Học viên không tồn tại");
    expect(await countRows("enrollments")).toBe(10);
  });

  it("lỗi MySQL không có trong bảng đổi lỗi (ER_BAD_NULL_ERROR) được ném lại nguyên vẹn, không có status", async () => {
    const error = await captureError(enrollmentsRepository.enrollStudent(null, 5));
    expect(error).not.toBeNull();
    expect(error.code).toBe("ER_BAD_NULL_ERROR");
    expect(error.status).toBeUndefined();
    expect(await countRows("enrollments")).toBe(10);
  });
});
