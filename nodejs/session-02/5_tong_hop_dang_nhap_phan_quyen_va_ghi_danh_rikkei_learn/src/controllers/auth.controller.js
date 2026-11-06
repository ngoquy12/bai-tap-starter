// ===== BÀI LÀM: auth.controller.js =====
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/env");
const usersRepository = require("../repositories/users.repository");
const httpError = require("../errors/httpError");

// Chỉ chọn các trường công khai: passwordHash không bao giờ rời khỏi máy chủ.
function toPublicUser(user) {
  // TODO: trả { id, email, fullName, role }
  return {};
}

// POST /auth/register: băm mật khẩu rồi tạo tài khoản; trả người dùng công khai (201).
async function register(req, res) {
  // TODO
  throw new Error("Chưa cài đặt");
}

// POST /auth/login: email lạ và mật khẩu sai dùng chung một thông báo; thành công trả { token, user }.
async function login(req, res) {
  // TODO
  throw new Error("Chưa cài đặt");
}

// GET /auth/me: thông tin công khai của người đang đăng nhập (đọc lại từ cơ sở dữ liệu).
async function me(req, res) {
  // TODO
  throw new Error("Chưa cài đặt");
}

module.exports = { register, login, me };
