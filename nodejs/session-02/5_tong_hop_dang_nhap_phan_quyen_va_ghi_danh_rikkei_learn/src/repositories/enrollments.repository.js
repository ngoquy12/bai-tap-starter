// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const pool = require("../db/pool");
const httpError = require("../errors/httpError");

// Ghi danh kèm tên khóa học, đổi snake_case sang camelCase bằng AS.
const SELECT_ENROLLMENT =
  "SELECT e.id, e.user_id AS userId, e.course_id AS courseId, c.title AS courseTitle, " +
  "e.status, e.progress, e.enrolled_at AS enrolledAt " +
  "FROM enrollments e JOIN courses c ON c.id = e.course_id";

// Một ghi danh theo id; không có thì trả null.
async function findById(id) {
  const [rows] = await pool.execute(SELECT_ENROLLMENT + " WHERE e.id = ?", [id]);
  return rows[0] || null;
}

// Mọi ghi danh của một học viên, theo id tăng dần.
async function findByUser(userId) {
  const [rows] = await pool.execute(SELECT_ENROLLMENT + " WHERE e.user_id = ? ORDER BY e.id", [userId]);
  return rows;
}

// Ghi danh học viên vào khóa học trong MỘT giao dịch: hoặc xong trọn vẹn, hoặc không đổi gì.
// Ghi danh đã hủy (dropped) được kích hoạt lại trên cùng bản ghi, tiến độ cũ được giữ nguyên.
async function enrollStudent(userId, courseId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [courses] = await connection.execute("SELECT id FROM courses WHERE id = ?", [courseId]);
    if (courses.length === 0) {
      throw httpError(404, "NOT_FOUND", "Không tìm thấy khóa học");
    }
    const [lessons] = await connection.execute("SELECT COUNT(*) AS total FROM lessons WHERE course_id = ?", [courseId]);
    if (lessons[0].total === 0) {
      throw httpError(409, "CONFLICT", "Khóa học chưa có bài học");
    }

    const [existing] = await connection.execute(
      "SELECT id, status FROM enrollments WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );
    let enrollmentId;
    if (existing.length > 0) {
      if (existing[0].status !== "dropped") {
        throw httpError(409, "CONFLICT", "Học viên đã ghi danh khóa học này");
      }
      await connection.execute("UPDATE enrollments SET status = 'active' WHERE id = ?", [existing[0].id]);
      enrollmentId = existing[0].id;
    } else {
      const [result] = await connection.execute(
        "INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)",
        [userId, courseId]
      );
      enrollmentId = result.insertId;
    }

    await connection.commit();
    return findById(enrollmentId);
  } catch (error) {
    await connection.rollback();
    // Lỗi MySQL đổi thành lỗi HTTP theo error.code.
    if (error.code === "ER_DUP_ENTRY") {
      throw httpError(409, "CONFLICT", "Học viên đã ghi danh khóa học này");
    }
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      throw httpError(400, "VALIDATION_ERROR", "Học viên không tồn tại");
    }
    throw error;
  } finally {
    connection.release();
  }
}

// Cập nhật tiến độ: số nguyên 0-100, không được giảm, ghi danh đã hủy không cập nhật được.
// Đủ 100 thì chuyển completed, dưới 100 thì active. Không có ghi danh thì trả null.
async function updateProgress(enrollmentId, progress) {
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
    throw httpError(400, "VALIDATION_ERROR", "Tiến độ phải là số nguyên từ 0 đến 100");
  }
  const enrollment = await findById(enrollmentId);
  if (!enrollment) return null;
  if (enrollment.status === "dropped") {
    throw httpError(409, "CONFLICT", "Ghi danh đã bị hủy, không thể cập nhật tiến độ");
  }
  if (progress < enrollment.progress) {
    throw httpError(409, "CONFLICT", "Tiến độ không được giảm");
  }
  const status = progress === 100 ? "completed" : "active";
  await pool.execute("UPDATE enrollments SET progress = ?, status = ? WHERE id = ?", [progress, status, enrollmentId]);
  return findById(enrollmentId);
}

// Rút khỏi khóa học: đổi status thành dropped, giữ nguyên bản ghi và tiến độ.
// Khóa đã hoàn thành hoặc ghi danh đã hủy thì 409; không có ghi danh thì trả null.
async function dropEnrollment(enrollmentId) {
  const enrollment = await findById(enrollmentId);
  if (!enrollment) return null;
  if (enrollment.status === "dropped") {
    throw httpError(409, "CONFLICT", "Ghi danh đã bị hủy trước đó");
  }
  if (enrollment.status === "completed") {
    throw httpError(409, "CONFLICT", "Khóa học đã hoàn thành, không thể rút");
  }
  await pool.execute("UPDATE enrollments SET status = 'dropped' WHERE id = ?", [enrollmentId]);
  return findById(enrollmentId);
}
// ===== HẾT MÃ NỀN =====

// ===== BÀI LÀM: findAll, count (danh sách ghi danh cho quản trị viên) =====
// Một trang ghi danh của mọi học viên theo bộ lọc { page, limit, courseId, status }, id tăng dần.
// Mỗi mục gồm các trường như findById và thêm studentName (họ tên học viên, JOIN bảng users).
async function findAll(filters) {
  // TODO: WHERE ghép từ courseId, status (mọi giá trị đi qua dấu ?), ORDER BY e.id, LIMIT và OFFSET
  return [];
}

// Tổng số ghi danh khớp cùng bộ lọc (để tính meta.total).
async function count(filters) {
  // TODO
  return 0;
}

module.exports = { findById, findByUser, enrollStudent, updateProgress, dropEnrollment, findAll, count };
