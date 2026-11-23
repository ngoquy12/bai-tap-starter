// N1: index trong src/sql/n1_orders_index.sql và truy vấn trong src/sql/n1_big_orders.js. KHÔNG sửa tệp này.
// Test nạp thêm 20.000 đơn hàng (tests/fixtures/many-orders.sql) để MySQL có lý do dùng index.
const { connect, freshDatabase, select, sqlText } = require("./helpers/hw");
const { bigOrdersOfCustomer } = require("../src/sql/n1_big_orders");

const INDEX_FILE = "src/sql/n1_orders_index.sql";
const EXPECTED_LAN = [
  { id: 19524, total: 2045000 },
  { id: 18324, total: 2045000 },
  { id: 17124, total: 2045000 },
  { id: 15924, total: 2045000 },
  { id: 14724, total: 2045000 },
];
const EXPECTED_HUNG = [
  { id: 19924, total: 2045000 },
  { id: 18724, total: 2045000 },
  { id: 17524, total: 2045000 },
  { id: 16324, total: 2045000 },
];
let db;
let indexError;

beforeAll(async () => {
  const errors = await freshDatabase(["tests/fixtures/many-orders.sql", INDEX_FILE]);
  indexError = errors[INDEX_FILE];
  db = await connect();
});

afterAll(async () => {
  await db.end();
});

describe("N1 - index idx_orders_user_total", () => {
  it("tệp src/sql/n1_orders_index.sql chạy không lỗi", () => {
    expect(indexError).toBeNull();
  });

  it("index có đúng hai cột user_id rồi total", async () => {
    const { rows } = await select(
      db,
      `SELECT column_name AS columnName FROM information_schema.statistics
      WHERE table_schema = DATABASE() AND table_name = 'orders' AND index_name = 'idx_orders_user_total'
      ORDER BY seq_in_index`
    );
    expect(rows.map((row) => row.columnName)).toEqual(["user_id", "total"]);
  });
});

describe("N1 - bigOrdersOfCustomer", () => {
  it("trả đúng tên và thứ tự cột", async () => {
    const { columns } = await select(db, sqlText(bigOrdersOfCustomer, "bigOrdersOfCustomer"), [2, 1998000, 5]);
    expect(columns).toEqual(["id", "total"]);
  });

  it("Lan (user_id 2), từ 1.998.000 đồng, 5 đơn đầu", async () => {
    const { rows } = await select(db, bigOrdersOfCustomer, [2, 1998000, 5]);
    expect(rows).toEqual(EXPECTED_LAN);
  });

  it("Hùng (user_id 3), từ 2.040.000 đồng, 4 đơn đầu", async () => {
    const { rows } = await select(db, bigOrdersOfCustomer, [3, 2040000, 4]);
    expect(rows).toEqual(EXPECTED_HUNG);
  });

  it("EXPLAIN: đọc một đoạn của idx_orders_user_total, không sắp xếp thêm", async () => {
    const { rows } = await select(db, `EXPLAIN ${bigOrdersOfCustomer}`, [2, 1998000, 5]);
    expect(rows[0].key).toBe("idx_orders_user_total");
    expect(rows[0].type).toBe("range");
    expect(String(rows[0].Extra)).not.toMatch(/filesort/);
  });
});
