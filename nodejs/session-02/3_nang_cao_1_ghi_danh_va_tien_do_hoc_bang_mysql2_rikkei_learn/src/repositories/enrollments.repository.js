// ===== BÀI LÀM: enrollments.repository.js =====
const pool = require("../db/pool");
const httpError = require("../errors/httpError");

// ===== Mã nền (có sẵn, KHÔNG sửa) =====
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
// ===== HẾT MÃ NỀN =====

// TODO: viết các hàm dưới đây theo đề bài. Có thể thêm hàm phụ của riêng bạn trong tệp này.

// Mọi ghi danh của một học viên (kể cả đã rút), theo id tăng dần.
async function findByUser(userId) {
  throw new Error("Chưa làm: findByUser");
}

// Ghi danh học viên vào một khóa học trong một giao dịch.
async function enrollStudent(userId, courseId) {
  throw new Error("Chưa làm: enrollStudent");
}

// Ghi danh học viên vào nhiều khóa học trong một giao dịch: một khóa lỗi thì không khóa nào được ghi danh.
async function enrollStudentInCourses(userId, courseIds) {
  throw new Error("Chưa làm: enrollStudentInCourses");
}

// Cập nhật tiến độ của một ghi danh.
async function updateProgress(enrollmentId, progress) {
  throw new Error("Chưa làm: updateProgress");
}

// Rút khỏi khóa học.
async function dropEnrollment(enrollmentId) {
  throw new Error("Chưa làm: dropEnrollment");
}

module.exports = { findById, findByUser, enrollStudent, enrollStudentInCourses, updateProgress, dropEnrollment };
