// Ký token JWT trực tiếp cho test (không cần gọi /auth/login). KHÔNG sửa tệp này.
const jwt = require("jsonwebtoken");
const config = require("../../src/config/env");

// Token hợp lệ cho người dùng có id và vai trò cho trước; sub là CHUỖI theo chuẩn JWT.
function tokenFor(id, role) {
  return jwt.sign({ sub: String(id), role }, config.jwtSecret, { expiresIn: "1h" });
}

// Token đã hết hạn một phút trước.
function expiredTokenFor(id, role) {
  const exp = Math.floor(Date.now() / 1000) - 60;
  return jwt.sign({ sub: String(id), role, exp }, config.jwtSecret);
}

// Token ký bằng khóa bí mật khác (giả mạo).
function forgedTokenFor(id, role) {
  return jwt.sign({ sub: String(id), role }, "khoa-bi-mat-cua-ke-gia-mao", { expiresIn: "1h" });
}

// Token của học viên nhưng payload bị sửa thành admin, giữ nguyên chữ ký cũ.
function tamperedToAdmin(id) {
  const [header, payload, signature] = tokenFor(id, "student").split(".");
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  data.role = "admin";
  const forged = Buffer.from(JSON.stringify(data)).toString("base64url");
  return [header, forged, signature].join(".");
}

module.exports = { tokenFor, expiredTokenFor, forgedTokenFor, tamperedToAdmin };
