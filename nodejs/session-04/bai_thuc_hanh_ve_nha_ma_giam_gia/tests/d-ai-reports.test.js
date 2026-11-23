// Phần D: ba truy vấn do AI sinh trong src/sql/ai_reports.js và nhật ký NHAT_KY_AI.md. KHÔNG sửa tệp này.
const { connect, prepareShop, select, readFile } = require("./helpers/coupon");
const reports = require("../src/sql/ai_reports");

let db;

async function run(name, params = []) {
  const sql = reports[name];
  if (typeof sql !== "string" || !/^\s*(SELECT|WITH)\b/i.test(sql)) {
    throw new Error(`Truy vấn ${name} phải là chuỗi bắt đầu bằng SELECT hoặc WITH`);
  }
  return select(db, sql, params);
}

beforeAll(async () => {
  await prepareShop();
  db = await connect();
});

afterAll(async () => {
  await db.end();
});

describe("Phần D - couponCategorySummary", () => {
  it("trả đúng tên và thứ tự cột", async () => {
    const { columns } = await run("couponCategorySummary");
    expect(columns).toEqual(["code", "categoryCount", "usedCount", "totalDiscount"]);
  });

  it("số liệu từng mã khớp bảng coupon_categories và coupon_redemptions", async () => {
    const { rows } = await run("couponCategorySummary");
    expect(rows).toEqual([
      { code: "ALL100K", categoryCount: 3, usedCount: 1, totalDiscount: 100000 },
      { code: "BOOK50K", categoryCount: 1, usedCount: 1, totalDiscount: 50000 },
      { code: "FLASH5", categoryCount: 1, usedCount: 1, totalDiscount: 16000 },
      { code: "NEWBIE", categoryCount: 2, usedCount: 0, totalDiscount: 0 },
      { code: "SUMMER20", categoryCount: 1, usedCount: 1, totalDiscount: 39800 },
      { code: "TECH10", categoryCount: 1, usedCount: 2, totalDiscount: 243000 },
    ]);
  });
});

describe("Phần D - customersWithoutCoupon", () => {
  it("trả đúng tên và thứ tự cột", async () => {
    const { columns } = await run("customersWithoutCoupon");
    expect(columns).toEqual(["id", "fullName"]);
  });

  it("có Lê Minh Khoa và Phạm Thu Hà", async () => {
    const { rows } = await run("customersWithoutCoupon");
    expect(rows).toEqual([
      { id: 4, fullName: "Lê Minh Khoa" },
      { id: 5, fullName: "Phạm Thu Hà" },
    ]);
  });
});

describe("Phần D - redemptionHistoryPage", () => {
  it("trả đúng tên và thứ tự cột", async () => {
    const { columns } = await run("redemptionHistoryPage", [2, 0]);
    expect(columns).toEqual(["redemptionId", "code", "orderId", "discountAmount"]);
  });

  it("trang 1 (2 dòng) là lượt 5 rồi lượt 4", async () => {
    const { rows } = await run("redemptionHistoryPage", [2, 0]);
    expect(rows.map((row) => row.redemptionId)).toEqual([5, 4]);
  });

  it("trang 2 (2 dòng) là lượt 3 rồi lượt 2, không lặp trang 1", async () => {
    const { rows } = await run("redemptionHistoryPage", [2, 2]);
    expect(rows).toEqual([
      { redemptionId: 3, code: "TECH10", orderId: 3, discountAmount: 153000 },
      { redemptionId: 2, code: "BOOK50K", orderId: 2, discountAmount: 50000 },
    ]);
  });
});

describe("Phần D - nhật ký giữ, sửa, loại bỏ", () => {
  it("NHAT_KY_AI.md có ít nhất 3 dòng đã điền đủ bốn cột", () => {
    const lines = readFile("NHAT_KY_AI.md").split(/\r?\n/);
    const filled = lines.filter((line) => {
      const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
      return (
        cells.length === 4 &&
        /^(Giữ|Sửa|Loại bỏ)$/.test(cells[1]) &&
        cells.every((cell) => cell.length > 0)
      );
    });
    expect(filled.length).toBeGreaterThanOrEqual(3);
  });
});
