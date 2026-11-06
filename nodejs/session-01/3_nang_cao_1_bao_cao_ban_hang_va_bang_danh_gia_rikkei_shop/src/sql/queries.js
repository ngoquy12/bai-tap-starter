// ===== BÀI LÀM: 9 truy vấn báo cáo cho trang quản trị Rikkei Shop =====
// Mỗi truy vấn là một chuỗi SELECT không tham số; tên cột viết camelCase; ORDER BY đủ để thứ tự luôn xác định.
// Cột, bí danh và thứ tự sắp xếp của từng truy vấn nằm trong bảng ở mục "Phần B" của đề bài.

// TODO: sản phẩm còn hàng trong khoảng giá, kèm tên danh mục
const productsInPriceRange = "";

// TODO: trang 2 của danh sách sản phẩm
const catalogPageTwo = "";

// TODO: thống kê theo danh mục, kể cả danh mục chưa có sản phẩm
const categoryStats = "";

// TODO: dòng hàng của các đơn pending và paid
const activeOrderLines = "";

// TODO: sản phẩm chưa từng được đặt
const neverOrderedProducts = "";

// TODO: số đơn paid và tổng tiền của mọi người dùng
const customerPaidTotals = "";

// TODO: số đánh giá và điểm trung bình của mọi sản phẩm
const productRatingSummary = "";

// TODO: sản phẩm có từ 2 đánh giá trở lên
const topRatedProducts = "";

// TODO: đánh giá của người đã mua đúng sản phẩm trong đơn paid
const verifiedReviews = "";

module.exports = {
  productsInPriceRange,
  catalogPageTwo,
  categoryStats,
  activeOrderLines,
  neverOrderedProducts,
  customerPaidTotals,
  productRatingSummary,
  topRatedProducts,
  verifiedReviews,
};
