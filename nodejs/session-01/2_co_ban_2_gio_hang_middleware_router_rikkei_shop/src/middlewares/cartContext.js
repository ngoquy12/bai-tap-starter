// ===== BÀI LÀM: cartContext =====
// TODO: đọc header X-Cart-Id, thiếu hoặc rỗng thì báo lỗi 400, hợp lệ thì lưu vào req.cartId
function cartContext(req, res, next) {
  next();
}

module.exports = cartContext;
