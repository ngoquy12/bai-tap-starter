// N2 (Mức AI: AI-0): đổi sản phẩm của một dòng đơn trong một transaction.
// Đầu vào:
//   pool: pool mysql2/promise (test truyền pool của cơ sở dữ liệu thử).
//   orderItemId: id của dòng đơn cần đổi (bảng order_items).
//   newProductId: id của sản phẩm khách muốn đổi sang.
// Đầu ra: Promise trả { orderId, total } với total là tổng đơn sau khi đổi.
// Lỗi: Promise bị từ chối bằng Error có message đúng như bảng quy tắc của bài N2; khi lỗi, dữ liệu không đổi.
async function exchangeItem(pool, orderItemId, newProductId) {
  throw new Error("Chưa làm");
}

module.exports = { exchangeItem };
