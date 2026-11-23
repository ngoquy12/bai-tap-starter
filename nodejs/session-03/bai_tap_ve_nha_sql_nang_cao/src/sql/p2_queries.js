// P2 (Mức AI: AI-0): ba truy vấn của trang quản trị đơn hàng, chạy chậm khi có 20.000 đơn.
// npm run p2 đọc tệp này, in EXPLAIN và thời gian của từng truy vấn. Không đổi tên, không đổi tham số.
// Riêng ordersFromThousand được phép viết lại câu SQL nếu báo cáo của bạn kết luận index không giúp được.

module.exports = {
  // Đơn có giá trị trong một khoảng, xếp theo giá trị rồi id.
  ordersInTotalRange: {
    sql: "SELECT id, total FROM orders WHERE total BETWEEN ? AND ? ORDER BY total, id",
    params: [1000000, 1005000],
  },
  // 20 dòng đơn số lượng lớn nhất của một sản phẩm.
  bigLinesOfProduct: {
    sql: "SELECT id, order_id, quantity FROM order_items WHERE product_id = ? AND quantity >= ? ORDER BY quantity DESC, id DESC LIMIT 20",
    params: [2, 4],
  },
  // 20 đơn đầu tiên có giá trị từ một mức tính theo nghìn đồng.
  ordersFromThousand: {
    sql: "SELECT id, total FROM orders WHERE total / 1000 >= ? ORDER BY total, id LIMIT 20",
    params: [2040],
  },
};
