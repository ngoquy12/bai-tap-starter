// ===== BÀI LÀM: authenticate.js =====
const jwt = require("jsonwebtoken");
const config = require("../config/env");
const httpError = require("../errors/httpError");

// Đọc header Authorization: Bearer <token>, kiểm tra token và gắn req.user = { id, role }.
function authenticate(req, res, next) {
  // TODO: thiếu header, sai kiểu, sai chữ ký, sửa payload hay hết hạn đều chuyển lỗi 401 (thông báo cố định trong đề)
  // TODO: thành công thì gắn req.user với id là SỐ (sub trong token là chuỗi)
  next();
}

module.exports = authenticate;
