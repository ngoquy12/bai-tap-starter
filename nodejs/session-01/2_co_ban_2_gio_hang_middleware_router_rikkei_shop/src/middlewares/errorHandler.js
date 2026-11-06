// ===== BÀI LÀM: errorHandler =====
// TODO: biến mọi loại lỗi thành { error: { code, message, details? } }
function errorHandler(err, req, res, next) {
  next(err);
}

module.exports = errorHandler;
