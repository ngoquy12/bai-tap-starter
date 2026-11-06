// Test tự chấm Bài 2: thống kê học tập và bảng chứng chỉ bằng SQL. KHÔNG sửa tệp này.
// Mỗi test nạp lại cơ sở dữ liệu thử (rikkei_learn_test), chạy tệp SQL của bạn, chèn thêm dữ liệu biên
// (hòa điểm, NULL, khóa chưa có bài học) rồi so TẬP KẾT QUẢ: tên cột, các hàng và thứ tự hàng.
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const pool = require("../src/db/pool");
const queries = require("../src/sql/queries");
const { resetDatabase } = require("./helpers/db");

const SCHEMA_FILE = path.join(__dirname, "..", "src", "sql", "extend_schema.sql");

// Mở kết nối cho phép chạy nhiều câu lệnh một lần, trỏ vào cơ sở dữ liệu thử (tạo nếu chưa có).
async function openConnection() {
  const database = process.env.DB_NAME;
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.query(`USE \`${database}\``);
  return connection;
}

// Dữ liệu mẫu nguyên bản (chưa có bảng certificates, chưa có cột is_published).
async function resetOnly() {
  const connection = await openConnection();
  await connection.query("DROP TABLE IF EXISTS certificates");
  await connection.end();
  await resetDatabase();
}

// Dữ liệu mẫu rồi chạy tệp src/sql/extend_schema.sql của sinh viên.
async function resetWithExtend() {
  await resetOnly();
  const connection = await openConnection();
  try {
    await connection.query(fs.readFileSync(SCHEMA_FILE, "utf8"));
  } finally {
    await connection.end();
  }
}

// Chạy một truy vấn SELECT của sinh viên; trả hàng thuần và danh sách tên cột theo thứ tự.
async function run(name, params = []) {
  const [rows, fields] = await pool.query(queries[name], params);
  return { rows: JSON.parse(JSON.stringify(rows)), columns: fields.map((field) => field.name) };
}

// Chạy một câu lệnh ghi của sinh viên; trả ResultSetHeader (affectedRows ...).
async function write(name, params = []) {
  const [result] = await pool.query(queries[name], params);
  return result;
}

async function select(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return JSON.parse(JSON.stringify(rows));
}

// Dữ liệu bổ sung dùng trong các ca biên.
async function addEmptyCourse() {
  await pool.query(
    "INSERT INTO courses (id, title, description, level, created_at) VALUES (7, 'Docker cơ bản', '', 'beginner', '2026-08-07 09:00:00')"
  );
}

async function addDraftCourse() {
  await pool.query(
    "INSERT INTO courses (id, title, description, level, created_at, is_published) VALUES (8, 'Kubernetes bản nháp', '', 'advanced', '2026-08-08 09:00:00', 0)"
  );
  await pool.query("INSERT INTO lessons (id, course_id, title, position) VALUES (16, 8, 'Pod và Service', 1)");
}

async function addIdleUsers() {
  await pool.query(
    "INSERT INTO users (id, email, password_hash, full_name, role) VALUES " +
      "(7, 'ha@rikkei.edu', 'x', 'Vũ Thanh Hà', 'student'), (8, 'phu@rikkei.edu', 'x', 'Quản trị phụ', 'admin')"
  );
}

async function addEnrollment(id, userId, courseId, status, progress, enrolledAt = "2026-09-01 09:00:00") {
  await pool.query(
    "INSERT INTO enrollments (id, user_id, course_id, status, progress, enrolled_at) VALUES (?, ?, ?, ?, ?, ?)",
    [id, userId, courseId, status, progress, enrolledAt]
  );
}

afterAll(async () => {
  await pool.end();
});

describe("Tệp truy vấn", () => {
  it("src/sql/queries.js xuất đủ 11 chuỗi SQL không rỗng", () => {
    const names = [
      "courseLessonCounts",
      "activeStudentsPerCourse",
      "averageProgressPerCourse",
      "studentsWithoutEnrollment",
      "unenrolledCourses",
      "topCompletedStudents",
      "completionsByLevel",
      "studentEnrollments",
      "updateProgress",
      "deleteDroppedEnrollments",
      "issueCertificates",
    ];
    for (const name of names) {
      expect(typeof queries[name], name).toBe("string");
      expect(queries[name].trim().length, name).toBeGreaterThan(10);
    }
  });
});

describe("Bảng certificates và cột is_published (extend_schema.sql)", () => {
  beforeEach(resetWithExtend);

  it("chạy được tệp và tạo bảng certificates", async () => {
    const rows = await select(
      "SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'certificates'"
    );
    expect(rows[0].total).toBe(1);
  });

  it("certificates có cột id, enrollment_id, code, issued_at; enrollment_id và code bắt buộc có giá trị", async () => {
    const rows = await select(
      "SELECT column_name AS name, is_nullable AS nullable FROM information_schema.columns " +
        "WHERE table_schema = DATABASE() AND table_name = 'certificates'"
    );
    const byName = Object.fromEntries(rows.map((row) => [row.name, row.nullable]));
    expect(Object.keys(byName)).toEqual(expect.arrayContaining(["id", "enrollment_id", "code", "issued_at"]));
    expect(byName.enrollment_id).toBe("NO");
    expect(byName.code).toBe("NO");
  });

  it("nhận chứng chỉ hợp lệ và tự điền issued_at", async () => {
    await pool.query("INSERT INTO certificates (enrollment_id, code) VALUES (1, 'RL-0001')");
    const rows = await select("SELECT enrollment_id AS enrollmentId, code, issued_at IS NOT NULL AS hasIssuedAt FROM certificates");
    expect(rows).toEqual([{ enrollmentId: 1, code: "RL-0001", hasIssuedAt: 1 }]);
  });

  it("từ chối chứng chỉ thứ hai cho cùng một ghi danh", async () => {
    await pool.query("INSERT INTO certificates (enrollment_id, code) VALUES (1, 'RL-0001')");
    await expect(pool.query("INSERT INTO certificates (enrollment_id, code) VALUES (1, 'RL-0002')")).rejects.toMatchObject({
      errno: 1062,
    });
  });

  it("từ chối mã chứng chỉ trùng giữa hai ghi danh khác nhau", async () => {
    await pool.query("INSERT INTO certificates (enrollment_id, code) VALUES (1, 'RL-0001')");
    await expect(pool.query("INSERT INTO certificates (enrollment_id, code) VALUES (2, 'RL-0001')")).rejects.toMatchObject({
      errno: 1062,
    });
  });

  it("từ chối chứng chỉ cho ghi danh không tồn tại", async () => {
    await expect(pool.query("INSERT INTO certificates (enrollment_id, code) VALUES (999, 'RL-0999')")).rejects.toMatchObject({
      errno: 1452,
    });
  });

  it("từ chối xóa ghi danh đã có chứng chỉ", async () => {
    await pool.query("INSERT INTO certificates (enrollment_id, code) VALUES (1, 'RL-0001')");
    await expect(pool.query("DELETE FROM enrollments WHERE id = 1")).rejects.toMatchObject({ errno: 1451 });
  });

  it("courses có cột is_published kiểu tinyint, bắt buộc có giá trị, mặc định 1; khóa cũ và khóa mới đều bằng 1", async () => {
    const columns = await select(
      "SELECT data_type AS dataType, is_nullable AS nullable, column_default AS columnDefault FROM information_schema.columns " +
        "WHERE table_schema = DATABASE() AND table_name = 'courses' AND column_name = 'is_published'"
    );
    expect(columns).toHaveLength(1);
    expect(columns[0].dataType).toBe("tinyint");
    expect(columns[0].nullable).toBe("NO");
    expect(String(columns[0].columnDefault)).toBe("1");
    await addEmptyCourse();
    const rows = await select("SELECT COUNT(*) AS total, SUM(is_published) AS published FROM courses");
    expect(rows[0].total).toBe(7);
    expect(Number(rows[0].published)).toBe(7);
  });

  it("có chỉ mục idx_courses_is_published bắt đầu từ cột is_published", async () => {
    const rows = await select(
      "SELECT index_name AS indexName, seq_in_index AS seq FROM information_schema.statistics " +
        "WHERE table_schema = DATABASE() AND table_name = 'courses' AND column_name = 'is_published'"
    );
    expect(rows).toContainEqual({ indexName: "idx_courses_is_published", seq: 1 });
  });
});

describe("Số bài học của mỗi khóa (courseLessonCounts)", () => {
  beforeEach(resetWithExtend);

  it("trả cột courseId, title, lessonCount và 6 khóa theo courseId tăng", async () => {
    const { rows, columns } = await run("courseLessonCounts");
    expect(columns).toEqual(["courseId", "title", "lessonCount"]);
    expect(rows).toEqual([
      { courseId: 1, title: "HTML và CSS cơ bản", lessonCount: 2 },
      { courseId: 2, title: "JavaScript cơ bản", lessonCount: 3 },
      { courseId: 3, title: "JavaScript nâng cao", lessonCount: 2 },
      { courseId: 4, title: "ReactJS", lessonCount: 4 },
      { courseId: 5, title: "NodeJS và Express", lessonCount: 2 },
      { courseId: 6, title: "Cơ sở dữ liệu MySQL", lessonCount: 2 },
    ]);
  });

  it("khóa chưa có bài học vẫn có mặt với lessonCount bằng 0", async () => {
    await addEmptyCourse();
    const { rows } = await run("courseLessonCounts");
    expect(rows).toHaveLength(7);
    expect(rows[6]).toEqual({ courseId: 7, title: "Docker cơ bản", lessonCount: 0 });
  });

  it("khóa chưa xuất bản (is_published = 0) không có trong kết quả", async () => {
    await addDraftCourse();
    const { rows } = await run("courseLessonCounts");
    expect(rows.map((row) => row.courseId)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("Học viên đang học theo khóa (activeStudentsPerCourse)", () => {
  beforeEach(resetOnly);

  it("đếm ghi danh active của mỗi khóa, nhiều trước, hòa thì courseId tăng; khóa không có ai đang học là 0", async () => {
    const { rows, columns } = await run("activeStudentsPerCourse");
    expect(columns).toEqual(["courseId", "title", "activeCount"]);
    expect(rows).toEqual([
      { courseId: 2, title: "JavaScript cơ bản", activeCount: 1 },
      { courseId: 3, title: "JavaScript nâng cao", activeCount: 1 },
      { courseId: 4, title: "ReactJS", activeCount: 1 },
      { courseId: 5, title: "NodeJS và Express", activeCount: 1 },
      { courseId: 6, title: "Cơ sở dữ liệu MySQL", activeCount: 1 },
      { courseId: 1, title: "HTML và CSS cơ bản", activeCount: 0 },
    ]);
  });

  it("khóa đông nhất lên đầu và khóa mới chưa ai ghi danh nằm cuối với số 0", async () => {
    await addEmptyCourse();
    await addEnrollment(11, 6, 3, "active", 20);
    const { rows } = await run("activeStudentsPerCourse");
    expect(rows.map((row) => [row.courseId, row.activeCount])).toEqual([
      [3, 2],
      [2, 1],
      [4, 1],
      [5, 1],
      [6, 1],
      [1, 0],
      [7, 0],
    ]);
  });
});

describe("Tiến độ trung bình theo khóa (averageProgressPerCourse)", () => {
  beforeEach(resetOnly);

  it("tính trung bình làm tròn 1 chữ số, bỏ ghi danh dropped, theo courseId tăng", async () => {
    const { rows, columns } = await run("averageProgressPerCourse");
    expect(columns).toEqual(["courseId", "title", "avgProgress"]);
    expect(rows.map((row) => [row.courseId, row.avgProgress])).toEqual([
      [1, 100],
      [2, 91.7],
      [3, 40],
      [4, 60],
      [5, 25],
      [6, 75],
    ]);
  });

  it("khóa chưa có ghi danh nào vẫn có mặt với avgProgress là NULL", async () => {
    await addEmptyCourse();
    const { rows } = await run("averageProgressPerCourse");
    expect(rows).toHaveLength(7);
    expect(rows[6]).toEqual({ courseId: 7, title: "Docker cơ bản", avgProgress: null });
  });

  it("khóa chỉ còn ghi danh dropped có avgProgress là NULL", async () => {
    await pool.query("UPDATE enrollments SET status = 'dropped' WHERE id = 5");
    const { rows } = await run("averageProgressPerCourse");
    expect(rows.find((row) => row.courseId === 3)).toEqual({ courseId: 3, title: "JavaScript nâng cao", avgProgress: null });
    expect(rows.find((row) => row.courseId === 4).avgProgress).toBe(60);
  });
});

describe("Học viên chưa ghi danh khóa nào (studentsWithoutEnrollment)", () => {
  beforeEach(resetOnly);

  it("dữ liệu mẫu: cả 5 học viên đều đã ghi danh nên không có hàng nào", async () => {
    const { rows } = await run("studentsWithoutEnrollment");
    expect(rows).toEqual([]);
  });

  it("trả id, fullName của học viên chưa ghi danh và bỏ qua tài khoản admin", async () => {
    await addIdleUsers();
    const { rows, columns } = await run("studentsWithoutEnrollment");
    expect(columns).toEqual(["id", "fullName"]);
    expect(rows).toEqual([{ id: 7, fullName: "Vũ Thanh Hà" }]);
  });

  it("học viên chỉ có ghi danh dropped vẫn được tính là đã ghi danh", async () => {
    await addIdleUsers();
    await addEnrollment(11, 7, 1, "dropped", 5);
    const { rows } = await run("studentsWithoutEnrollment");
    expect(rows).toEqual([]);
  });
});

describe("Khóa chưa ai ghi danh (unenrolledCourses)", () => {
  beforeEach(resetOnly);

  it("dữ liệu mẫu: cả 6 khóa đều có ghi danh nên không có hàng nào", async () => {
    const { rows } = await run("unenrolledCourses");
    expect(rows).toEqual([]);
  });

  it("trả id, title của khóa mới thêm chưa có ghi danh nào", async () => {
    await addEmptyCourse();
    await pool.query(
      "INSERT INTO courses (id, title, description, level, created_at) VALUES (8, 'Git và GitHub', '', 'beginner', '2026-08-08 09:00:00')"
    );
    const { rows, columns } = await run("unenrolledCourses");
    expect(columns).toEqual(["id", "title"]);
    expect(rows).toEqual([
      { id: 7, title: "Docker cơ bản" },
      { id: 8, title: "Git và GitHub" },
    ]);
  });
});

describe("Học viên hoàn thành nhiều khóa nhất (topCompletedStudents)", () => {
  beforeEach(resetOnly);

  it("dữ liệu mẫu: 3 học viên, hòa 1 khóa thì id nhỏ đứng trước", async () => {
    const { rows, columns } = await run("topCompletedStudents");
    expect(columns).toEqual(["userId", "fullName", "completedCount"]);
    expect(rows).toEqual([
      { userId: 2, fullName: "Nguyễn Văn An", completedCount: 2 },
      { userId: 3, fullName: "Trần Thị Bình", completedCount: 1 },
      { userId: 5, fullName: "Phạm Quốc Dũng", completedCount: 1 },
    ]);
  });

  it("chỉ lấy 3 người: học viên thứ tư cũng hoàn thành 1 khóa nhưng có id lớn hơn nên bị loại", async () => {
    await addEnrollment(11, 6, 1, "completed", 100);
    const { rows } = await run("topCompletedStudents");
    expect(rows.map((row) => row.userId)).toEqual([2, 3, 5]);
  });

  it("học viên hoàn thành nhiều khóa hơn lên đầu bảng dù id lớn", async () => {
    await addEnrollment(11, 6, 1, "completed", 100);
    await addEnrollment(12, 6, 3, "completed", 100);
    await addEnrollment(13, 6, 4, "completed", 100);
    const { rows } = await run("topCompletedStudents");
    expect(rows.map((row) => [row.userId, row.completedCount])).toEqual([
      [6, 3],
      [2, 2],
      [3, 1],
    ]);
  });
});

describe("Số khóa hoàn thành theo level (completionsByLevel)", () => {
  beforeEach(resetOnly);

  it("dữ liệu mẫu: chỉ level beginner có từ 2 ghi danh hoàn thành", async () => {
    const { rows, columns } = await run("completionsByLevel");
    expect(columns).toEqual(["level", "completedCount"]);
    expect(rows).toEqual([{ level: "beginner", completedCount: 4 }]);
  });

  it("level chỉ có 1 ghi danh hoàn thành bị HAVING loại", async () => {
    await pool.query("UPDATE enrollments SET status = 'completed', progress = 100 WHERE id = 3");
    const { rows } = await run("completionsByLevel");
    expect(rows).toEqual([{ level: "beginner", completedCount: 4 }]);
  });

  it("level đủ điều kiện xếp theo thứ tự cấp độ, không theo số lượng", async () => {
    await pool.query("UPDATE enrollments SET status = 'completed', progress = 100 WHERE id IN (3, 5, 7, 8)");
    await addEnrollment(11, 6, 3, "completed", 100);
    const { rows } = await run("completionsByLevel");
    expect(rows).toEqual([
      { level: "beginner", completedCount: 4 },
      { level: "intermediate", completedCount: 5 },
    ]);
  });
});

describe("Danh sách ghi danh của một học viên (studentEnrollments)", () => {
  beforeEach(resetOnly);

  it("học viên 2: ba ghi danh, mới ghi danh trước", async () => {
    const { rows, columns } = await run("studentEnrollments", [2]);
    expect(columns).toEqual(["enrollmentId", "studentName", "courseTitle", "status", "progress"]);
    expect(rows).toEqual([
      { enrollmentId: 3, studentName: "Nguyễn Văn An", courseTitle: "ReactJS", status: "active", progress: 60 },
      { enrollmentId: 2, studentName: "Nguyễn Văn An", courseTitle: "JavaScript cơ bản", status: "completed", progress: 100 },
      { enrollmentId: 1, studentName: "Nguyễn Văn An", courseTitle: "HTML và CSS cơ bản", status: "completed", progress: 100 },
    ]);
  });

  it("chỉ trả ghi danh của học viên được truyền vào; người chưa ghi danh nhận mảng rỗng", async () => {
    const dung = await run("studentEnrollments", [5]);
    expect(dung.rows.map((row) => row.enrollmentId)).toEqual([8, 9]);
    const admin = await run("studentEnrollments", [1]);
    expect(admin.rows).toEqual([]);
  });

  it("hai ghi danh cùng thời điểm thì id lớn hơn đứng trước", async () => {
    await pool.query("UPDATE enrollments SET enrolled_at = '2026-08-11 09:00:00' WHERE id IN (1, 2)");
    const { rows } = await run("studentEnrollments", [2]);
    expect(rows.map((row) => row.enrollmentId)).toEqual([3, 2, 1]);
  });
});

describe("Cập nhật tiến độ có điều kiện (updateProgress)", () => {
  beforeEach(resetOnly);

  it("tăng tiến độ của ghi danh đang học: 1 hàng bị tác động, các ghi danh khác nguyên vẹn", async () => {
    const before = await select("SELECT id, status, progress FROM enrollments ORDER BY id");
    const result = await write("updateProgress", [90, 6, 90]);
    expect(result.affectedRows).toBe(1);
    const after = await select("SELECT id, status, progress FROM enrollments ORDER BY id");
    const expected = before.map((row) => (row.id === 6 ? { ...row, progress: 90 } : row));
    expect(after).toEqual(expected);
  });

  it("không cho tiến độ giảm: 0 hàng bị tác động, tiến độ cũ giữ nguyên", async () => {
    const result = await write("updateProgress", [50, 6, 50]);
    expect(result.affectedRows).toBe(0);
    const rows = await select("SELECT progress FROM enrollments WHERE id = 6");
    expect(rows[0].progress).toBe(75);
  });

  it("không cập nhật ghi danh dropped", async () => {
    const result = await write("updateProgress", [90, 7, 90]);
    expect(result.affectedRows).toBe(0);
    const rows = await select("SELECT status, progress FROM enrollments WHERE id = 7");
    expect(rows[0]).toEqual({ status: "dropped", progress: 10 });
  });

  it("không cập nhật ghi danh đã completed", async () => {
    await pool.query("UPDATE enrollments SET progress = 90 WHERE id = 1");
    const result = await write("updateProgress", [95, 1, 95]);
    expect(result.affectedRows).toBe(0);
    const rows = await select("SELECT progress FROM enrollments WHERE id = 1");
    expect(rows[0].progress).toBe(90);
  });

  it("tiến độ lớn hơn 100 bị MySQL từ chối bằng ràng buộc CHECK", async () => {
    await expect(write("updateProgress", [101, 6, 101])).rejects.toMatchObject({ errno: 3819 });
    const rows = await select("SELECT progress FROM enrollments WHERE id = 6");
    expect(rows[0].progress).toBe(75);
  });
});

describe("Xóa ghi danh dropped tiến độ thấp (deleteDroppedEnrollments)", () => {
  beforeEach(resetOnly);

  it("ngưỡng 20 xóa đúng ghi danh 7 (dropped, tiến độ 10); 9 ghi danh còn lại nguyên vẹn", async () => {
    const result = await write("deleteDroppedEnrollments", [20]);
    expect(result.affectedRows).toBe(1);
    const rows = await select("SELECT id FROM enrollments ORDER BY id");
    expect(rows.map((row) => row.id)).toEqual([1, 2, 3, 4, 5, 6, 8, 9, 10]);
  });

  it("không xóa ghi danh active hay completed dù tiến độ dưới ngưỡng", async () => {
    await addEnrollment(11, 6, 1, "active", 5);
    await addEnrollment(12, 6, 2, "completed", 5);
    const result = await write("deleteDroppedEnrollments", [20]);
    expect(result.affectedRows).toBe(1);
    const rows = await select("SELECT id FROM enrollments WHERE id IN (11, 12) ORDER BY id");
    expect(rows.map((row) => row.id)).toEqual([11, 12]);
  });

  it("ngưỡng do người gọi truyền: 60 xóa thêm ghi danh dropped tiến độ 50, ngưỡng 5 không xóa gì", async () => {
    await addEnrollment(11, 6, 2, "dropped", 50);
    const none = await write("deleteDroppedEnrollments", [5]);
    expect(none.affectedRows).toBe(0);
    const both = await write("deleteDroppedEnrollments", [60]);
    expect(both.affectedRows).toBe(2);
    const rows = await select("SELECT COUNT(*) AS total FROM enrollments");
    expect(rows[0].total).toBe(9);
  });
});

describe("Cấp chứng chỉ hàng loạt (issueCertificates)", () => {
  beforeEach(resetWithExtend);

  it("cấp 4 chứng chỉ cho 4 ghi danh completed với mã là tiền tố cộng id ghi danh; ghi danh active, dropped không được cấp", async () => {
    const result = await write("issueCertificates", ["RL2026-"]);
    expect(result.affectedRows).toBe(4);
    const rows = await select("SELECT enrollment_id AS enrollmentId, code FROM certificates ORDER BY enrollment_id");
    expect(rows).toEqual([
      { enrollmentId: 1, code: "RL2026-1" },
      { enrollmentId: 2, code: "RL2026-2" },
      { enrollmentId: 4, code: "RL2026-4" },
      { enrollmentId: 9, code: "RL2026-9" },
    ]);
  });

  it("chạy lần hai không cấp thêm: 0 hàng bị tác động, tổng vẫn 4", async () => {
    await write("issueCertificates", ["RL2026-"]);
    const second = await write("issueCertificates", ["RL2026-"]);
    expect(second.affectedRows).toBe(0);
    const rows = await select("SELECT COUNT(*) AS total FROM certificates");
    expect(rows[0].total).toBe(4);
  });

  it("ghi danh đã có chứng chỉ giữ nguyên mã cũ, chỉ cấp cho 3 ghi danh còn lại", async () => {
    await pool.query("INSERT INTO certificates (enrollment_id, code) VALUES (2, 'CU-002')");
    const result = await write("issueCertificates", ["RL2026-"]);
    expect(result.affectedRows).toBe(3);
    const rows = await select("SELECT code FROM certificates WHERE enrollment_id = 2");
    expect(rows).toEqual([{ code: "CU-002" }]);
    const total = await select("SELECT COUNT(*) AS total FROM certificates");
    expect(total[0].total).toBe(4);
  });

  it("ghi danh vừa chuyển sang completed được cấp ở lần chạy sau", async () => {
    await write("issueCertificates", ["RL2026-"]);
    await pool.query("UPDATE enrollments SET status = 'completed', progress = 100 WHERE id = 6");
    const result = await write("issueCertificates", ["RL2026-"]);
    expect(result.affectedRows).toBe(1);
    const rows = await select("SELECT code FROM certificates WHERE enrollment_id = 6");
    expect(rows).toEqual([{ code: "RL2026-6" }]);
  });
});
