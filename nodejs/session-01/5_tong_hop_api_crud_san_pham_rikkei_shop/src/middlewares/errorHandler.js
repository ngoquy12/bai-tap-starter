// ===== BÀI LÀM: errorHandler =====
// TODO: biến mọi lỗi thành { error: { code, message, details? } } theo bảng lỗi trong đề bài.
// Hiện chỉ chuyển lỗi cho trình xử lý mặc định của Express nên client nhận trang HTML.
function errorHandler(error, req, res, next) {
  next(error);
}

module.exports = errorHandler;
