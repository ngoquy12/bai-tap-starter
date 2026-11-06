// ===== BÀI LÀM: requireApiKey =====
// TODO: chặn yêu cầu ghi dữ liệu thiếu hoặc sai khóa API (header x-api-key)
function requireApiKey(req, res, next) {
  next();
}

module.exports = requireApiKey;
