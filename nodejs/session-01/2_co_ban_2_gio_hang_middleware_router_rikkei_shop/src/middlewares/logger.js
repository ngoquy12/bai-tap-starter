// ===== BÀI LÀM: logger =====
// TODO: ghi một dòng gồm method và URL (kể cả query) cho mọi yêu cầu rồi chuyển tiếp
function logger(req, res, next) {
  next();
}

module.exports = logger;
