// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const coursesRepository = require("../repositories/courses.repository");
const lessonsRepository = require("../repositories/lessons.repository");
const httpError = require("../errors/httpError");

// Tìm khóa học theo id hoặc báo 404; dùng chung cho các route có :id.
async function requireCourse(id) {
  const course = await coursesRepository.findById(id);
  if (!course) {
    throw httpError(404, "NOT_FOUND", "Không tìm thấy khóa học");
  }
  return course;
}

// GET /courses: một trang khóa học kèm meta phân trang.
async function listCourses(req, res) {
  const filters = req.query;
  const data = await coursesRepository.findAll(filters);
  const total = await coursesRepository.count(filters);
  res.json({
    data,
    meta: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) },
  });
}

// GET /courses/:id
async function getCourse(req, res) {
  res.json(await requireCourse(req.params.id));
}

// GET /courses/:id/lessons: mảng bài học (không phân trang).
async function listCourseLessons(req, res) {
  await requireCourse(req.params.id);
  res.json(await lessonsRepository.findByCourse(req.params.id));
}

// POST /courses
async function createCourse(req, res) {
  const course = await coursesRepository.create(req.body);
  res.status(201).json(course);
}

// PUT và PATCH /courses/:id: trộn dữ liệu gửi lên vào khóa học hiện có rồi ghi lại.
async function updateCourse(req, res) {
  const current = await requireCourse(req.params.id);
  const course = await coursesRepository.update(req.params.id, { ...current, ...req.body });
  res.json(course);
}

// DELETE /courses/:id: bài học bị xóa theo (ON DELETE CASCADE); khóa đã có ghi danh thì MySQL từ chối.
async function deleteCourse(req, res) {
  const removed = await coursesRepository.remove(req.params.id);
  if (!removed) {
    throw httpError(404, "NOT_FOUND", "Không tìm thấy khóa học");
  }
  res.sendStatus(204);
}

module.exports = { listCourses, getCourse, listCourseLessons, createCourse, updateCourse, deleteCourse };
// ===== HẾT MÃ NỀN =====
