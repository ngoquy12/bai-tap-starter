// Lab 6 (nâng cao): nhật ký kho bằng trigger. KHÔNG sửa tệp này.
// Mỗi test tạo lại cơ sở dữ liệu thử, chạy src/sql/lab5_place_order.sql (đã sửa ở Lab 5) rồi src/sql/lab6_inventory_logs.sql.
const { freshDatabase, openConnection, runSqlFile, tryRunSqlFile } = require("./helpers/db");

describe("Lab 6 - nhật ký kho inventory_logs", () => {
  let connection;
  let scriptError;

  beforeEach(async () => {
    await freshDatabase();
    await runSqlFile("src", "sql", "lab5_place_order.sql");
    scriptError = await tryRunSqlFile("src", "sql", "lab6_inventory_logs.sql");
    connection = await openConnection();
  });

  afterEach(async () => {
    await connection.end();
  });

  async function logs() {
    const [rows] = await connection.query(
      "SELECT product_id AS productId, old_stock AS oldStock, new_stock AS newStock FROM inventory_logs ORDER BY id"
    );
    return rows;
  }

  it("lab6_inventory_logs.sql chạy không lỗi, chạy lại lần hai cũng không lỗi, bảng mới rỗng", async () => {
    expect(scriptError).toBeNull();
    expect(await tryRunSqlFile("src", "sql", "lab6_inventory_logs.sql")).toBeNull();
    expect(await logs()).toEqual([]);
  });

  it("Hùng đặt 2 Chuột không dây qua sp_place_order thì ghi một dòng 40 thành 38", async () => {
    await connection.query("CALL sp_place_order(3, 6, 2, @order_id)");
    expect(await logs()).toEqual([{ productId: 6, oldStock: 40, newStock: 38 }]);
  });

  it("đơn thiếu hàng bị hủy không để lại dòng nhật ký nào", async () => {
    await connection.query("CALL sp_place_order(2, 2, 50, @order_id)").catch(() => null);
    expect(await logs()).toEqual([]);
  });

  it("chỉ đổi giá Tai nghe Bluetooth thì không ghi nhật ký", async () => {
    await connection.query("UPDATE products SET price = 430000 WHERE id = 1");
    expect(await logs()).toEqual([]);
  });

  it("nhập thêm 5 cuốn cho cả danh mục Sách thì ghi 2 dòng, mỗi sản phẩm một dòng", async () => {
    await connection.query("UPDATE products SET stock = stock + 5 WHERE category_id = 3");
    expect(await logs()).toEqual([
      { productId: 5, oldStock: 30, newStock: 35 },
      { productId: 8, oldStock: 22, newStock: 27 },
    ]);
  });
});
