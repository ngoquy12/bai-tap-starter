// Ký token JWT trực tiếp để test không phải gọi /auth/login (đăng nhập bị giới hạn 5 lần mỗi tệp test).
const jwt = require("jsonwebtoken");

// tokenFor(2, "customer"): token hợp lệ 1 giờ; options ghi đè (ví dụ { expiresIn: "1s" })
function tokenFor(id, role, options = {}) {
  return jwt.sign({ sub: String(id), role }, process.env.JWT_SECRET, { expiresIn: "1h", ...options });
}

module.exports = { tokenFor };
