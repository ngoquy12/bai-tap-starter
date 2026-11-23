// Lab 5: procedure đặt hàng sp_place_order. KHÔNG sửa tệp này.
// Mỗi test tạo lại cơ sở dữ liệu thử rồi chạy src/sql/lab5_place_order.sql.
const { freshDatabase, openConnection, runSqlFile } = require("./helpers/db");

const ER_SIGNAL_EXCEPTION = 1644;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callError(connection, userId, productId, quantity) {
  try {
    await connection.query("CALL sp_place_order(?, ?, ?, @order_id)", [userId, productId, quantity]);
    return null;
  } catch (error) {
    return { errno: error.errno, message: error.sqlMessage };
  }
}

describe("Lab 5 - sp_place_order", () => {
  let connection;
  let observer;

  beforeEach(async () => {
    await freshDatabase();
    await runSqlFile("src", "sql", "lab5_place_order.sql");
    connection = await openConnection();
    observer = await openConnection();
  });

  afterEach(async () => {
    await connection.end();
    await observer.end();
  });

  async function stockOf(productId) {
    const [rows] = await observer.query("SELECT stock FROM products WHERE id = ?", [productId]);
    return rows[0].stock;
  }

  async function ordersAfterSeed() {
    const [rows] = await observer.query("SELECT id, user_id AS userId, total FROM orders WHERE id > 3 ORDER BY id");
    return rows;
  }

  it("Hùng đặt 2 Chuột không dây: đơn 4 tổng 640000, giá dòng 320000, kho 40 còn 38", async () => {
    await connection.query("CALL sp_place_order(3, 6, 2, @order_id)");
    const [out] = await connection.query("SELECT @order_id AS orderId");
    expect(out[0].orderId).toBe(4);
    expect(await ordersAfterSeed()).toEqual([{ id: 4, userId: 3, total: 640000 }]);
    const [items] = await observer.query(
      "SELECT product_id AS productId, quantity, unit_price AS unitPrice FROM order_items WHERE order_id = 4"
    );
    expect(items).toEqual([{ productId: 6, quantity: 2, unitPrice: 320000 }]);
    expect(await stockOf(6)).toBe(38);
  });

  it("đặt đúng 12 Bàn phím cơ (bằng tồn kho) thành công, kho còn 0", async () => {
    await connection.query("CALL sp_place_order(2, 2, 12, @order_id)");
    expect(await stockOf(2)).toBe(0);
    expect(await ordersAfterSeed()).toEqual([{ id: 4, userId: 2, total: 10680000 }]);
  });

  it("Lan đặt Giày chạy bộ (kho 0): lỗi 1644 'Không đủ hàng trong kho', chính kết nối đó không còn đơn dở", async () => {
    expect(await callError(connection, 2, 4, 1)).toEqual({
      errno: ER_SIGNAL_EXCEPTION,
      message: "Không đủ hàng trong kho",
    });
    const [rows] = await connection.query("SELECT COUNT(*) AS total FROM orders");
    expect(rows[0].total).toBe(3);
  });

  it("đặt lỗi rồi đặt tiếp trên cùng kết nối: chỉ đơn đặt thành công được lưu", async () => {
    await callError(connection, 2, 4, 1);
    await connection.query("CALL sp_place_order(3, 6, 2, @order_id)");
    const orders = await ordersAfterSeed();
    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({ userId: 3, total: 640000 });
  });

  it("số lượng 0 bị từ chối bằng lỗi 1644 'Số lượng không hợp lệ' và không tạo đơn", async () => {
    expect(await callError(connection, 2, 1, 0)).toEqual({
      errno: ER_SIGNAL_EXCEPTION,
      message: "Số lượng không hợp lệ",
    });
    expect(await ordersAfterSeed()).toEqual([]);
    expect(await stockOf(1)).toBe(25);
  });

  it("đặt hàng trong lúc phiên khác đang trừ kho chưa COMMIT: kho Bàn phím cơ 12 còn đúng 10", async () => {
    // Phiên observer đang bán 1 Bàn phím cơ ở quầy, chưa COMMIT.
    await observer.query("START TRANSACTION");
    await observer.query("UPDATE products SET stock = stock - 1 WHERE id = 2");
    const pending = connection.query("CALL sp_place_order(3, 2, 1, @order_id)");
    await wait(500);
    await observer.query("COMMIT");
    await pending;
    expect(await stockOf(2)).toBe(10);
  });
});
