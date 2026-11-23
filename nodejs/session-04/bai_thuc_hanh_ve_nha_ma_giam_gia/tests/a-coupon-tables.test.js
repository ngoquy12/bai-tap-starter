// Phần A: ba bảng của mô-đun mã giảm giá và chỉ mục. KHÔNG sửa tệp này.
// Mỗi test nạp lại cơ sở dữ liệu thử, chạy src/sql/coupon_tables.sql của bạn rồi nạp tests/fixtures/coupon-data.sql.
const { connect, prepareShop, select, errnoOf } = require("./helpers/coupon");

const ER_DUP_ENTRY = 1062;
const ER_ROW_IS_REFERENCED = 1451;
const ER_NO_REFERENCED_ROW = 1452;
const ER_CHECK_VIOLATED = 3819;
const WARN_DATA_TRUNCATED = 1265;

let db;
let prepared;

beforeEach(async () => {
  prepared = await prepareShop();
  db = await connect();
});

afterEach(async () => {
  await db.end();
});

describe("Phần A - cấu trúc bảng", () => {
  it("tệp src/sql/coupon_tables.sql chạy không lỗi", () => {
    expect(prepared.tableError && prepared.tableError.message).toBeNull();
  });

  it("có đủ ba bảng coupons, coupon_categories, coupon_redemptions", async () => {
    const { rows } = await select(
      db,
      "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name LIKE 'coupon%' ORDER BY table_name"
    );
    expect(rows.map((row) => row.name)).toEqual(["coupon_categories", "coupon_redemptions", "coupons"]);
  });

  it("nạp được dữ liệu mẫu tests/fixtures/coupon-data.sql (đúng tên cột)", () => {
    expect(prepared.fixtureError && prepared.fixtureError.message).toBeNull();
  });

  it("used_count mặc định là 0 khi thêm mã mới", async () => {
    await db.query(
      "INSERT INTO coupons (code, discount_type, discount_value, max_uses, expires_at) VALUES ('XMAS15', 'percent', 15, 4, '2099-12-25 23:59:59')"
    );
    const { rows } = await select(db, "SELECT used_count AS usedCount FROM coupons WHERE code = 'XMAS15'");
    expect(rows).toEqual([{ usedCount: 0 }]);
  });

  it("redeemed_at tự có giá trị khi không truyền", async () => {
    await db.query("INSERT INTO coupon_redemptions (coupon_id, order_id, discount_amount) VALUES (1, 4, 45000)");
    const { rows } = await select(
      db,
      "SELECT redeemed_at IS NOT NULL AS hasTime FROM coupon_redemptions WHERE order_id = 4"
    );
    expect(rows).toEqual([{ hasTime: 1 }]);
  });

  it("có chỉ mục idx_redemptions_coupon_date gồm coupon_id rồi redeemed_at", async () => {
    const { rows } = await select(
      db,
      "SELECT column_name AS col FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'coupon_redemptions' AND index_name = 'idx_redemptions_coupon_date' ORDER BY seq_in_index"
    );
    expect(rows.map((row) => row.col)).toEqual(["coupon_id", "redeemed_at"]);
  });
});

describe("Phần A - ràng buộc dữ liệu", () => {
  it("từ chối mã trùng code", async () => {
    const errno = await errnoOf(
      db.query(
        "INSERT INTO coupons (code, discount_type, discount_value, max_uses, expires_at) VALUES ('TECH10', 'amount', 20000, 1, '2099-01-01 00:00:00')"
      )
    );
    expect(errno).toBe(ER_DUP_ENTRY);
  });

  it("từ chối discount_type ngoài percent và amount", async () => {
    const errno = await errnoOf(
      db.query(
        "INSERT INTO coupons (code, discount_type, discount_value, max_uses, expires_at) VALUES ('FREESHIP', 'shipping', 20000, 1, '2099-01-01 00:00:00')"
      )
    );
    expect([WARN_DATA_TRUNCATED, ER_CHECK_VIOLATED]).toContain(errno);
  });

  it("từ chối discount_value bằng 0", async () => {
    const errno = await errnoOf(
      db.query(
        "INSERT INTO coupons (code, discount_type, discount_value, max_uses, expires_at) VALUES ('ZERO', 'amount', 0, 1, '2099-01-01 00:00:00')"
      )
    );
    expect(errno).toBe(ER_CHECK_VIOLATED);
  });

  it("từ chối used_count lớn hơn max_uses", async () => {
    const errno = await errnoOf(db.query("UPDATE coupons SET used_count = 2 WHERE code = 'FLASH5'"));
    expect(errno).toBe(ER_CHECK_VIOLATED);
  });

  it("từ chối gắn một mã vào cùng một danh mục hai lần", async () => {
    const errno = await errnoOf(db.query("INSERT INTO coupon_categories (coupon_id, category_id) VALUES (1, 1)"));
    expect(errno).toBe(ER_DUP_ENTRY);
  });

  it("từ chối danh mục không tồn tại", async () => {
    const errno = await errnoOf(db.query("INSERT INTO coupon_categories (coupon_id, category_id) VALUES (1, 99)"));
    expect(errno).toBe(ER_NO_REFERENCED_ROW);
  });

  it("từ chối áp mã lần thứ hai cho cùng một đơn", async () => {
    const errno = await errnoOf(
      db.query("INSERT INTO coupon_redemptions (coupon_id, order_id, discount_amount) VALUES (4, 1, 100000)")
    );
    expect(errno).toBe(ER_DUP_ENTRY);
  });

  it("từ chối lượt áp mã cho đơn không tồn tại", async () => {
    const errno = await errnoOf(
      db.query("INSERT INTO coupon_redemptions (coupon_id, order_id, discount_amount) VALUES (1, 99, 1000)")
    );
    expect(errno).toBe(ER_NO_REFERENCED_ROW);
  });

  it("không xóa được mã đã có lượt áp", async () => {
    const errno = await errnoOf(db.query("DELETE FROM coupons WHERE code = 'TECH10'"));
    expect(errno).toBe(ER_ROW_IS_REFERENCED);
  });

  it("xóa mã chưa ai dùng thì xóa luôn các dòng coupon_categories của mã đó", async () => {
    await db.query("DELETE FROM coupons WHERE code = 'NEWBIE'");
    const { rows } = await select(db, "SELECT COUNT(*) AS total FROM coupon_categories WHERE coupon_id = 5");
    expect(rows).toEqual([{ total: 0 }]);
  });
});
