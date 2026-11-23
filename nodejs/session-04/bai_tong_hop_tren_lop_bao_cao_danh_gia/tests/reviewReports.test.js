// Test mẫu bài tổng hợp "Đánh giá sản phẩm". Không sửa tệp này.
// Trước mỗi nhóm, cơ sở dữ liệu thử được tạo lại từ db/schema.sql, db/seed.sql và db/extra.sql.
const { resetDatabase } = require("./helpers/db");
const pool = require("../src/db/pool");
const {
  getCategoryReviewStats,
  getRatingLeaderboard,
  getProductReviewsPage,
} = require("../src/sql/reviewReports");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

describe("getCategoryReviewStats", () => {
  test("danh mục Điện tử: 3 sản phẩm theo productId", async () => {
    expect(await getCategoryReviewStats(1)).toEqual([
      { productId: 1, productName: "Tai nghe Bluetooth", reviewCount: 4, avgRating: 4.5 },
      { productId: 2, productName: "Bàn phím cơ", reviewCount: 2, avgRating: 4.5 },
      { productId: 6, productName: "Chuột không dây", reviewCount: 3, avgRating: 3 },
    ]);
  });

  test("sản phẩm chưa có đánh giá vẫn có mặt với 0 và null", async () => {
    expect(await getCategoryReviewStats(2)).toEqual([
      { productId: 3, productName: "Áo thun", reviewCount: 2, avgRating: 3.5 },
      { productId: 4, productName: "Giày chạy bộ", reviewCount: 1, avgRating: 5 },
      { productId: 7, productName: "Quần jeans", reviewCount: 0, avgRating: null },
    ]);
  });

  test("danh mục không tồn tại trả mảng rỗng", async () => {
    expect(await getCategoryReviewStats(99)).toEqual([]);
  });
});

describe("getRatingLeaderboard", () => {
  test("ngưỡng 1 đánh giá: 7 sản phẩm, đồng điểm thì đồng hạng", async () => {
    expect(await getRatingLeaderboard(1)).toEqual([
      { categoryName: "Điện tử", productId: 1, productName: "Tai nghe Bluetooth", reviewCount: 4, avgRating: 4.5, rankInCategory: 1 },
      { categoryName: "Điện tử", productId: 2, productName: "Bàn phím cơ", reviewCount: 2, avgRating: 4.5, rankInCategory: 1 },
      { categoryName: "Điện tử", productId: 6, productName: "Chuột không dây", reviewCount: 3, avgRating: 3, rankInCategory: 3 },
      { categoryName: "Thời trang", productId: 4, productName: "Giày chạy bộ", reviewCount: 1, avgRating: 5, rankInCategory: 1 },
      { categoryName: "Thời trang", productId: 3, productName: "Áo thun", reviewCount: 2, avgRating: 3.5, rankInCategory: 2 },
      { categoryName: "Sách", productId: 5, productName: "Sách Lập trình", reviewCount: 3, avgRating: 4.67, rankInCategory: 1 },
      { categoryName: "Sách", productId: 8, productName: "Sách Cơ sở dữ liệu", reviewCount: 2, avgRating: 4.5, rankInCategory: 2 },
    ]);
  });

  test("sản phẩm chưa có đánh giá không vào bảng xếp hạng", async () => {
    const rows = await getRatingLeaderboard(1);
    expect(rows.map((row) => row.productId)).not.toContain(7);
    expect(rows.map((row) => row.productId)).not.toContain(9);
  });
});

describe("getProductReviewsPage", () => {
  test("trang 1 của Tai nghe Bluetooth, 2 đánh giá mỗi trang", async () => {
    expect(await getProductReviewsPage(1, 1, 2)).toEqual({
      data: [
        { reviewId: 4, reviewerName: "Phạm Thu Hà", rating: 4, comment: "Hộp hơi móp khi giao." },
        { reviewId: 3, reviewerName: "Lê Minh Khoa", rating: 5, comment: "Đeo cả ngày không đau tai." },
      ],
      meta: { page: 1, pageSize: 2, total: 4, totalPages: 2 },
    });
  });

  test("trang 2 của Tai nghe Bluetooth", async () => {
    expect(await getProductReviewsPage(1, 2, 2)).toEqual({
      data: [
        { reviewId: 2, reviewerName: "Trần Văn Hùng", rating: 4, comment: null },
        { reviewId: 1, reviewerName: "Nguyễn Thị Lan", rating: 5, comment: "Âm thanh rõ, pin lâu." },
      ],
      meta: { page: 2, pageSize: 2, total: 4, totalPages: 2 },
    });
  });

  test("trang vượt quá trang cuối: data rỗng nhưng total vẫn đúng", async () => {
    expect(await getProductReviewsPage(1, 3, 2)).toEqual({
      data: [],
      meta: { page: 3, pageSize: 2, total: 4, totalPages: 2 },
    });
  });

  test("sản phẩm chưa có đánh giá: total và totalPages bằng 0", async () => {
    expect(await getProductReviewsPage(7, 1, 2)).toEqual({
      data: [],
      meta: { page: 1, pageSize: 2, total: 0, totalPages: 0 },
    });
  });
});
