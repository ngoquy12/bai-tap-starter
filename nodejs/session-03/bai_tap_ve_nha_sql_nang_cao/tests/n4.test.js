// N4: hai trigger trong src/sql/n4_order_total_triggers.sql. KHÔNG sửa tệp này.
const { connect, freshDatabase } = require("./helpers/hw");

const SQL_FILE = "src/sql/n4_order_total_triggers.sql";
let db;
let fileError;

beforeEach(async () => {
  const errors = await freshDatabase([SQL_FILE]);
  fileError = errors[SQL_FILE];
  db = await connect();
});

afterEach(async () => {
  await db.end();
});

async function totalOf(orderId) {
  const [[row]] = await db.query("SELECT total FROM orders WHERE id = ?", [orderId]);
  return row.total;
}

describe("N4 - trigger giữ orders.total", () => {
  it("tệp src/sql/n4_order_total_triggers.sql chạy không lỗi", () => {
    expect(fileError).toBeNull();
  });

  it("thêm 2 Chuột không dây (320.000) vào đơn 2: tổng 160.000 thành 800.000", async () => {
    await db.query("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (2, 6, 2, 320000)");
    expect(await totalOf(2)).toBe(800000);
  });

  it("xóa dòng 2 Tai nghe Bluetooth của đơn 1: tổng 1.099.000 thành 199.000", async () => {
    await db.query("DELETE FROM order_items WHERE id = 1");
    expect(await totalOf(1)).toBe(199000);
  });

  it("thêm rồi xóa cùng một dòng: tổng đơn 3 về như cũ", async () => {
    await db.query("INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (10, 3, 8, 3, 210000)");
    expect(await totalOf(3)).toBe(2160000);
    await db.query("DELETE FROM order_items WHERE id = 10");
    expect(await totalOf(3)).toBe(1530000);
  });
});
