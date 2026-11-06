// ===== BÀI LÀM: enrollments.controller.js =====
const enrollmentsRepository = require("../repositories/enrollments.repository");
const httpError = require("../errors/httpError");

// GET /me/enrollments: ghi danh của chính người đang đăng nhập (id lấy từ token, không từ URL).
async function listMyEnrollments(req, res) {
  // TODO
  throw new Error("Chưa cài đặt");
}

// POST /courses/:id/enroll: ghi danh người đang đăng nhập vào khóa học bằng enrollStudent (201).
async function enrollInCourse(req, res) {
  // TODO
  throw new Error("Chưa cài đặt");
}

// PATCH /enrollments/:id/progress: chỉ chủ ghi danh hoặc admin được sửa (404 trước 403).
async function updateEnrollmentProgress(req, res) {
  // TODO
  throw new Error("Chưa cài đặt");
}

// DELETE /enrollments/:id: rút khỏi khóa học bằng dropEnrollment (chủ ghi danh hoặc admin), trả 204.
async function deleteEnrollment(req, res) {
  // TODO
  throw new Error("Chưa cài đặt");
}

// GET /enrollments (admin): một trang ghi danh của mọi học viên kèm meta phân trang.
async function listEnrollments(req, res) {
  // TODO
  throw new Error("Chưa cài đặt");
}

module.exports = {
  listMyEnrollments,
  enrollInCourse,
  updateEnrollmentProgress,
  deleteEnrollment,
  listEnrollments,
};
