// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Middleware lỗi (đúng 4 tham số): nơi duy nhất biến lỗi thành phản hồi JSON chuẩn.
function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "JSON không hợp lệ" } });
  }
  if (err.status && err.code) {
    const body = { code: err.code, message: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json({ error: body });
  }
  console.error(err); // chỉ ghi nhật ký, không trả chi tiết cho client
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Lỗi máy chủ" } });
}

module.exports = errorHandler;
// ===== HẾT MÃ NỀN =====
