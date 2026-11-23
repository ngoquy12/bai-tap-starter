// P1: hai truy vấn do AI sinh trong src/sql/p1_ai_customer_report.js và nhật ký NHAT_KY_P1.md. KHÔNG sửa tệp này.
// Dữ liệu: db/seed.sql cộng tests/fixtures/p1-customers.sql (khách 4, 5, 6 và đơn 4 đến 7).
const { connect, freshDatabase, select, sqlText, readFile } = require("./helpers/hw");
const { customerOverview, topCustomersPage } = require("../src/sql/p1_ai_customer_report");

let db;

beforeAll(async () => {
  await freshDatabase(["tests/fixtures/p1-customers.sql"]);
  db = await connect();
});

afterAll(async () => {
  await db.end();
});

describe("P1 - customerOverview", () => {
  it("trả đúng tên và thứ tự cột", async () => {
    const { columns } = await select(db, sqlText(customerOverview, "customerOverview"));
    expect(columns).toEqual(["userId", "fullName", "orderCount", "itemsBought", "totalSpent"]);
  });

  it("mỗi người dùng một hàng, số đơn, số món và tổng chi tiêu đúng", async () => {
    const { rows } = await select(db, customerOverview);
    expect(rows).toEqual([
      { userId: 3, fullName: "Trần Văn Hùng", orderCount: 1, itemsBought: 3, totalSpent: 1530000 },
      { userId: 2, fullName: "Nguyễn Thị Lan", orderCount: 2, itemsBought: 4, totalSpent: 1259000 },
      { userId: 4, fullName: "Lê Minh Khoa", orderCount: 1, itemsBought: 2, totalSpent: 1100000 },
      { userId: 5, fullName: "Phạm Thu Hà", orderCount: 2, itemsBought: 2, totalSpent: 1100000 },
      { userId: 1, fullName: "Quản trị Rikkei", orderCount: 0, itemsBought: 0, totalSpent: 0 },
      { userId: 6, fullName: "Đỗ Quang Minh", orderCount: 0, itemsBought: 0, totalSpent: 0 },
    ]);
  });
});

describe("P1 - topCustomersPage", () => {
  it("trả đúng tên và thứ tự cột", async () => {
    const { columns } = await select(db, sqlText(topCustomersPage, "topCustomersPage"), [2, 0]);
    expect(columns).toEqual(["userId", "fullName", "totalSpent", "spendRank"]);
  });

  it("trang 1 (2 dòng): Hùng hạng 1, Lan hạng 2", async () => {
    const { rows } = await select(db, topCustomersPage, [2, 0]);
    expect(rows.map((row) => [row.userId, row.spendRank])).toEqual([
      [3, 1],
      [2, 2],
    ]);
  });

  it("trang 2 (2 dòng): Khoa và Hà chi tiêu bằng nhau nên cùng hạng 3", async () => {
    const { rows } = await select(db, topCustomersPage, [2, 2]);
    expect(rows.map((row) => [row.userId, row.spendRank])).toEqual([
      [4, 3],
      [5, 3],
    ]);
  });

  it("trang 3 (2 dòng): hai người chưa mua cùng hạng 5", async () => {
    const { rows } = await select(db, topCustomersPage, [2, 4]);
    expect(rows.map((row) => [row.userId, row.totalSpent, row.spendRank])).toEqual([
      [1, 0, 5],
      [6, 0, 5],
    ]);
  });
});

describe("P1 - nhật ký giữ, sửa, loại bỏ", () => {
  it("NHAT_KY_P1.md có ít nhất 3 dòng đã điền quyết định và bằng chứng", () => {
    const lines = readFile("NHAT_KY_P1.md").split("\n");
    const filled = lines.filter((line) => {
      const cells = line.split("|").map((cell) => cell.trim());
      return cells.length >= 6 && /^(Giữ|Sửa|Loại bỏ)$/.test(cells[2]) && cells[4].length > 0;
    });
    expect(filled.length).toBeGreaterThanOrEqual(3);
  });
});
