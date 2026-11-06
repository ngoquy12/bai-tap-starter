// ===== BÀI LÀM: errorHandler.js =====
// Middleware lỗi (đúng 4 tham số): nơi duy nhất biến lỗi thành phản hồi JSON chuẩn.
function errorHandler(err, req, res, next) {
  // TODO: đổi từng loại lỗi thành phản hồi { error: { code, message, details? } } theo bảng trong đề.
  // Hiện tại mọi lỗi đều thành 500.
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Lỗi máy chủ" } });
}

module.exports = errorHandler;
