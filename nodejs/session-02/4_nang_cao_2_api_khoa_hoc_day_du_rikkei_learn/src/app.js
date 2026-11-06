// ===== BÀI LÀM: ứng dụng Express =====
const express = require("express");
const coursesRouter = require("./routes/courses.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Đọc body JSON phải đứng trước router để req.body có dữ liệu.
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// TODO: gắn coursesRouter vào đường dẫn /courses (đúng vị trí so với notFound và errorHandler).

app.use(notFound);
app.use(errorHandler);

// Chỉ xuất app; src/server.js mới mở cổng.
module.exports = app;
