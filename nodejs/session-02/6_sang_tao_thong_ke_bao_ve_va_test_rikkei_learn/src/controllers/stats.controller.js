// ===== BÀI LÀM: stats.controller.js =====
const statsRepository = require("../repositories/stats.repository");

// GET /stats: trả { totals, averageProgress, byStatus, byLevel, perCourse, topCourses } theo đề.
async function getStats(req, res) {
  // TODO
  throw new Error("Chưa cài đặt getStats");
}

module.exports = { getStats };
