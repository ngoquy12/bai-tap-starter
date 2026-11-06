// ===== BÀI LÀM: auth.controller =====
// Giữ nguyên tên hàm; không bao giờ trả passwordHash trong response.

// TODO: POST /auth/register, trả 201 và người dùng công khai { id, email, fullName, role }
async function register(req, res) {
  res.sendStatus(501);
}

// TODO: POST /auth/login, trả 200 { token, user }
async function login(req, res) {
  res.sendStatus(501);
}

// TODO: GET /auth/me, trả người dùng công khai của chính mình
async function me(req, res) {
  res.sendStatus(501);
}

module.exports = { register, login, me };
