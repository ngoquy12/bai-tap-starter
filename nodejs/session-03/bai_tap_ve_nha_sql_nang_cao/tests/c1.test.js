// C1: bảng suppliers và product_suppliers trong src/sql/c1_suppliers.sql. KHÔNG sửa tệp này.
const { connect, freshDatabase, errnoOf } = require("./helpers/hw");

const SQL_FILE = "src/sql/c1_suppliers.sql";
let db;

beforeEach(async () => {
  const errors = await freshDatabase([SQL_FILE]);
  if (errors[SQL_FILE]) {
    throw new Error(`Tệp ${SQL_FILE} lỗi khi chạy: ${errors[SQL_FILE].message}`);
  }
  db = await connect();
  await db.query(
    "INSERT INTO suppliers (id, name, phone) VALUES (1, 'Công ty Âm Thanh Việt', '0241234567'), (2, 'Nhà sách Bình Minh', '0287654321')"
  );
});

afterEach(async () => {
  await db.end();
});

describe("C1 - bảng suppliers và product_suppliers", () => {
  it("một sản phẩm nhận hàng từ hai nhà cung cấp", async () => {
    await db.query(
      "INSERT INTO product_suppliers (product_id, supplier_id, import_price) VALUES (1, 1, 380000), (1, 2, 395000)"
    );
    const [rows] = await db.query("SELECT supplier_id FROM product_suppliers WHERE product_id = 1 ORDER BY supplier_id");
    expect(rows.map((row) => row.supplier_id)).toEqual([1, 2]);
  });

  it("tên nhà cung cấp không được trùng (lỗi 1062)", async () => {
    const errno = await errnoOf(db.query("INSERT INTO suppliers (name, phone) VALUES ('Nhà sách Bình Minh', '0280000000')"));
    expect(errno).toBe(1062);
  });

  it("một cặp sản phẩm - nhà cung cấp chỉ có một hàng (lỗi 1062)", async () => {
    await db.query("INSERT INTO product_suppliers (product_id, supplier_id, import_price) VALUES (5, 2, 120000)");
    const errno = await errnoOf(
      db.query("INSERT INTO product_suppliers (product_id, supplier_id, import_price) VALUES (5, 2, 125000)")
    );
    expect(errno).toBe(1062);
  });

  it("không nhận sản phẩm không tồn tại (lỗi 1452)", async () => {
    const errno = await errnoOf(
      db.query("INSERT INTO product_suppliers (product_id, supplier_id, import_price) VALUES (99, 1, 100000)")
    );
    expect(errno).toBe(1452);
  });

  it("không xóa được nhà cung cấp đang cung cấp hàng (lỗi 1451)", async () => {
    await db.query("INSERT INTO product_suppliers (product_id, supplier_id, import_price) VALUES (8, 2, 170000)");
    const errno = await errnoOf(db.query("DELETE FROM suppliers WHERE id = 2"));
    expect(errno).toBe(1451);
  });

  it("xóa sản phẩm thì các hàng nhập hàng của sản phẩm mất theo", async () => {
    await db.query(
      "INSERT INTO product_suppliers (product_id, supplier_id, import_price) VALUES (4, 1, 900000), (8, 2, 170000)"
    );
    await db.query("DELETE FROM products WHERE id = 4");
    const [rows] = await db.query("SELECT product_id FROM product_suppliers ORDER BY product_id");
    expect(rows.map((row) => row.product_id)).toEqual([8]);
  });
});
