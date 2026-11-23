// Lab 7 (nâng cao): tìm kiếm FULLTEXT ngram. KHÔNG sửa tệp này.
// Mỗi test tạo lại cơ sở dữ liệu thử, nạp tests/fixtures/extra-books.sql, chạy src/sql/lab7_fulltext.sql rồi searchProducts.
const { freshDatabase, openConnection, runSqlFile, tryRunSqlFile } = require("./helpers/db");
const catalog = require("../src/sql/catalog");

describe("Lab 7 - tìm kiếm FULLTEXT", () => {
  let connection;
  let scriptError;

  beforeEach(async () => {
    await freshDatabase();
    await runSqlFile("tests", "fixtures", "extra-books.sql");
    scriptError = await tryRunSqlFile("src", "sql", "lab7_fulltext.sql");
    connection = await openConnection();
  });

  afterEach(async () => {
    await connection.end();
  });

  async function search(params) {
    expect(typeof catalog.searchProducts).toBe("string");
    expect(catalog.searchProducts.trim()).not.toBe("");
    const [rows] = await connection.query(catalog.searchProducts, params);
    return rows;
  }

  it("lab7_fulltext.sql tạo index FULLTEXT ft_products_name trên cột name", async () => {
    expect(scriptError).toBeNull();
    const [rows] = await connection.query(
      `SELECT COLUMN_NAME AS columnName, INDEX_TYPE AS indexType FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'ft_products_name'`
    );
    expect(rows).toEqual([{ columnName: "name", indexType: "FULLTEXT" }]);
  });

  it("searchProducts('không dây', 10, 0) trả Chuột không dây, total 1", async () => {
    const rows = await search(["không dây", 10, 0]);
    expect(Object.keys(rows[0])).toEqual(["id", "name", "price", "total"]);
    expect(rows.map((row) => [row.id, row.total])).toEqual([[6, 1]]);
  });

  it("searchProducts('Sách', 2, 2) trả trang 2 theo giá rồi id: Sách MySQL (11), Sách Node.js (9), total 6", async () => {
    const rows = await search(["Sách", 2, 2]);
    expect(rows.map((row) => [row.id, row.price, row.total])).toEqual([
      [11, 160000, 6],
      [9, 175000, 6],
    ]);
  });

  it("EXPLAIN của searchProducts dùng index ft_products_name (type fulltext)", async () => {
    const [plan] = await connection.query(`EXPLAIN ${catalog.searchProducts}`, ["Sách", 2, 0]);
    expect(plan[0].key).toBe("ft_products_name");
    expect(plan[0].type).toBe("fulltext");
  });
});
