// ===== BÀI LÀM: app.js của Rikkei Shop (health, router sản phẩm, 404 và lỗi tập trung) =====
// Chỉ xuất app, server.js mới gọi listen
const express = require("express");
const httpError = require("./errors/httpError");
const productsRouter = require("./routes/products.routes");

const app = express();

// TODO: đọc body JSON, thêm GET /health, gắn productsRouter vào /products
// TODO: viết notFound và errorHandler (4 tham số), đặt cuối cùng theo đúng thứ tự

module.exports = app;
