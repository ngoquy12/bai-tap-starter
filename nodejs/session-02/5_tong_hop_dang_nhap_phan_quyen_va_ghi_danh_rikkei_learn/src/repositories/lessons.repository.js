// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const pool = require("../db/pool");

// Các bài học của một khóa học, theo thứ tự position; khóa không có bài học thì trả mảng rỗng.
async function findByCourse(courseId) {
  const [rows] = await pool.execute(
    "SELECT id, title, position FROM lessons WHERE course_id = ? ORDER BY position",
    [courseId]
  );
  return rows;
}

module.exports = { findByCourse };
// ===== HẾT MÃ NỀN =====
