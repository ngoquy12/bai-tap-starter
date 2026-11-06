// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const httpError = require("../errors/httpError");

// Áp schema lên req.body, req.query hoặc req.params; sai thì chuyển lỗi 400, đúng thì thay nguồn bằng dữ liệu đã làm sạch.
function validate(schema, source) {
  return function validateRequest(req, res, next) {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(httpError(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", details));
    }
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
// ===== HẾT MÃ NỀN =====
