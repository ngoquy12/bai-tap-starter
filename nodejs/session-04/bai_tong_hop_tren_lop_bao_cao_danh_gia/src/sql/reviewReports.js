// Bài làm: ba hàm báo cáo đánh giá sản phẩm của Rikkei Shop.
// Giữ nguyên tên hàm, tham số và tên thuộc tính kết quả; test gọi đúng các tên này.
// Dữ liệu: bảng reviews và dữ liệu thêm nằm trong db/extra.sql.
const pool = require("../db/pool");

/**
 * Thống kê đánh giá của mọi sản phẩm thuộc một danh mục.
 * Đầu vào: categoryId (số nguyên).
 * Đầu ra: Promise<Array<{ productId, productName, reviewCount, avgRating }>>,
 *   productId tăng dần; avgRating là số làm tròn 2 chữ số, null khi sản phẩm chưa có đánh giá.
 */
async function getCategoryReviewStats(categoryId) {
  throw new Error("Chưa làm");
}

/**
 * Bảng xếp hạng điểm đánh giá trong từng danh mục.
 * Đầu vào: minReviews (số nguyên từ 1), số đánh giá tối thiểu để sản phẩm được xếp hạng.
 * Đầu ra: Promise<Array<{ categoryName, productId, productName, reviewCount, avgRating, rankInCategory }>>,
 *   theo id danh mục tăng dần, rồi rankInCategory tăng dần, rồi productId tăng dần.
 */
async function getRatingLeaderboard(minReviews) {
  throw new Error("Chưa làm");
}

/**
 * Một trang đánh giá của một sản phẩm.
 * Đầu vào: productId, page (từ 1), pageSize (từ 1), đều là số nguyên.
 * Đầu ra: Promise<{ data: Array<{ reviewId, reviewerName, rating, comment }>,
 *   meta: { page, pageSize, total, totalPages } }>.
 */
async function getProductReviewsPage(productId, page, pageSize) {
  throw new Error("Chưa làm");
}

module.exports = { getCategoryReviewStats, getRatingLeaderboard, getProductReviewsPage };
