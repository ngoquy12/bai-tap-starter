// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const jwt = require("jsonwebtoken");
const config = require("../config/env");
const httpError = require("../errors/httpError");

// Đọc header Authorization: Bearer <token>, kiểm tra token và gắn req.user = { id, role }.
// Thiếu, sai chữ ký hay hết hạn đều là 401 với cùng một thông báo.
function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(httpError(401, "UNAUTHORIZED", "Thiếu hoặc sai mã xác thực"));
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    // sub là chuỗi trong token, đổi lại thành số để so sánh với id trong cơ sở dữ liệu.
    req.user = { id: Number(payload.sub), role: payload.role };
    next();
  } catch (error) {
    next(httpError(401, "UNAUTHORIZED", "Thiếu hoặc sai mã xác thực"));
  }
}

module.exports = authenticate;
// ===== HẾT MÃ NỀN =====
