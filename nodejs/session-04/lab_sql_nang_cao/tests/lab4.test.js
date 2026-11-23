// Lab 4: index ghép, EXPLAIN và phân trang keyset. KHÔNG sửa tệp này.
// Mỗi test tạo lại cơ sở dữ liệu thử, nạp tests/fixtures/extra-books.sql, chạy src/sql/lab4_indexes.sql rồi chạy src/sql/catalog.js.
const { freshDatabase, openConnection, runSqlFile, tryRunSqlFile } = require("./helpers/db");
const catalog = require("../src/sql/catalog");

describe("Lab 4 - index và keyset", () => {
  let connection;
  let indexError;

  beforeEach(async () => {
    await freshDatabase();
    await runSqlFile("tests", "fixtures", "extra-books.sql");
    indexError = await tryRunSqlFile("src", "sql", "lab4_indexes.sql");
    connection = await openConnection();
  });

  afterEach(async () => {
    await connection.end();
  });

  async function run(name, params) {
    expect(typeof catalog[name]).toBe("string");
    expect(catalog[name].trim()).not.toBe("");
    const [rows] = await connection.query(catalog[name], params);
    return rows;
  }

  async function explain(name, params) {
    const [rows] = await connection.query(`EXPLAIN ${catalog[name]}`, params);
    return rows[0];
  }

  it("lab4_indexes.sql tạo idx_products_category_price trên (category_id, price) theo đúng thứ tự", async () => {
    expect(indexError).toBeNull();
    const [rows] = await connection.query(
      `SELECT COLUMN_NAME AS columnName FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_category_price'
       ORDER BY SEQ_IN_INDEX`
    );
    expect(rows.map((row) => row.columnName)).toEqual(["category_id", "price"]);
  });

  it("categoryFirstPage(3, 2) trả Sách Lập trình (5) rồi Sách Express (10)", async () => {
    const rows = await run("categoryFirstPage", [3, 2]);
    expect(Object.keys(rows[0])).toEqual(["id", "name", "price"]);
    expect(rows).toEqual([
      { id: 5, name: "Sách Lập trình", price: 160000 },
      { id: 10, name: "Sách Express", price: 160000 },
    ]);
  });

  it("EXPLAIN categoryFirstPage dùng idx_products_category_price và không còn Using filesort", async () => {
    const plan = await explain("categoryFirstPage", [3, 2]);
    expect(plan.key).toBe("idx_products_category_price");
    expect(String(plan.Extra)).not.toContain("filesort");
  });

  it("categoryNextPage sau (160000, 10) trả Sách MySQL (11) rồi Sách Node.js (9)", async () => {
    const rows = await run("categoryNextPage", [3, 160000, 160000, 10, 2]);
    expect(Object.keys(rows[0])).toEqual(["id", "name", "price"]);
    expect(rows.map((row) => [row.id, row.price])).toEqual([
      [11, 160000],
      [9, 175000],
    ]);
  });

  it("đi hết danh mục Sách bằng keyset, mỗi trang 2, được đúng 6 sản phẩm không lặp không sót", async () => {
    const ids = [];
    let page = await run("categoryFirstPage", [3, 2]);
    // Tối đa 10 trang: keyset sai có thể trả mãi cùng một trang.
    for (let guard = 0; page.length > 0 && guard < 10; guard += 1) {
      ids.push(...page.map((row) => row.id));
      const last = page[page.length - 1];
      page = await run("categoryNextPage", [3, last.price, last.price, last.id, 2]);
    }
    expect(ids).toEqual([5, 10, 11, 9, 8, 12]);
  });

  it("categoryNextPage không dùng OFFSET và EXPLAIN chọn idx_products_category_price", async () => {
    expect(catalog.categoryNextPage).not.toMatch(/OFFSET/i);
    const plan = await explain("categoryNextPage", [3, 160000, 160000, 10, 2]);
    expect(plan.key).toBe("idx_products_category_price");
  });
});
