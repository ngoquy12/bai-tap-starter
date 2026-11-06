// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Điểm khởi động của máy chủ: chỉ tệp này gọi listen, app.js chỉ xuất app.
const app = require("./app");
const config = require("./config/env");

app.listen(config.port, () => {
  console.log(`Máy chủ chạy ở http://localhost:${config.port}`);
});
// ===== HẾT MÃ NỀN =====
