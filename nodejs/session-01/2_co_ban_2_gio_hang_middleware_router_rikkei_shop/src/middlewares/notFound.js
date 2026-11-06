// ===== BÀI LÀM: notFound =====
// TODO: báo đường dẫn không tồn tại theo định dạng lỗi chuẩn của API
function notFound(req, res, next) {
  next();
}

module.exports = notFound;
