// ===== BÀI LÀM: app.js =====
const express = require("express");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Đọc body JSON phải đứng trước router để req.body có dữ liệu.
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// TODO: gắn các router: /auth, /me, /enrollments, /courses

// Hai middleware cuối cùng: đường dẫn không tồn tại, rồi xử lý lỗi tập trung.
app.use(notFound);
app.use(errorHandler);

// Chỉ xuất app; src/server.js mới mở cổng.
module.exports = app;
