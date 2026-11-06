// ===== BÀI LÀM: loginLimiter =====
// TODO: dùng express-rate-limit: tối đa 5 yêu cầu mỗi 15 phút cho mỗi IP; vượt thì chuyển httpError 429 RATE_LIMITED
function loginLimiter(req, res, next) {
  next();
}

module.exports = loginLimiter;
