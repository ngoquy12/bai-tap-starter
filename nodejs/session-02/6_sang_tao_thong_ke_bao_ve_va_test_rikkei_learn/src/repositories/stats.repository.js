// ===== BÀI LÀM: stats.repository.js =====
const pool = require("../db/pool");

// { students, courses, enrollments }: số người dùng vai trò student, số khóa học, số ghi danh ở mọi trạng thái.
async function totals() {
  // TODO
  throw new Error("Chưa cài đặt totals");
}

// Tiến độ trung bình (làm tròn 1 chữ số) của các ghi danh active và completed; không có ghi danh nào thì 0.
async function averageProgress() {
  // TODO
  throw new Error("Chưa cài đặt averageProgress");
}

// Số ghi danh theo trạng thái, dạng { active, completed, dropped }; trạng thái không có hàng nào vẫn là 0.
async function enrollmentsByStatus() {
  // TODO
  throw new Error("Chưa cài đặt enrollmentsByStatus");
}

// Số ghi danh active và completed theo level của khóa học, dạng { beginner, intermediate, advanced }; level không có hàng nào vẫn là 0.
async function enrollmentsByLevel() {
  // TODO
  throw new Error("Chưa cài đặt enrollmentsByLevel");
}

// Mỗi khóa học một dòng: { courseId, title, studentCount, avgProgress }; chỉ tính ghi danh active và completed;
// khóa chưa có học viên vẫn có mặt với studentCount 0 và avgProgress 0. Sắp theo courseId tăng dần.
async function perCourse() {
  // TODO
  throw new Error("Chưa cài đặt perCourse");
}

// limit khóa học đông học viên nhất, dạng { courseId, title, studentCount }; đồng hạng xem đề.
async function topCourses(limit) {
  // TODO
  throw new Error("Chưa cài đặt topCourses");
}

module.exports = { totals, averageProgress, enrollmentsByStatus, enrollmentsByLevel, perCourse, topCourses };
