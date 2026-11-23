// P4 (Mức AI: AI-0): hai phiếu nhập kho chạy song song, mỗi phiếu là một transaction trên một kết nối riêng.
// npm run p4 chạy phiên A, sau 0,1 giây chạy phiên B, in thời điểm xong và kết quả từng lệnh.
// Bạn được sửa thứ tự lệnh trong tệp này ở bước thử cách khắc phục.

module.exports = {
  // Phiếu nhập NK-01: 10 tai nghe (id 1) và 5 bàn phím (id 2).
  sessionA: [
    "START TRANSACTION",
    "UPDATE products SET stock = stock + 10 WHERE id = 1",
    "DO SLEEP(0.5)",
    "UPDATE products SET stock = stock + 5 WHERE id = 2",
    "COMMIT",
  ],
  // Phiếu nhập NK-02: 3 bàn phím (id 2) và 8 tai nghe (id 1).
  sessionB: [
    "START TRANSACTION",
    "UPDATE products SET stock = stock + 3 WHERE id = 2",
    "DO SLEEP(0.5)",
    "UPDATE products SET stock = stock + 8 WHERE id = 1",
    "COMMIT",
  ],
};
