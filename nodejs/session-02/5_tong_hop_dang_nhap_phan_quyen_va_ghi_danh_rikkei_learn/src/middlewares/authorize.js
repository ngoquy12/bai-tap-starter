// ===== BÀI LÀM: authorize.js =====
const httpError = require("../errors/httpError");

// authorize("admin") trả về middleware kiểm req.user.role; phải đứng SAU authenticate.
function authorize(...roles) {
  return function checkRole(req, res, next) {
    // TODO: vai trò không nằm trong roles thì chuyển lỗi 403 (thông báo cố định trong đề)
    next();
  };
}

module.exports = authorize;
