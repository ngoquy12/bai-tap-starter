// ===== Mã nền (có sẵn, KHÔNG sửa) =====
const { z } = require("zod");

// Đăng ký: email chuẩn hóa chữ thường, mật khẩu 8 đến 72 ký tự (bcrypt chỉ đọc 72 byte đầu).
// Trường lạ như role bị zod bỏ khỏi kết quả nên tài khoản mới luôn là student.
const registerSchema = z.object({
  email: z
    .string({ required_error: "Email là bắt buộc", invalid_type_error: "Email phải là chuỗi" })
    .trim()
    .toLowerCase()
    .email("Email không hợp lệ")
    .max(100, "Email tối đa 100 ký tự"),
  password: z
    .string({ required_error: "Mật khẩu là bắt buộc", invalid_type_error: "Mật khẩu phải là chuỗi" })
    .min(8, "Mật khẩu phải có từ 8 đến 72 ký tự")
    .max(72, "Mật khẩu phải có từ 8 đến 72 ký tự"),
  fullName: z
    .string({ required_error: "Họ tên không được để trống", invalid_type_error: "Họ tên phải là chuỗi" })
    .trim()
    .min(1, "Họ tên không được để trống")
    .max(100, "Họ tên tối đa 100 ký tự"),
});

// Đăng nhập chỉ cần có đủ hai trường; đúng hay sai do controller quyết định để thông báo không tiết lộ gì.
const loginSchema = z.object({
  email: z
    .string({ required_error: "Email là bắt buộc", invalid_type_error: "Email phải là chuỗi" })
    .trim()
    .toLowerCase()
    .min(1, "Email là bắt buộc"),
  password: z
    .string({ required_error: "Mật khẩu là bắt buộc", invalid_type_error: "Mật khẩu phải là chuỗi" })
    .min(1, "Mật khẩu là bắt buộc"),
});

module.exports = { registerSchema, loginSchema };
// ===== HẾT MÃ NỀN =====
