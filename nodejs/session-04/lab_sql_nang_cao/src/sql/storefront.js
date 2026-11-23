// Lab 2: truy vấn trang cửa hàng. Mỗi tên xuất là một chuỗi SQL; tham số truyền bằng dấu ? theo đúng thứ tự ghi dưới đây.
// Cột kết quả viết camelCase, đúng thứ tự: id, name, price, categoryName, tags, wishlistCount.
//   tags: tên nhãn nối bằng ", " theo id nhãn tăng dần, NULL khi sản phẩm chưa có nhãn.
//   wishlistCount: số người đã thêm sản phẩm vào wishlists (0 khi chưa ai thêm).

// Bước 1. Mọi sản phẩm. Tham số: không có. Thứ tự: id tăng dần.
const productCards = "";

// Bước 2. Sản phẩm có một nhãn cho trước, vẫn hiện đủ mọi nhãn của sản phẩm.
// Tham số: [tagName]. Thứ tự: id tăng dần.
const productsByTag = "";

// Bước 3. Một trang của cửa hàng: lọc theo nhãn và từ khóa trong tên, kèm cột total ở cuối
//   (tổng số sản phẩm khớp bộ lọc, không phụ thuộc trang).
// Tham số: [tagName, keyword, limit, offset]. Thứ tự: giá giảm dần, cùng giá thì id tăng dần.
const storefrontPage = "";

module.exports = { productCards, productsByTag, storefrontPage };
