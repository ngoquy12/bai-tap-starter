// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Đứng sau mọi router: yêu cầu nào tới đây tức là không có route nào khớp
const httpError = require("../errors/httpError");

function notFound(req, res, next) {
  next(httpError(404, "NOT_FOUND", "Không tìm thấy đường dẫn"));
}

module.exports = notFound;
// ===== HẾT MÃ NỀN =====
