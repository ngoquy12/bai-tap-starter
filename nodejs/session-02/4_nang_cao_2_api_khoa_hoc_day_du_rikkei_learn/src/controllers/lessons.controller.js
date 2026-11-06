// ===== BÀI LÀM: lessons.controller.js =====
const coursesRepository = require("../repositories/courses.repository");
const lessonsRepository = require("../repositories/lessons.repository");
const httpError = require("../errors/httpError");

// Controller đọc req, gọi repository, chọn mã trạng thái và trả JSON; không viết SQL ở đây.

// TODO: POST /courses/:id/lessons (201; 404 khi khóa không có).
async function createLesson(req, res) {
  throw new Error("Chưa làm: createLesson");
}

// TODO: PATCH /courses/:id/lessons/:lessonId (404 khi khóa hoặc bài học không có).
async function updateLesson(req, res) {
  throw new Error("Chưa làm: updateLesson");
}

// TODO: DELETE /courses/:id/lessons/:lessonId (204; 404 khi khóa hoặc bài học không có).
async function deleteLesson(req, res) {
  throw new Error("Chưa làm: deleteLesson");
}

module.exports = { createLesson, updateLesson, deleteLesson };
