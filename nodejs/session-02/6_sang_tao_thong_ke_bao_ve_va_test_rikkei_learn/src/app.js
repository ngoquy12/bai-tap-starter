// ===== BÀI LÀM: src/app.js (lớp bảo vệ và route /stats) =====
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("./config/env");
const loginLimiter = require("./middlewares/loginLimiter");
const authRouter = require("./routes/auth.routes");
const meRouter = require("./routes/me.routes");
const enrollmentsRouter = require("./routes/enrollments.routes");
const coursesRouter = require("./routes/courses.routes");
const statsRouter = require("./routes/stats.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// TODO: gắn helmet, cors (chỉ http://localhost:5173) và morgan (chỉ khi không phải test) TRƯỚC mọi router.

// Đọc body JSON phải đứng trước router để req.body có dữ liệu.
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// TODO: gắn loginLimiter cho /auth/login (trước authRouter).
app.use("/auth", authRouter);
app.use("/me", meRouter);
app.use("/enrollments", enrollmentsRouter);
app.use("/courses", coursesRouter);
// TODO: gắn statsRouter ở /stats.

// Hai middleware cuối cùng: đường dẫn không tồn tại, rồi xử lý lỗi tập trung.
app.use(notFound);
app.use(errorHandler);

// Chỉ xuất app; src/server.js mới mở cổng.
module.exports = app;
