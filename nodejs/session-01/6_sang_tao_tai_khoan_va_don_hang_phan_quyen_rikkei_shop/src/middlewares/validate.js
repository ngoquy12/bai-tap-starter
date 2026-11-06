// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Áp schema zod lên req.body, req.query hoặc req.params; hợp lệ thì thay nguồn bằng dữ liệu đã làm sạch
const httpError = require("../errors/httpError");

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
