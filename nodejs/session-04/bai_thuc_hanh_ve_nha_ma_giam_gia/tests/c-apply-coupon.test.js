// Phần C: procedure sp_apply_coupon, trigger hoàn lượt và view v_order_payments. KHÔNG sửa tệp này.
// Mỗi test nạp lại dữ liệu, chạy bảng của bạn, dữ liệu mẫu, rồi hai tệp sp_apply_coupon.sql và coupon_trigger_view.sql.
// Mỗi test dùng một kết nối riêng: gọi procedure và đọc lại trên CÙNG kết nối đó.
const { connect, prepareShop, select, applyCoupon } = require("./helpers/coupon");

const ER_DUP_ENTRY = 1062;
const ER_SIGNAL = 1644;

let db;
let prepared;

beforeEach(async () => {
  prepared = await prepareShop({ withRoutines: true });
  db = await connect();
});

afterEach(async () => {
  await db.end();
});

async function usedCounts() {
  const { rows } = await select(db, "SELECT code, used_count AS usedCount FROM coupons ORDER BY id");
  return Object.fromEntries(rows.map((row) => [row.code, row.usedCount]));
}

async function redemptionOf(orderId) {
  const { rows } = await select(
    db,
    "SELECT coupon_id AS couponId, discount_amount AS discountAmount FROM coupon_redemptions WHERE order_id = ?",
    [orderId]
  );
  return rows;
}

describe("Phần C - tạo đối tượng", () => {
  it("tệp src/sql/sp_apply_coupon.sql chạy không lỗi", () => {
    expect(prepared.procedureError && prepared.procedureError.message).toBeNull();
  });

  it("tệp src/sql/coupon_trigger_view.sql chạy không lỗi", () => {
    expect(prepared.triggerViewError && prepared.triggerViewError.message).toBeNull();
  });
});

describe("Phần C - sp_apply_coupon áp mã thành công", () => {
  it("TECH10 cho đơn 4 chỉ giảm trên Tai nghe Bluetooth: 45000", async () => {
    const result = await applyCoupon(db, 4, "TECH10");
    expect(result).toEqual({ discount: 45000 });
    expect(await redemptionOf(4)).toEqual([{ couponId: 1, discountAmount: 45000 }]);
    expect((await usedCounts()).TECH10).toBe(3);
  });

  it("BOOK50K cho đơn 9 giảm 50000", async () => {
    const result = await applyCoupon(db, 9, "BOOK50K");
    expect(result).toEqual({ discount: 50000 });
    expect((await usedCounts()).BOOK50K).toBe(2);
  });
});

describe("Phần C - sp_apply_coupon báo lỗi nghiệp vụ", () => {
  it("mã không tồn tại", async () => {
    const result = await applyCoupon(db, 4, "GIAM99");
    expect(result).toEqual({ errno: ER_SIGNAL, message: "Mã giảm giá không tồn tại" });
  });

  it("mã đã hết hạn", async () => {
    const result = await applyCoupon(db, 7, "SUMMER20");
    expect(result).toEqual({ errno: ER_SIGNAL, message: "Mã giảm giá đã hết hạn" });
  });

  it("đơn hàng không tồn tại", async () => {
    const result = await applyCoupon(db, 99, "TECH10");
    expect(result).toEqual({ errno: ER_SIGNAL, message: "Đơn hàng không tồn tại" });
  });

  it("đơn không có sản phẩm thuộc danh mục của mã", async () => {
    const result = await applyCoupon(db, 7, "BOOK50K");
    expect(result).toEqual({ errno: ER_SIGNAL, message: "Đơn hàng không có sản phẩm thuộc danh mục áp dụng" });
    expect(await redemptionOf(7)).toEqual([]);
  });

  it("mã đã hết lượt: báo lỗi, không tăng used_count, không ghi lượt áp", async () => {
    const result = await applyCoupon(db, 4, "FLASH5");
    expect(result).toEqual({ errno: ER_SIGNAL, message: "Mã giảm giá đã hết lượt sử dụng" });
    expect((await usedCounts()).FLASH5).toBe(1);
    expect(await redemptionOf(4)).toEqual([]);
  });

  it("ALL100K còn 1 lượt: lần đầu được, lần sau báo hết lượt", async () => {
    expect(await applyCoupon(db, 4, "ALL100K")).toEqual({ discount: 100000 });
    const second = await applyCoupon(db, 7, "ALL100K");
    expect(second).toEqual({ errno: ER_SIGNAL, message: "Mã giảm giá đã hết lượt sử dụng" });
    expect((await usedCounts()).ALL100K).toBe(2);
  });

  it("đơn đã áp mã: lỗi 1062 và used_count của mã mới không đổi", async () => {
    const result = await applyCoupon(db, 1, "ALL100K");
    expect(result.errno).toBe(ER_DUP_ENTRY);
    expect((await usedCounts()).ALL100K).toBe(1);
    expect(await redemptionOf(1)).toEqual([{ couponId: 1, discountAmount: 90000 }]);
  });
});

describe("Phần C - trigger hoàn lượt", () => {
  it("xóa lượt áp mã của đơn 1 trả lại một lượt cho TECH10, mã khác giữ nguyên", async () => {
    await db.query("DELETE FROM coupon_redemptions WHERE order_id = 1");
    expect(await usedCounts()).toEqual({
      TECH10: 1,
      BOOK50K: 1,
      SUMMER20: 1,
      ALL100K: 1,
      NEWBIE: 0,
      FLASH5: 1,
    });
  });
});

describe("Phần C - view v_order_payments", () => {
  it("trả đúng tên và thứ tự cột", async () => {
    const { columns } = await select(db, "SELECT * FROM v_order_payments ORDER BY order_id");
    expect(columns).toEqual(["order_id", "customer_name", "total", "coupon_code", "discount_amount", "payable"]);
  });

  it("có đủ chín đơn, kể cả đơn khách vãng lai và đơn chưa áp mã", async () => {
    const { rows } = await select(db, "SELECT * FROM v_order_payments ORDER BY order_id");
    expect(rows).toEqual([
      { order_id: 1, customer_name: "Nguyễn Thị Lan", total: 1099000, coupon_code: "TECH10", discount_amount: 90000, payable: 1009000 },
      { order_id: 2, customer_name: "Nguyễn Thị Lan", total: 160000, coupon_code: "BOOK50K", discount_amount: 50000, payable: 110000 },
      { order_id: 3, customer_name: "Trần Văn Hùng", total: 1530000, coupon_code: "TECH10", discount_amount: 153000, payable: 1377000 },
      { order_id: 4, customer_name: "Lê Minh Khoa", total: 930000, coupon_code: null, discount_amount: 0, payable: 930000 },
      { order_id: 5, customer_name: null, total: 800000, coupon_code: "ALL100K", discount_amount: 100000, payable: 700000 },
      { order_id: 6, customer_name: "Trần Văn Hùng", total: 320000, coupon_code: "FLASH5", discount_amount: 16000, payable: 304000 },
      { order_id: 7, customer_name: "Phạm Thu Hà", total: 398000, coupon_code: null, discount_amount: 0, payable: 398000 },
      { order_id: 8, customer_name: "Nguyễn Thị Lan", total: 1089000, coupon_code: "SUMMER20", discount_amount: 39800, payable: 1049200 },
      { order_id: 9, customer_name: "Phạm Thu Hà", total: 210000, coupon_code: null, discount_amount: 0, payable: 210000 },
    ]);
  });

  it("áp TECH10 cho đơn 4 thì view cập nhật ngay", async () => {
    await applyCoupon(db, 4, "TECH10");
    const { rows } = await select(db, "SELECT coupon_code, discount_amount, payable FROM v_order_payments WHERE order_id = 4");
    expect(rows).toEqual([{ coupon_code: "TECH10", discount_amount: 45000, payable: 885000 }]);
  });
});
