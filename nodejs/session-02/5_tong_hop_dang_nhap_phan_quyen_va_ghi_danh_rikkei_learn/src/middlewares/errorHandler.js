// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const { ZodError } = require("zod");

// Middleware lỗi (đúng 4 tham số): nơi duy nhất biến lỗi thành phản hồi JSON chuẩn.
function errorHandler(err, req, res, next) {
  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Lỗi máy chủ";
  let details;

  if (err.type === "entity.parse.failed") {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "JSON không hợp lệ";
  } else if (err instanceof ZodError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Dữ liệu không hợp lệ";
    details = err.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }));
  } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
    // Khóa ngoại trỏ tới hàng không tồn tại.
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Dữ liệu tham chiếu không tồn tại";
  } else if (err.code === "ER_ROW_IS_REFERENCED_2") {
    // Hàng đang được bảng khác tham chiếu (khóa học đã có ghi danh) nên không xóa được.
    status = 409;
    code = "CONFLICT";
    message = "Khóa học đã có học viên ghi danh, không thể xóa";
  } else if (err.code === "ER_DUP_ENTRY") {
    status = 409;
    code = "CONFLICT";
    message = "Dữ liệu đã tồn tại";
  } else if (typeof err.status === "number" && err.code) {
    // Lỗi do httpError tạo.
    ({ status, code, message, details } = err);
  } else {
    console.error(err); // chỉ ghi nhật ký, không trả chi tiết cho client
  }

  const body = { error: { code, message } };
  if (details) body.error.details = details;
  res.status(status).json(body);
}

module.exports = errorHandler;
// ===== HẾT MÃ NỀN =====
