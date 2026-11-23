// Lab 4 (trang danh mục) và Lab 7 (tìm kiếm). Mỗi tên xuất là một chuỗi SQL; tham số theo đúng thứ tự ghi dưới đây.

// Lab 4, Bước 2. Trang đầu của một danh mục. Tham số: [categoryId, limit].
// Cột: id, name, price. Thứ tự: price tăng dần, cùng giá thì id tăng dần.
const categoryFirstPage = "";

// Lab 4, Bước 3. Trang kế tiếp theo kiểu keyset, đọc tiếp sau hàng cuối của trang trước.
// Tham số: [categoryId, lastPrice, lastPrice, lastId, limit]. Cột và thứ tự như categoryFirstPage.
const categoryNextPage = "";

// Lab 7 (nâng cao). Tìm sản phẩm theo tên bằng index FULLTEXT, kèm cột total ở cuối.
// Tham số: [phrase, limit, offset]; phrase là cụm chữ liền nhau cần tìm, ví dụ "không dây" (không kèm dấu nháy).
// Cột: id, name, price, total. Thứ tự: price tăng dần, cùng giá thì id tăng dần.
const searchProducts = "";

module.exports = { categoryFirstPage, categoryNextPage, searchProducts };
