// ===== BÀI LÀM: validate.js =====
// Áp schema lên req[source] (body, query hoặc params); sai thì chuyển lỗi 400 cho errorHandler.
function validate(schema, source) {
  return function validateRequest(req, res, next) {
    // TODO: kiểm tra req[source] bằng schema.safeParse; sai thì next(lỗi 400 có details), đúng thì thay req[source] bằng dữ liệu đã làm sạch
    next();
  };
}

module.exports = validate;
