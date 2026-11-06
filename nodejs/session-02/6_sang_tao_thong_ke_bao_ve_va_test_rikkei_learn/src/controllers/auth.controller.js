// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/env");
const usersRepository = require("../repositories/users.repository");
const httpError = require("../errors/httpError");

// Chỉ chọn các trường công khai: passwordHash không bao giờ rời khỏi máy chủ.
function toPublicUser(user) {
  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
}

// POST /auth/register: băm mật khẩu rồi tạo tài khoản student; trả người dùng công khai (201).
async function register(req, res) {
  const { email, password, fullName } = req.body;
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  const user = await usersRepository.create({ email, passwordHash, fullName });
  res.status(201).json(toPublicUser(user));
}

// POST /auth/login: email lạ và mật khẩu sai dùng chung một thông báo để không lộ email nào đã đăng ký.
async function login(req, res) {
  const { email, password } = req.body;
  const user = await usersRepository.findByEmail(email);
  const matched = user !== null && (await bcrypt.compare(password, user.passwordHash));
  if (!matched) {
    throw httpError(401, "UNAUTHORIZED", "Email hoặc mật khẩu không đúng");
  }
  // sub là chuỗi theo chuẩn JWT; authenticate sẽ đổi lại thành số.
  const token = jwt.sign({ sub: String(user.id), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
  res.json({ token, user: toPublicUser(user) });
}

// GET /auth/me: thông tin công khai của người đang đăng nhập (đọc lại từ cơ sở dữ liệu).
async function me(req, res) {
  const user = await usersRepository.findById(req.user.id);
  if (!user) {
    throw httpError(401, "UNAUTHORIZED", "Thiếu hoặc sai mã xác thực");
  }
  res.json(toPublicUser(user));
}

module.exports = { register, login, me };
// ===== HẾT MÃ NỀN =====
