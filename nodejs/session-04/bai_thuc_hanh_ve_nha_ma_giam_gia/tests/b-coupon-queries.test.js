// Phần B: ba truy vấn trong src/sql/queries.js. KHÔNG sửa tệp này.
// Test dùng bảng của bạn (Phần A) và dữ liệu tests/fixtures/coupon-data.sql; truy vấn chỉ đọc nên nạp một lần.
const { connect, prepareShop, select } = require("./helpers/coupon");
const queries = require("../src/sql/queries");

let db;

async function run(name, params = []) {
  const sql = queries[name];
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

describe("Phần B - danh sách truy vấn", () => {
  it("src/sql/queries.js xuất đủ ba truy vấn đúng tên", () => {
    expect(Object.keys(queries).sort()).toEqual(
      ["activeCouponsForCategory", "couponUsageRanking", "findCouponByCode"].sort()
    );
  });
});

describe("Phần B - findCouponByCode", () => {
  it("trả đúng tên và thứ tự cột", async () => {
    const { columns } = await run("findCouponByCode", ["TECH10"]);
    expect(columns).toEqual(["id", "code", "discountType", "discountValue", "remainingUses"]);
  });

  it("tra mã TECH10 trả một hàng, còn 3 lượt", async () => {
    const { rows } = await run("findCouponByCode", ["TECH10"]);
    expect(rows).toEqual([{ id: 1, code: "TECH10", discountType: "percent", discountValue: 10, remainingUses: 3 }]);
  });

  it("mã không tồn tại trả mảng rỗng", async () => {
    const { rows } = await run("findCouponByCode", ["GIAM99"]);
    expect(rows).toEqual([]);
  });

  it("EXPLAIN cho thấy tra mã đọc thẳng một hàng qua chỉ mục (type const)", async () => {
    const { rows } = await select(db, `EXPLAIN ${queries.findCouponByCode}`, ["TECH10"]);
    expect(rows[0].type).toBe("const");
    expect(rows[0].key).not.toBeNull();
  });
});

describe("Phần B - activeCouponsForCategory", () => {
  it("trả đúng tên và thứ tự cột", async () => {
    const { columns } = await run("activeCouponsForCategory", [3]);
    expect(columns).toEqual(["code", "discountType", "discountValue", "remainingUses"]);
  });

  it("danh mục Sách (id 3) có ALL100K và BOOK50K", async () => {
    const { rows } = await run("activeCouponsForCategory", [3]);
    expect(rows).toEqual([
      { code: "ALL100K", discountType: "amount", discountValue: 100000, remainingUses: 1 },
      { code: "BOOK50K", discountType: "amount", discountValue: 50000, remainingUses: 2 },
    ]);
  });

  it("danh mục Thời trang (id 2) bỏ mã đã hết hạn", async () => {
    const { rows } = await run("activeCouponsForCategory", [2]);
    expect(rows.map((row) => row.code)).toEqual(["ALL100K", "NEWBIE"]);
  });
});

describe("Phần B - couponUsageRanking", () => {
  it("trả đúng tên và thứ tự cột", async () => {
    const { columns } = await run("couponUsageRanking");
    expect(columns).toEqual(["code", "usedCount", "totalDiscount", "usageRank"]);
  });

  it("xếp hạng đủ sáu mã, đồng hạng giữ cùng số hạng", async () => {
    const { rows } = await run("couponUsageRanking");
    expect(rows).toEqual([
      { code: "TECH10", usedCount: 2, totalDiscount: 243000, usageRank: 1 },
      { code: "ALL100K", usedCount: 1, totalDiscount: 100000, usageRank: 2 },
      { code: "BOOK50K", usedCount: 1, totalDiscount: 50000, usageRank: 2 },
      { code: "FLASH5", usedCount: 1, totalDiscount: 16000, usageRank: 2 },
      { code: "SUMMER20", usedCount: 1, totalDiscount: 39800, usageRank: 2 },
      { code: "NEWBIE", usedCount: 0, totalDiscount: 0, usageRank: 6 },
    ]);
  });
});
