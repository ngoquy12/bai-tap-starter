// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Bọc handler async: lỗi của promise được chuyển sang next để tới errorHandler.
function asyncHandler(handler) {
  return function (req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
// ===== HẾT MÃ NỀN =====
