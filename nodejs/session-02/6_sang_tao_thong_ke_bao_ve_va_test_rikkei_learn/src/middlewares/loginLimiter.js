// ===== BÀI LÀM: loginLimiter.js =====
const rateLimit = require("express-rate-limit");
const httpError = require("../errors/httpError");

// TODO: dùng rateLimit({...}) để giới hạn đăng nhập theo đề; xuất middleware đã tạo.
function loginLimiter(req, res, next) {
  next();
}

module.exports = loginLimiter;
