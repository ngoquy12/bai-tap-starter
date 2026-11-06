// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const httpError = require("../errors/httpError");

// authorize("admin") trả về middleware kiểm req.user.role; phải đứng SAU authenticate.
function authorize(...roles) {
  return function checkRole(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(httpError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này"));
    }
    next();
  };
}

module.exports = authorize;
// ===== HẾT MÃ NỀN =====
