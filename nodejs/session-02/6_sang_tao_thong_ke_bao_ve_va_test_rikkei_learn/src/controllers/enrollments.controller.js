// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const enrollmentsRepository = require("../repositories/enrollments.repository");
const httpError = require("../errors/httpError");

// GET /me/enrollments: ghi danh của chính người đang đăng nhập (id lấy từ token, không từ URL).
async function listMyEnrollments(req, res) {
  res.json(await enrollmentsRepository.findByUser(req.user.id));
}

// POST /courses/:id/enroll: ghi danh người đang đăng nhập vào khóa học; mọi lỗi nghiệp vụ do enrollStudent ném.
async function enrollInCourse(req, res) {
  const enrollment = await enrollmentsRepository.enrollStudent(req.user.id, req.params.id);
  res.status(201).json(enrollment);
}

// PATCH /enrollments/:id/progress: chỉ chủ ghi danh hoặc admin được sửa (kiểm tra quyền sở hữu).
async function updateEnrollmentProgress(req, res) {
  const enrollment = await enrollmentsRepository.findById(req.params.id);
  if (!enrollment) {
    throw httpError(404, "NOT_FOUND", "Không tìm thấy ghi danh");
  }
  if (req.user.role !== "admin" && enrollment.userId !== req.user.id) {
    throw httpError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này");
  }
  res.json(await enrollmentsRepository.updateProgress(enrollment.id, req.body.progress));
}

module.exports = { listMyEnrollments, enrollInCourse, updateEnrollmentProgress };
// ===== HẾT MÃ NỀN =====
