// ===== BÀI LÀM: courses.controller.js =====
const coursesRepository = require("../repositories/courses.repository");
const lessonsRepository = require("../repositories/lessons.repository");
const httpError = require("../errors/httpError");

// Controller đọc req, gọi repository, chọn mã trạng thái và trả JSON; không viết SQL ở đây.

// TODO: GET /courses, trả { data, meta: { page, limit, total, totalPages } }.
async function listCourses(req, res) {
  throw new Error("Chưa làm: listCourses");
}

// TODO: GET /courses/:id (404 khi không có).
async function getCourse(req, res) {
  throw new Error("Chưa làm: getCourse");
}

// TODO: GET /courses/:id/lessons (404 khi khóa không có).
async function listCourseLessons(req, res) {
  throw new Error("Chưa làm: listCourseLessons");
}

// TODO: POST /courses (201).
async function createCourse(req, res) {
  throw new Error("Chưa làm: createCourse");
}

// TODO: PATCH /courses/:id (404 khi không có).
async function updateCourse(req, res) {
  throw new Error("Chưa làm: updateCourse");
}

// TODO: DELETE /courses/:id (204; 404 khi không có).
async function deleteCourse(req, res) {
  throw new Error("Chưa làm: deleteCourse");
}

module.exports = { listCourses, getCourse, listCourseLessons, createCourse, updateCourse, deleteCourse };
