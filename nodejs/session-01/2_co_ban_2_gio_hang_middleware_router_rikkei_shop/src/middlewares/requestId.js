// ===== BÀI LÀM: requestId =====
// TODO: gắn mã yêu cầu vào header phản hồi X-Request-Id rồi chuyển tiếp
function requestId(req, res, next) {
  next();
}

module.exports = requestId;
