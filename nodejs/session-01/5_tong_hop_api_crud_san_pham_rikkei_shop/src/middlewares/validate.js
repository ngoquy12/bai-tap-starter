// ===== BÀI LÀM: validate(schema, source) =====
// TODO: áp schema lên req[source] ("body", "query" hoặc "params"); sai thì chuyển httpError 400 sang next,
// đúng thì thay req[source] bằng dữ liệu đã làm sạch rồi gọi next().
function validate(schema, source) {
  return function validateRequest(req, res, next) {
    next();
  };
}

module.exports = validate;
