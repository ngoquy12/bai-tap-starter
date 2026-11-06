// ===== BÀI LÀM: auth.schema =====
// Luật dữ liệu vào cho đăng ký và đăng nhập, viết bằng zod. Giữ nguyên hai tên xuất.
const { z } = require("zod");

// TODO: email (bỏ khoảng trắng, chữ thường), password (8 đến 72 ký tự), fullName; trường role do client gửi phải bị bỏ đi
const registerSchema = z.object({});

// TODO: email và password bắt buộc
const loginSchema = z.object({});

module.exports = { registerSchema, loginSchema };
