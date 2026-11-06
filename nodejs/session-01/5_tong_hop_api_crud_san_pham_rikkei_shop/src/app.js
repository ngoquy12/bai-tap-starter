// ===== BÀI LÀM: lắp ráp ứng dụng =====
// TODO: chỉ xuất app (không listen). Thứ tự: đọc JSON, GET /health, router, notFound, rồi errorHandler ở cuối cùng.
const express = require("express");

const app = express();

module.exports = app;
