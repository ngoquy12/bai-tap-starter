// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Kho giỏ hàng tạm trong bộ nhớ: khóa là mã giỏ (giá trị header X-Cart-Id),
// giá trị là mảng dòng hàng { productId, quantity } theo thứ tự được thêm vào.
// Giỏ chưa từng được ghi thì chưa có khóa trong Map. Mất dữ liệu khi tắt máy chủ.
const carts = new Map();

module.exports = carts;
// ===== HẾT MÃ NỀN =====
