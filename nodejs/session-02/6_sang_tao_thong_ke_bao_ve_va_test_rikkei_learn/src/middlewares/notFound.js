// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const httpError = require("../errors/httpError");

// Đường dẫn không khớp route nào: chuyển cho errorHandler tạo phản hồi chuẩn.
function notFound(req, res, next) {
  next(httpError(404, "NOT_FOUND", "Không tìm thấy đường dẫn"));
}

module.exports = notFound;
// ===== HẾT MÃ NỀN =====
