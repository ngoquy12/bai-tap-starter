// Lab 2: truy vấn trang cửa hàng. KHÔNG sửa tệp này.
// Mỗi test tạo lại cơ sở dữ liệu thử, chạy src/sql/lab1_wishlists.sql (Lab 1) rồi chạy truy vấn trong src/sql/storefront.js.
const { freshDatabase, openConnection, runSqlFile } = require("./helpers/db");
const storefront = require("../src/sql/storefront");

const CARD_COLUMNS = ["id", "name", "price", "categoryName", "tags", "wishlistCount"];

describe("Lab 2 - trang cửa hàng", () => {
  let connection;

  beforeEach(async () => {
    await freshDatabase();
    await runSqlFile("src", "sql", "lab1_wishlists.sql");
    connection = await openConnection();
  });

  afterEach(async () => {
    await connection.end();
  });

  async function run(name, params = []) {
    expect(typeof storefront[name]).toBe("string");
    expect(storefront[name].trim()).not.toBe("");
    const [rows] = await connection.query(storefront[name], params);
    return rows;
  }

  // Thêm Áo khoác (id 9) cùng giá với Áo thun và gắn nhãn Giảm giá, để thử thứ tự khi trùng giá.
  async function addSameCostJacket() {
    await connection.query(
      "INSERT INTO products (id, category_id, name, price, stock) VALUES (9, 2, 'Áo khoác', 199000, 7)"
    );
    await connection.query("INSERT INTO product_tags (product_id, tag_id) VALUES (9, 2)");
  }

  it("productCards trả 8 thẻ sản phẩm đúng cột, đúng thứ tự id", async () => {
    const rows = await run("productCards");
    expect(Object.keys(rows[0])).toEqual(CARD_COLUMNS);
    expect(rows).toEqual([
      { id: 1, name: "Tai nghe Bluetooth", price: 450000, categoryName: "Điện tử", tags: "Bán chạy, Giảm giá", wishlistCount: 2 },
      { id: 2, name: "Bàn phím cơ", price: 890000, categoryName: "Điện tử", tags: "Bán chạy", wishlistCount: 1 },
      { id: 3, name: "Áo thun", price: 199000, categoryName: "Thời trang", tags: "Giảm giá", wishlistCount: 0 },
      { id: 4, name: "Giày chạy bộ", price: 1250000, categoryName: "Thời trang", tags: null, wishlistCount: 0 },
      { id: 5, name: "Sách Lập trình", price: 160000, categoryName: "Sách", tags: null, wishlistCount: 0 },
      { id: 6, name: "Chuột không dây", price: 320000, categoryName: "Điện tử", tags: "Giảm giá, Hàng mới", wishlistCount: 1 },
      { id: 7, name: "Quần jeans", price: 590000, categoryName: "Thời trang", tags: null, wishlistCount: 0 },
      { id: 8, name: "Sách Cơ sở dữ liệu", price: 210000, categoryName: "Sách", tags: "Hàng mới", wishlistCount: 1 },
    ]);
  });

  it("productCards: Tai nghe Bluetooth có 2 nhãn và 2 lượt yêu thích, không bị nhân thành 4", async () => {
    const rows = await run("productCards");
    expect(rows[0].tags).toBe("Bán chạy, Giảm giá");
    expect(rows[0].wishlistCount).toBe(2);
  });

  it("productsByTag('Giảm giá') trả sản phẩm 1, 3, 6 và vẫn giữ đủ mọi nhãn của từng sản phẩm", async () => {
    const rows = await run("productsByTag", ["Giảm giá"]);
    expect(Object.keys(rows[0])).toEqual(CARD_COLUMNS);
    expect(rows.map((row) => [row.id, row.tags, row.wishlistCount])).toEqual([
      [1, "Bán chạy, Giảm giá", 2],
      [3, "Giảm giá", 0],
      [6, "Giảm giá, Hàng mới", 1],
    ]);
  });

  it("productsByTag('Hàng mới') trả sản phẩm 6 và 8; nhãn không tồn tại trả mảng rỗng", async () => {
    const rows = await run("productsByTag", ["Hàng mới"]);
    expect(rows.map((row) => row.id)).toEqual([6, 8]);
    expect(await run("productsByTag", ["Thanh lý"])).toEqual([]);
  });

  it("storefrontPage('Giảm giá', '', 2, 0) trả trang 1 từ đắt đến rẻ kèm total 3", async () => {
    const rows = await run("storefrontPage", ["Giảm giá", "", 2, 0]);
    expect(Object.keys(rows[0])).toEqual([...CARD_COLUMNS, "total"]);
    expect(rows.map((row) => [row.id, row.price, row.total])).toEqual([
      [1, 450000, 3],
      [6, 320000, 3],
    ]);
  });

  it("storefrontPage('Giảm giá', '', 2, 2) trả trang 2 chỉ có Áo thun, total vẫn là 3", async () => {
    const rows = await run("storefrontPage", ["Giảm giá", "", 2, 2]);
    expect(rows.map((row) => [row.id, row.name, row.total])).toEqual([[3, "Áo thun", 3]]);
  });

  it("storefrontPage lọc thêm từ khóa 'chuột' (không phân biệt hoa thường) trả 1 sản phẩm, total 1", async () => {
    const rows = await run("storefrontPage", ["Giảm giá", "chuột", 10, 0]);
    expect(rows.map((row) => [row.id, row.total])).toEqual([[6, 1]]);
  });

  it("storefrontPage: hai sản phẩm cùng giá 199000 xếp theo id tăng dần (Áo thun 3 trước Áo khoác 9)", async () => {
    await addSameCostJacket();
    const rows = await run("storefrontPage", ["Giảm giá", "", 2, 2]);
    expect(rows.map((row) => [row.id, row.total])).toEqual([
      [3, 4],
      [9, 4],
    ]);
    const keywordRows = await run("storefrontPage", ["Giảm giá", "Áo", 10, 0]);
    expect(keywordRows.map((row) => [row.id, row.total])).toEqual([
      [3, 2],
      [9, 2],
    ]);
  });
});
