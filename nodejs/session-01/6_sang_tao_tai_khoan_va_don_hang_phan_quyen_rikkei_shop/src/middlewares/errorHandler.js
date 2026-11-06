// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Nơi duy nhất biến mọi lỗi (httpError, JSON hỏng, lỗi MySQL, lỗi lạ) thành { error: { code, message, details? } }
function errorHandler(error, req, res, next) {
  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Lỗi máy chủ";
  let details;
  if (error.type === "entity.parse.failed") {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "JSON không hợp lệ";
  } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Danh mục không tồn tại";
    details = [{ field: "categoryId", message }];
  } else if (error.code === "ER_ROW_IS_REFERENCED_2") {
    status = 409;
    code = "CONFLICT";
    message = "Sản phẩm đã có trong đơn hàng, không thể xóa";
  } else if (error.code === "ER_DUP_ENTRY") {
    status = 409;
    code = "CONFLICT";
    message = "Email đã được đăng ký";
  } else if (typeof error.status === "number" && error.code) {
    ({ status, code, message, details } = error); // lỗi do httpError tạo
  } else {
    // Lỗi không lường trước: chỉ ghi nhật ký, không gửi chi tiết cho client
    console.error(error);
  }

  const body = { error: { code, message } };
  if (details) body.error.details = details;
  res.status(status).json(body);
}

module.exports = errorHandler;
// ===== HẾT MÃ NỀN =====
