// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Điểm khởi động: chỉ tệp này mở cổng, nhờ vậy test gọi thẳng app mà không cần cổng
const app = require("./app");
const config = require("./config/env");

app.listen(config.port, () => {
  console.log(`Máy chủ chạy ở http://localhost:${config.port}`);
});
// ===== HẾT MÃ NỀN =====
