// Bộ test tự chấm Bài 3: bảng reviews và 9 truy vấn báo cáo. KHÔNG sửa tệp này.
// Mỗi nhóm nạp lại cơ sở dữ liệu thử, chạy src/sql/reviews.sql của bạn, nạp dữ liệu trong tests/fixtures rồi so kết quả.
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { resetDatabase } = require("./helpers/db");
const pool = require("../src/db/pool");
const queries = require("../src/sql/queries");

const ER_BAD_NULL = 1048;
const ER_DUP_ENTRY = 1062;
const ER_ROW_IS_REFERENCED = 1451;
const ER_NO_REFERENCED_ROW = 1452;
const ER_CHECK_VIOLATED = 3819;

const ROOT = path.join(__dirname, "..");

function readSql(...parts) {
  return fs.readFileSync(path.join(ROOT, ...parts), "utf8");
}

// Mở một kết nối riêng (cho phép nhiều câu lệnh) để chạy cả tệp .sql
async function runScript(sql, withDatabase = true) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: withDatabase ? process.env.DB_NAME : undefined,
    multipleStatements: true,
  });
  try {
    await connection.query(sql);
  } finally {
    await connection.end();
  }
}

// Nạp lại schema.sql, seed.sql rồi dữ liệu bổ sung (danh mục Gia dụng, hai khách hàng, đơn #5)
async function prepareShop() {
  try {
    await runScript(`DROP TABLE IF EXISTS \`${process.env.DB_NAME}\`.reviews`, false);
  } catch (error) {
    // cơ sở dữ liệu thử chưa tồn tại: không có gì để xóa
  }
  await resetDatabase();
  await runScript(readSql("tests", "fixtures", "extra-shop-data.sql"));
}

// Chạy tệp reviews.sql của sinh viên; trả về lỗi (hoặc null) để mỗi test tự quyết định
async function buildReviewsTable() {
  try {
    await runScript("DROP TABLE IF EXISTS reviews");
    await runScript(readSql("src", "sql", "reviews.sql"));
    return null;
  } catch (error) {
    return error;
  }
}

// Nạp 15 đánh giá mẫu; nếu bảng của bạn chưa đúng thì bỏ qua lỗi để các test bên dưới báo đỏ thay vì dừng cả nhóm
async function loadReviews() {
  try {
    await runScript(readSql("tests", "fixtures", "review-data.sql"));
  } catch (error) {
    // các test so kết quả sẽ báo thiếu dữ liệu
  }
}

async function errnoOf(promise) {
  try {
    await promise;
    return null;
  } catch (error) {
    return error.errno;
  }
}

function insertReview(userId, productId, rating, comment = null) {
  return pool.query("INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)", [
    userId,
    productId,
    rating,
    comment,
  ]);
}

async function countReviews() {
  const [[row]] = await pool.query("SELECT COUNT(*) AS total FROM reviews");
  return row.total;
}

// Chạy một truy vấn đã xuất; chỉ chấp nhận câu bắt đầu bằng SELECT
async function run(name) {
  const sql = queries[name];
  if (typeof sql !== "string" || !/^\s*SELECT\b/i.test(sql)) {
    throw new Error(`Truy vấn ${name} phải là chuỗi bắt đầu bằng SELECT`);
  }
  const [rows, fields] = await pool.query(sql);
  return { rows: JSON.parse(JSON.stringify(rows)), columns: fields.map((field) => field.name) };
}

afterAll(async () => {
  await pool.end();
});

// ===== Kết quả mong đợi của 9 truy vấn trên dữ liệu seed + tests/fixtures =====
const EXPECTED = {
  productsInPriceRange: {
    columns: ["id", "name", "price", "stock", "categoryName"],
    rows: [
      { id: 2, name: "Bàn phím cơ", price: 890000, stock: 12, categoryName: "Điện tử" },
      { id: 7, name: "Quần jeans", price: 590000, stock: 18, categoryName: "Thời trang" },
      { id: 1, name: "Tai nghe Bluetooth", price: 450000, stock: 25, categoryName: "Điện tử" },
      { id: 6, name: "Chuột không dây", price: 320000, stock: 40, categoryName: "Điện tử" },
      { id: 8, name: "Sách Cơ sở dữ liệu", price: 210000, stock: 22, categoryName: "Sách" },
      { id: 3, name: "Áo thun", price: 199000, stock: 50, categoryName: "Thời trang" },
    ],
  },
  catalogPageTwo: {
    columns: ["id", "name", "price", "categoryName"],
    rows: [
      { id: 1, name: "Tai nghe Bluetooth", price: 450000, categoryName: "Điện tử" },
      { id: 6, name: "Chuột không dây", price: 320000, categoryName: "Điện tử" },
      { id: 8, name: "Sách Cơ sở dữ liệu", price: 210000, categoryName: "Sách" },
    ],
  },
  categoryStats: {
    columns: ["categoryName", "productCount", "totalStock", "avgPrice"],
    rows: [
      { categoryName: "Điện tử", productCount: 3, totalStock: 77, avgPrice: 553333.3333 },
      { categoryName: "Thời trang", productCount: 3, totalStock: 68, avgPrice: 679666.6667 },
      { categoryName: "Sách", productCount: 2, totalStock: 52, avgPrice: 185000 },
      { categoryName: "Gia dụng", productCount: 0, totalStock: null, avgPrice: null },
    ],
  },
  activeOrderLines: {
    columns: ["orderId", "customer", "productName", "quantity", "unitPrice", "lineTotal"],
    rows: [
      { orderId: 1, customer: "Nguyễn Thị Lan", productName: "Tai nghe Bluetooth", quantity: 2, unitPrice: 450000, lineTotal: 900000 },
      { orderId: 1, customer: "Nguyễn Thị Lan", productName: "Áo thun", quantity: 1, unitPrice: 199000, lineTotal: 199000 },
      { orderId: 2, customer: "Nguyễn Thị Lan", productName: "Sách Lập trình", quantity: 1, unitPrice: 160000, lineTotal: 160000 },
      { orderId: 3, customer: "Trần Văn Hùng", productName: "Bàn phím cơ", quantity: 1, unitPrice: 890000, lineTotal: 890000 },
      { orderId: 3, customer: "Trần Văn Hùng", productName: "Chuột không dây", quantity: 2, unitPrice: 320000, lineTotal: 640000 },
      { orderId: 5, customer: "Lê Minh Khoa", productName: "Áo thun", quantity: 2, unitPrice: 199000, lineTotal: 398000 },
      { orderId: 5, customer: "Lê Minh Khoa", productName: "Chuột không dây", quantity: 1, unitPrice: 320000, lineTotal: 320000 },
    ],
  },
  neverOrderedProducts: {
    columns: ["id", "name"],
    rows: [
      { id: 7, name: "Quần jeans" },
      { id: 8, name: "Sách Cơ sở dữ liệu" },
    ],
  },
  customerPaidTotals: {
    columns: ["fullName", "paidOrders", "paidTotal"],
    rows: [
      { fullName: "Trần Văn Hùng", paidOrders: 1, paidTotal: 1530000 },
      { fullName: "Nguyễn Thị Lan", paidOrders: 1, paidTotal: 1099000 },
      { fullName: "Lê Minh Khoa", paidOrders: 1, paidTotal: 718000 },
      { fullName: "Quản trị Rikkei", paidOrders: 0, paidTotal: null },
      { fullName: "Phạm Thu Hà", paidOrders: 0, paidTotal: null },
    ],
  },
  productRatingSummary: {
    columns: ["productId", "name", "reviewCount", "avgRating"],
    rows: [
      { productId: 5, name: "Sách Lập trình", reviewCount: 3, avgRating: 5 },
      { productId: 1, name: "Tai nghe Bluetooth", reviewCount: 3, avgRating: 4.6667 },
      { productId: 6, name: "Chuột không dây", reviewCount: 3, avgRating: 4 },
      { productId: 2, name: "Bàn phím cơ", reviewCount: 2, avgRating: 4 },
      { productId: 8, name: "Sách Cơ sở dữ liệu", reviewCount: 2, avgRating: 4 },
      { productId: 3, name: "Áo thun", reviewCount: 1, avgRating: 3 },
      { productId: 7, name: "Quần jeans", reviewCount: 1, avgRating: 2 },
      { productId: 4, name: "Giày chạy bộ", reviewCount: 0, avgRating: null },
    ],
  },
  topRatedProducts: {
    columns: ["productId", "name", "reviewCount", "avgRating"],
    rows: [
      { productId: 5, name: "Sách Lập trình", reviewCount: 3, avgRating: 5 },
      { productId: 1, name: "Tai nghe Bluetooth", reviewCount: 3, avgRating: 4.6667 },
      { productId: 6, name: "Chuột không dây", reviewCount: 3, avgRating: 4 },
      { productId: 2, name: "Bàn phím cơ", reviewCount: 2, avgRating: 4 },
      { productId: 8, name: "Sách Cơ sở dữ liệu", reviewCount: 2, avgRating: 4 },
    ],
  },
  verifiedReviews: {
    columns: ["reviewId", "customer", "productName", "rating", "comment"],
    rows: [
      { reviewId: 1, customer: "Nguyễn Thị Lan", productName: "Tai nghe Bluetooth", rating: 5, comment: "Âm thanh rõ" },
      { reviewId: 4, customer: "Trần Văn Hùng", productName: "Bàn phím cơ", rating: 4, comment: "Gõ êm" },
      { reviewId: 6, customer: "Nguyễn Thị Lan", productName: "Áo thun", rating: 3, comment: "Vải hơi mỏng" },
      { reviewId: 10, customer: "Trần Văn Hùng", productName: "Chuột không dây", rating: 4, comment: "Chuột mượt" },
      { reviewId: 11, customer: "Lê Minh Khoa", productName: "Chuột không dây", rating: 4, comment: null },
    ],
  },
};

// Mỗi truy vấn có hai test: tên và thứ tự cột, rồi toàn bộ hàng theo đúng thứ tự
function describeQuery(name, summary) {
  it(`${name} trả đúng tên và thứ tự cột`, async () => {
    const { columns } = await run(name);
    expect(columns).toEqual(EXPECTED[name].columns);
  });

  it(`${name} trả ${summary}`, async () => {
    const { rows } = await run(name);
    expect(rows).toEqual(EXPECTED[name].rows);
  });
}

// ===== Phần A: bảng reviews =====
describe("Bảng reviews: cấu trúc", () => {
  let buildError = null;

  beforeAll(async () => {
    await prepareShop();
    buildError = await buildReviewsTable();
  });

  async function columnInfo() {
    const [rows] = await pool.query(
      "SELECT column_name AS name, is_nullable AS nullable, column_key AS columnKey, extra AS extra " +
        "FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'reviews'"
    );
    return rows;
  }

  it("tệp src/sql/reviews.sql chạy không lỗi và tạo bảng reviews", async () => {
    expect(buildError).toBeNull();
    const [rows] = await pool.query(
      "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'reviews'"
    );
    expect(rows).toHaveLength(1);
  });

  it("bảng có đủ các cột id, user_id, product_id, rating, comment, created_at", async () => {
    const names = (await columnInfo()).map((column) => column.name);
    expect(names).toEqual(
      expect.arrayContaining(["id", "user_id", "product_id", "rating", "comment", "created_at"])
    );
  });

  it("id là khóa chính tự tăng", async () => {
    const id = (await columnInfo()).find((column) => column.name === "id");
    expect(id).toBeDefined();
    expect(id.columnKey).toBe("PRI");
    expect(id.extra).toContain("auto_increment");
  });

  it("user_id, product_id, rating bắt buộc có giá trị còn comment cho phép NULL", async () => {
    const columns = await columnInfo();
    const byName = (name) => columns.find((column) => column.name === name);
    expect(byName("user_id")?.nullable).toBe("NO");
    expect(byName("product_id")?.nullable).toBe("NO");
    expect(byName("rating")?.nullable).toBe("NO");
    expect(byName("comment")?.nullable).toBe("YES");
  });

  it("có chỉ mục idx_reviews_product_rating gồm product_id rồi rating", async () => {
    const [rows] = await pool.query(
      "SELECT column_name AS name FROM information_schema.statistics " +
        "WHERE table_schema = DATABASE() AND table_name = 'reviews' AND index_name = 'idx_reviews_product_rating' " +
        "ORDER BY seq_in_index"
    );
    expect(rows.map((row) => row.name)).toEqual(["product_id", "rating"]);
  });
});

describe("Bảng reviews: ràng buộc dữ liệu", () => {
  beforeEach(async () => {
    await prepareShop();
    await buildReviewsTable();
  });

  it("nhận đánh giá hợp lệ ở hai đầu mút rating 1 và rating 5", async () => {
    await insertReview(2, 1, 1);
    await insertReview(3, 1, 5);
    expect(await countReviews()).toBe(2);
  });

  it("từ chối rating 0 bằng lỗi CHECK và không ghi hàng nào", async () => {
    expect(await errnoOf(insertReview(2, 1, 0))).toBe(ER_CHECK_VIOLATED);
    expect(await countReviews()).toBe(0);
  });

  it("từ chối rating 6 bằng lỗi CHECK và không ghi hàng nào", async () => {
    expect(await errnoOf(insertReview(2, 1, 6))).toBe(ER_CHECK_VIOLATED);
    expect(await countReviews()).toBe(0);
  });

  it("từ chối rating NULL", async () => {
    expect(await errnoOf(insertReview(2, 1, null))).toBe(ER_BAD_NULL);
    expect(await countReviews()).toBe(0);
  });

  it("từ chối đánh giá thứ hai của cùng người cho cùng sản phẩm và giữ nguyên đánh giá đầu", async () => {
    await insertReview(2, 1, 5, "Tốt");
    expect(await errnoOf(insertReview(2, 1, 3, "Đổi ý"))).toBe(ER_DUP_ENTRY);
    const [rows] = await pool.query("SELECT rating, comment FROM reviews");
    expect(rows).toEqual([{ rating: 5, comment: "Tốt" }]);
  });

  it("cho phép một người đánh giá hai sản phẩm khác nhau và hai người đánh giá cùng một sản phẩm", async () => {
    await insertReview(2, 1, 5);
    await insertReview(2, 2, 4);
    await insertReview(3, 1, 3);
    expect(await countReviews()).toBe(3);
  });

  it("từ chối người dùng không tồn tại", async () => {
    expect(await errnoOf(insertReview(999, 1, 4))).toBe(ER_NO_REFERENCED_ROW);
    expect(await countReviews()).toBe(0);
  });

  it("từ chối sản phẩm không tồn tại", async () => {
    expect(await errnoOf(insertReview(2, 999, 4))).toBe(ER_NO_REFERENCED_ROW);
    expect(await countReviews()).toBe(0);
  });

  it("bỏ trống comment thì lưu NULL và created_at tự có giá trị", async () => {
    await pool.query("INSERT INTO reviews (user_id, product_id, rating) VALUES (2, 1, 4)");
    const [[row]] = await pool.query("SELECT comment, created_at AS createdAt FROM reviews");
    expect(row.comment).toBeNull();
    expect(row.createdAt).not.toBeNull();
  });

  it("không xóa được sản phẩm đã có đánh giá", async () => {
    await insertReview(2, 8, 5);
    expect(await errnoOf(pool.query("DELETE FROM products WHERE id = 8"))).toBe(ER_ROW_IS_REFERENCED);
    const [[row]] = await pool.query("SELECT COUNT(*) AS total FROM products WHERE id = 8");
    expect(row.total).toBe(1);
  });
});

// ===== Phần B: 9 truy vấn báo cáo =====
describe("Danh sách truy vấn", () => {
  beforeAll(async () => {
    await prepareShop();
    await buildReviewsTable();
    await loadReviews();
  });

  it("src/sql/queries.js xuất đủ 9 truy vấn đúng tên", () => {
    expect(Object.keys(queries).sort()).toEqual(Object.keys(EXPECTED).sort());
  });

  it("mỗi truy vấn là một câu SELECT không tham số, chạy được trên dữ liệu mẫu", async () => {
    for (const name of Object.keys(EXPECTED)) {
      expect(typeof queries[name]).toBe("string");
      expect(queries[name]).toMatch(/^\s*SELECT\b/i);
      expect(queries[name]).not.toContain("?");
      await run(name);
    }
  });
});

describe("Truy vấn sản phẩm và danh mục", () => {
  beforeAll(async () => {
    await prepareShop();
  });

  describeQuery("productsInPriceRange", "sáu sản phẩm còn hàng trong khoảng giá, từ đắt đến rẻ");
  describeQuery("catalogPageTwo", "trang 2 của danh sách giá giảm dần: id 1, 6, 8");
  describeQuery("categoryStats", "thống kê bốn danh mục theo id danh mục tăng dần");

  it("productsInPriceRange giữ Áo thun giá đúng 199000 và loại Giày chạy bộ hết hàng", async () => {
    const { rows } = await run("productsInPriceRange");
    const ids = rows.map((row) => row.id);
    expect(ids).toContain(3);
    expect(ids).not.toContain(4);
    expect(ids).not.toContain(5);
  });

  it("categoryStats giữ danh mục Gia dụng chưa có sản phẩm với productCount 0 và totalStock NULL", async () => {
    const { rows } = await run("categoryStats");
    const empty = rows.find((row) => row.categoryName === "Gia dụng");
    expect(empty).toEqual({ categoryName: "Gia dụng", productCount: 0, totalStock: null, avgPrice: null });
  });
});

describe("Truy vấn đơn hàng và khách hàng", () => {
  beforeAll(async () => {
    await prepareShop();
  });

  describeQuery("activeOrderLines", "bảy dòng hàng của các đơn pending và paid, theo đơn rồi theo dòng");
  describeQuery("neverOrderedProducts", "hai sản phẩm chưa từng được đặt: id 7 và 8");
  describeQuery("customerPaidTotals", "năm người dùng, tổng tiền đơn paid giảm dần, NULL đứng cuối");

  it("customerPaidTotals vẫn có người chưa mua với paidOrders 0 và paidTotal NULL, xếp cuối theo id", async () => {
    const { rows } = await run("customerPaidTotals");
    expect(rows).toHaveLength(5);
    expect(rows.slice(-2)).toEqual([
      { fullName: "Quản trị Rikkei", paidOrders: 0, paidTotal: null },
      { fullName: "Phạm Thu Hà", paidOrders: 0, paidTotal: null },
    ]);
  });
});

describe("Truy vấn đánh giá sản phẩm", () => {
  beforeAll(async () => {
    await prepareShop();
    await buildReviewsTable();
    await loadReviews();
  });

  describeQuery("productRatingSummary", "tám sản phẩm theo điểm trung bình giảm dần, rồi số đánh giá, rồi id");
  describeQuery("topRatedProducts", "năm sản phẩm có từ 2 đánh giá, xếp theo điểm, số đánh giá, id");
  describeQuery("verifiedReviews", "năm đánh giá của người đã mua đúng sản phẩm trong đơn paid");

  it("productRatingSummary đặt Giày chạy bộ chưa có đánh giá ở cuối với reviewCount 0 và avgRating NULL", async () => {
    const { rows } = await run("productRatingSummary");
    expect(rows).toHaveLength(8);
    expect(rows[rows.length - 1]).toEqual({ productId: 4, name: "Giày chạy bộ", reviewCount: 0, avgRating: null });
  });

  it("topRatedProducts xếp Bàn phím cơ trước Sách Cơ sở dữ liệu khi hòa cả điểm lẫn số đánh giá", async () => {
    const { rows } = await run("topRatedProducts");
    const ids = rows.map((row) => row.productId);
    expect(ids.indexOf(2)).toBeGreaterThanOrEqual(0);
    expect(ids.indexOf(2)).toBeLessThan(ids.indexOf(8));
    expect(ids).not.toContain(3);
    expect(ids).not.toContain(7);
    expect(ids).not.toContain(4);
  });

  it("verifiedReviews không có đánh giá của người chưa mua đúng sản phẩm đó", async () => {
    const { rows } = await run("verifiedReviews");
    const ids = rows.map((row) => row.reviewId);
    // đánh giá 2 (Hùng với Tai nghe) và 7 (Lan với Sách Lập trình, đơn chưa thanh toán) không được xuất hiện
    expect(ids).not.toContain(2);
    expect(ids).not.toContain(7);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
