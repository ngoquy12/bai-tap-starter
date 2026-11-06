// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Bọc handler async: promise bị từ chối được chuyển sang next để tới errorHandler
function asyncHandler(handler) {
  return function (req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
// ===== HẾT MÃ NỀN =====
