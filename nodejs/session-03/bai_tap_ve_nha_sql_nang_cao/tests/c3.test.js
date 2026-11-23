// C3: truy vấn customersWithoutCategory trong src/sql/c3_customers_without_category.js. KHÔNG sửa tệp này.
const { connect, freshDatabase, select, sqlText } = require("./helpers/hw");
const { customersWithoutCategory } = require("../src/sql/c3_customers_without_category");

let db;

beforeAll(async () => {
  await freshDatabase();
  db = await connect();
});

afterAll(async () => {
  await db.end();
});

describe("C3 - customersWithoutCategory", () => {
  it("trả đúng tên và thứ tự cột", async () => {
    const { columns } = await select(db, sqlText(customersWithoutCategory, "customersWithoutCategory"), [1]);
    expect(columns).toEqual(["id", "fullName", "email"]);
  });

  it("danh mục Điện tử (id 1): chỉ Quản trị Rikkei chưa mua", async () => {
    const { rows } = await select(db, customersWithoutCategory, [1]);
    expect(rows).toEqual([{ id: 1, fullName: "Quản trị Rikkei", email: "admin@rikkei.shop" }]);
  });

  it("danh mục Thời trang (id 2): Quản trị Rikkei và Trần Văn Hùng", async () => {
    const { rows } = await select(db, customersWithoutCategory, [2]);
    expect(rows.map((row) => row.id)).toEqual([1, 3]);
  });

  it("danh mục chưa có sản phẩm nào (id 99): cả ba người dùng", async () => {
    const { rows } = await select(db, customersWithoutCategory, [99]);
    expect(rows.map((row) => row.id)).toEqual([1, 2, 3]);
  });
});
