// ===== BÀI LÀM: lắp ráp ứng dụng =====
// Hiện chỉ có phần của Bài 5. TODO: thêm lớp bảo vệ, giới hạn đăng nhập và gắn router /auth, /orders (xem đề, thứ tự middleware rất quan trọng)
const express = require("express");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const productsRouter = require("./routes/products.routes");
// TODO: require thêm các router và middleware mới

const app = express();

app.use(express.json());

// Kiểm tra máy chủ còn sống
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/products", productsRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
