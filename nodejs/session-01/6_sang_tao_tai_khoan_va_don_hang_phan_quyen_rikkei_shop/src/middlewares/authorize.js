// ===== BÀI LÀM: authorize =====
// TODO: authorize(...roles) trả về middleware; vai trò của req.user không nằm trong roles thì chuyển httpError 403
function authorize(...roles) {
  return function checkRole(req, res, next) {
    next();
  };
}

module.exports = authorize;
