// ===== BÀI LÀM: auth.schema.js =====
const { z } = require("zod");

// Đăng ký: email chuẩn hóa chữ thường, mật khẩu 8 đến 72 ký tự, họ tên không rỗng.
// TODO: thông báo lỗi cố định ở bảng trong đề; trường lạ như role không được lọt vào kết quả
const registerSchema = z.object({});

// Đăng nhập: cần đủ email và password; đúng hay sai do controller quyết định.
// TODO: email chuẩn hóa chữ thường như đăng ký
const loginSchema = z.object({});

module.exports = { registerSchema, loginSchema };
