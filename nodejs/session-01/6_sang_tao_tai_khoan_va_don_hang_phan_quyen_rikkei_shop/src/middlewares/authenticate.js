// ===== BÀI LÀM: authenticate =====
// TODO: đọc header Authorization: Bearer <token>, kiểm tra token; hợp lệ thì gắn req.user = { id, role }, sai thì chuyển httpError 401
function authenticate(req, res, next) {
  next();
}

module.exports = authenticate;
