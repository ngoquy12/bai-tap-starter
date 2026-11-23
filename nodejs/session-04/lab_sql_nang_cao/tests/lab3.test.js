// Lab 3: báo cáo quản trị và view. KHÔNG sửa tệp này.
// Mỗi test tạo lại cơ sở dữ liệu thử, nạp tests/fixtures/extra-orders.sql rồi chạy truy vấn trong src/sql/reports.js.
const { freshDatabase, openConnection, runSqlFile, tryRunSqlFile } = require("./helpers/db");
const reports = require("../src/sql/reports");

const TOP_SELLERS = [
  { categoryId: 1, productId: 1, productName: "Tai nghe Bluetooth", sold: 2, rankNo: 1 },
  { categoryId: 1, productId: 6, productName: "Chuột không dây", sold: 2, rankNo: 1 },
  { categoryId: 2, productId: 3, productName: "Áo thun", sold: 2, rankNo: 1 },
  { categoryId: 2, productId: 4, productName: "Giày chạy bộ", sold: 1, rankNo: 2 },
  { categoryId: 2, productId: 7, productName: "Quần jeans", sold: 1, rankNo: 2 },
  { categoryId: 3, productId: 8, productName: "Sách Cơ sở dữ liệu", sold: 2, rankNo: 1 },
  { categoryId: 3, productId: 5, productName: "Sách Lập trình", sold: 1, rankNo: 2 },
];

describe("Lab 3 - báo cáo quản trị", () => {
  let connection;

  beforeEach(async () => {
    await freshDatabase();
    await runSqlFile("tests", "fixtures", "extra-orders.sql");
    connection = await openConnection();
  });

  afterEach(async () => {
    await connection.end();
  });

  async function run(name) {
    expect(typeof reports[name]).toBe("string");
    expect(reports[name].trim()).not.toBe("");
    const [rows] = await connection.query(reports[name]);
    return rows;
  }

  async function readView() {
    const [rows] = await connection.query("SELECT * FROM v_top_sellers ORDER BY categoryId, rankNo, productId");
    return rows;
  }

  it("categoryRevenue trả 4 danh mục, doanh thu giảm dần, Gia dụng bằng 0", async () => {
    const rows = await run("categoryRevenue");
    expect(Object.keys(rows[0])).toEqual(["categoryId", "categoryName", "unitsSold", "revenue"]);
    expect(rows).toEqual([
      { categoryId: 1, categoryName: "Điện tử", unitsSold: 5, revenue: 2430000 },
      { categoryId: 2, categoryName: "Thời trang", unitsSold: 4, revenue: 2238000 },
      { categoryId: 3, categoryName: "Sách", unitsSold: 3, revenue: 580000 },
      { categoryId: 4, categoryName: "Gia dụng", unitsSold: 0, revenue: 0 },
    ]);
  });

  it("topSellers trả 7 dòng: top 2 mỗi danh mục, đồng hạng cùng được giữ", async () => {
    const rows = await run("topSellers");
    expect(Object.keys(rows[0])).toEqual(["categoryId", "productId", "productName", "sold", "rankNo"]);
    expect(rows).toEqual(TOP_SELLERS);
  });

  it("topSellers loại Bàn phím cơ (hạng 3 của Điện tử)", async () => {
    const rows = await run("topSellers");
    expect(rows.map((row) => row.productId)).not.toContain(2);
  });

  it("lab3_views.sql tạo view v_top_sellers cho cùng 7 dòng, chạy lại tệp lần hai không lỗi", async () => {
    expect(await tryRunSqlFile("src", "sql", "lab3_views.sql")).toBeNull();
    expect(await tryRunSqlFile("src", "sql", "lab3_views.sql")).toBeNull();
    expect(await readView()).toEqual(TOP_SELLERS);
  });

  it("v_top_sellers thấy ngay đơn mới: Hùng mua 3 Bàn phím cơ thì Điện tử còn 3 dòng, Bàn phím cơ hạng 1", async () => {
    await runSqlFile("src", "sql", "lab3_views.sql");
    await connection.query("INSERT INTO orders (id, user_id, total) VALUES (6, 3, 2670000)");
    await connection.query(
      "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (6, 2, 3, 890000)"
    );
    const rows = (await readView()).filter((row) => row.categoryId === 1);
    expect(rows.map((row) => [row.productId, row.sold, row.rankNo])).toEqual([
      [2, 4, 1],
      [1, 2, 2],
      [6, 2, 2],
    ]);
  });
});
