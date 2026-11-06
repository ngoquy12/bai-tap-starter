// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Hàm tạo lỗi có mã trạng thái HTTP, mã lỗi và chi tiết (tùy chọn).
function httpError(status, code, message, details) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  if (details) error.details = details;
  return error;
}

module.exports = httpError;
// ===== HẾT MÃ NỀN =====
