// Lab 1: bảng wishlists và ràng buộc khóa. KHÔNG sửa tệp này.
// Mỗi test tạo lại cơ sở dữ liệu thử rồi chạy src/sql/lab1_wishlists.sql của bạn.
const { freshDatabase, openConnection, tryRunSqlFile, errnoOf } = require("./helpers/db");

const ER_DUP_ENTRY = 1062;
const ER_NO_REFERENCED_ROW = 1452;

describe("Lab 1 - bảng wishlists", () => {
  let connection;
  let scriptError;

  beforeEach(async () => {
    await freshDatabase();
    scriptError = await tryRunSqlFile("src", "sql", "lab1_wishlists.sql");
    connection = await openConnection();
  });

  afterEach(async () => {
    await connection.end();
  });

  async function wishlistRows() {
    const [rows] = await connection.query(
      "SELECT user_id AS userId, product_id AS productId FROM wishlists ORDER BY user_id, product_id"
    );
    return rows;
  }

  it("tệp lab1_wishlists.sql chạy không lỗi và nạp đúng 5 lượt yêu thích mẫu", async () => {
    expect(scriptError).toBeNull();
    expect(await wishlistRows()).toEqual([
      { userId: 2, productId: 1 },
      { userId: 2, productId: 6 },
      { userId: 3, productId: 1 },
      { userId: 3, productId: 2 },
      { userId: 3, productId: 8 },
    ]);
  });

  it("khóa chính là khóa ghép (user_id, product_id)", async () => {
    const [rows] = await connection.query(
      `SELECT COLUMN_NAME AS columnName FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wishlists' AND CONSTRAINT_NAME = 'PRIMARY'
       ORDER BY ORDINAL_POSITION`
    );
    expect(rows.map((row) => row.columnName)).toEqual(["user_id", "product_id"]);
  });

  it("từ chối Lan thích lại Tai nghe Bluetooth (2, 1) với lỗi 1062", async () => {
    const errno = await errnoOf(connection.query("INSERT INTO wishlists (user_id, product_id) VALUES (2, 1)"));
    expect(errno).toBe(ER_DUP_ENTRY);
  });

  it("cho phép người khác thích cùng sản phẩm và một người thích thêm sản phẩm khác", async () => {
    await connection.query("INSERT INTO wishlists (user_id, product_id) VALUES (1, 1), (2, 2)");
    expect(await wishlistRows()).toHaveLength(7);
  });

  it("từ chối sản phẩm 99 không tồn tại với lỗi 1452", async () => {
    const errno = await errnoOf(connection.query("INSERT INTO wishlists (user_id, product_id) VALUES (2, 99)"));
    expect(errno).toBe(ER_NO_REFERENCED_ROW);
  });

  it("từ chối người dùng 99 không tồn tại với lỗi 1452", async () => {
    const errno = await errnoOf(connection.query("INSERT INTO wishlists (user_id, product_id) VALUES (99, 1)"));
    expect(errno).toBe(ER_NO_REFERENCED_ROW);
  });

  it("xóa tài khoản Lan thì mất 2 lượt yêu thích của Lan, đơn hàng của Lan vẫn còn", async () => {
    await connection.query("DELETE FROM users WHERE id = 2");
    expect(await wishlistRows()).toEqual([
      { userId: 3, productId: 1 },
      { userId: 3, productId: 2 },
      { userId: 3, productId: 8 },
    ]);
    const [orders] = await connection.query("SELECT COUNT(*) AS total FROM orders");
    expect(orders[0].total).toBe(3);
  });

  it("xóa sản phẩm 8 (chưa có trong đơn nào) thì mất lượt yêu thích (3, 8)", async () => {
    await connection.query("DELETE FROM products WHERE id = 8");
    expect(await wishlistRows()).toHaveLength(4);
  });
});
