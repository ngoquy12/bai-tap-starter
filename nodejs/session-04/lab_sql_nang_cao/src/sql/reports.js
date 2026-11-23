// Lab 3: báo cáo cho trang quản trị. Mỗi tên xuất là một chuỗi SQL không tham số.

// Bước 1. Doanh thu theo danh mục, kể cả danh mục chưa bán được gì.
// Cột: categoryId, categoryName, unitsSold (tổng số lượng), revenue (tổng quantity * unit_price), 0 khi chưa bán.
// Thứ tự: revenue giảm dần, cùng doanh thu thì categoryId tăng dần.
const categoryRevenue = "";

// Bước 2. Top 2 sản phẩm bán chạy nhất (theo tổng số lượng) của mỗi danh mục; đồng hạng thì cùng được lấy.
// Cột: categoryId, productId, productName, sold, rankNo.
// Thứ tự: categoryId, rankNo, productId tăng dần.
const topSellers = "";

module.exports = { categoryRevenue, topSellers };
