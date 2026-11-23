// C2: truy vấn customerSpending trong src/sql/c2_customer_spending.js. KHÔNG sửa tệp này.
const { connect, freshDatabase, select, sqlText } = require("./helpers/hw");
const { customerSpending } = require("../src/sql/c2_customer_spending");

let db;

beforeAll(async () => {
  await freshDatabase();
  db = await connect();
});

afterAll(async () => {
  await db.end();
});

describe("C2 - customerSpending", () => {
  it("trả đúng tên và thứ tự cột", async () => {
    const { columns } = await select(db, sqlText(customerSpending, "customerSpending"));
    expect(columns).toEqual(["userId", "fullName", "orderCount", "totalSpent"]);
  });

  it("đủ ba người dùng trên dữ liệu mẫu, người chưa mua có 0 đơn và 0 đồng", async () => {
    const { rows } = await select(db, customerSpending);
    expect(rows).toEqual([
      { userId: 3, fullName: "Trần Văn Hùng", orderCount: 1, totalSpent: 1530000 },
      { userId: 2, fullName: "Nguyễn Thị Lan", orderCount: 2, totalSpent: 1259000 },
      { userId: 1, fullName: "Quản trị Rikkei", orderCount: 0, totalSpent: 0 },
    ]);
  });

  it("đơn mới 450.000 đồng của Lan đưa Lan lên đầu", async () => {
    await db.query("INSERT INTO orders (user_id, total) VALUES (2, 450000)");
    const { rows } = await select(db, customerSpending);
    expect(rows[0]).toEqual({ userId: 2, fullName: "Nguyễn Thị Lan", orderCount: 3, totalSpent: 1709000 });
  });
});
