// Test tự chấm Bài 4 (phần 2): orders.repository (đặt hàng, đọc đơn, hủy đơn) trên dữ liệu seed Rikkei Shop.
const pool = require("../src/db/pool");
const repository = require("../src/repositories/orders.repository");
const products = require("../src/repositories/products.repository");
const { resetDatabase } = require("./helpers/db");

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

async function stockOf(productId) {
  const [[row]] = await pool.query("SELECT stock FROM products WHERE id = ?", [productId]);
  return row.stock;
}

async function allStocks() {
  const [rows] = await pool.query("SELECT id, stock FROM products ORDER BY id");
  return rows;
}

async function countRows(table) {
  const [[row]] = await pool.query("SELECT COUNT(*) AS n FROM " + table);
  return row.n;
}

async function statusOf(orderId) {
  const [[row]] = await pool.query("SELECT status FROM orders WHERE id = ?", [orderId]);
  return row.status;
}

// Nếu một kết nối bị giữ mãi thì lời gọi treo; hàm này biến việc treo thành lỗi rõ ràng
function within(promise, ms = 4000) {
  return Promise.race([
    promise,
    new Promise((resolve, reject) => setTimeout(() => reject(new Error("Quá thời gian chờ: kết nối chưa được trả về pool")), ms)),
  ]);
}

const TWO_LINES = [
  { productId: 1, quantity: 2 },
  { productId: 3, quantity: 1 },
];

describe("createOrder: nhánh thành công", () => {
  it("trả id đơn mới và ghi đơn pending đúng người, tổng tiền bằng tổng số lượng nhân giá", async () => {
    const orderId = await repository.createOrder(2, TWO_LINES);
    expect(orderId).toBe(5);
    const [[order]] = await pool.query("SELECT user_id, status, total FROM orders WHERE id = ?", [orderId]);
    expect(order).toEqual({ user_id: 2, status: "pending", total: 1099000 });
  });

  it("ghi từng dòng order_items với số lượng và đơn giá tại lúc mua", async () => {
    const orderId = await repository.createOrder(2, TWO_LINES);
    const [items] = await pool.query(
      "SELECT product_id, quantity, unit_price FROM order_items WHERE order_id = ? ORDER BY id",
      [orderId]
    );
    expect(items).toEqual([
      { product_id: 1, quantity: 2, unit_price: 450000 },
      { product_id: 3, quantity: 1, unit_price: 199000 },
    ]);
  });

  it("trừ kho đúng số lượng đã mua và không đụng sản phẩm khác", async () => {
    await repository.createOrder(2, TWO_LINES);
    expect(await stockOf(1)).toBe(23);
    expect(await stockOf(3)).toBe(49);
    expect(await stockOf(2)).toBe(12);
  });
});

describe("createOrder: lỗi giữa chừng thì hoàn tác toàn bộ", () => {
  it("dòng sau hết hàng thì ném 409 và kho của dòng trước vẫn như cũ", async () => {
    const before = await allStocks();
    await expect(
      repository.createOrder(2, [
        { productId: 1, quantity: 1 },
        { productId: 4, quantity: 1 },
      ])
    ).rejects.toMatchObject({ status: 409, code: "CONFLICT", message: "Không đủ hàng trong kho" });
    expect(await allStocks()).toEqual(before);
    expect(await countRows("orders")).toBe(4);
    expect(await countRows("order_items")).toBe(6);
  });

  it("cùng một sản phẩm ở hai dòng mà tổng vượt kho thì ném 409 và kho không đổi", async () => {
    await expect(
      repository.createOrder(2, [
        { productId: 1, quantity: 20 },
        { productId: 1, quantity: 10 },
      ])
    ).rejects.toMatchObject({ status: 409, message: "Không đủ hàng trong kho" });
    expect(await stockOf(1)).toBe(25);
    expect(await countRows("orders")).toBe(4);
  });

  it("dòng sau là sản phẩm không tồn tại thì ném 404 và kho dòng trước vẫn như cũ", async () => {
    await expect(
      repository.createOrder(2, [
        { productId: 1, quantity: 1 },
        { productId: 999, quantity: 1 },
      ])
    ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND", message: "Không tìm thấy sản phẩm" });
    expect(await stockOf(1)).toBe(25);
    expect(await countRows("orders")).toBe(4);
  });

  it("người dùng không tồn tại thì ném 400 sau khi đã trừ kho, và kho được hoàn lại", async () => {
    const before = await allStocks();
    await expect(repository.createOrder(999, TWO_LINES)).rejects.toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Người dùng không tồn tại",
    });
    expect(await allStocks()).toEqual(before);
    expect(await countRows("orders")).toBe(4);
    expect(await countRows("order_items")).toBe(6);
  });

  it("danh sách dòng hàng rỗng thì ném 400 và không tạo đơn", async () => {
    await expect(repository.createOrder(2, [])).rejects.toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Đơn hàng phải có ít nhất một sản phẩm",
    });
    expect(await countRows("orders")).toBe(4);
  });

  it("số lượng 0, âm, có phần thập phân hoặc là chuỗi thì ném 400 và kho không đổi", async () => {
    const before = await allStocks();
    for (const quantity of [0, -1, 1.5, "2"]) {
      await expect(
        repository.createOrder(2, [
          { productId: 1, quantity: 1 },
          { productId: 3, quantity },
        ])
      ).rejects.toMatchObject({ status: 400, code: "VALIDATION_ERROR", message: "Số lượng phải là số nguyên dương" });
    }
    expect(await allStocks()).toEqual(before);
    expect(await countRows("orders")).toBe(4);
  });
});

describe("Đơn giá lưu theo giá lúc mua", () => {
  it("đổi giá sản phẩm sau khi đặt thì đơn cũ giữ nguyên, đơn mới dùng giá mới", async () => {
    const oldId = await repository.createOrder(2, [{ productId: 1, quantity: 2 }]);
    await products.update(1, { price: 500000 });
    const oldOrder = await repository.findOrderById(oldId);
    expect(oldOrder.total).toBe(900000);
    expect(oldOrder.items[0].unitPrice).toBe(450000);
    const newId = await repository.createOrder(2, [{ productId: 1, quantity: 2 }]);
    const newOrder = await repository.findOrderById(newId);
    expect(newOrder.total).toBe(1000000);
    expect(newOrder.items[0].unitPrice).toBe(500000);
  });
});

describe("findOrderById: đọc một đơn", () => {
  it("trả đơn kèm các dòng hàng có tên sản phẩm, đơn giá và số lượng", async () => {
    const order = await repository.findOrderById(1);
    expect(order).toMatchObject({
      id: 1,
      userId: 2,
      status: "paid",
      total: 1099000,
      items: [
        { productId: 1, name: "Tai nghe Bluetooth", quantity: 2, unitPrice: 450000 },
        { productId: 3, name: "Áo thun", quantity: 1, unitPrice: 199000 },
      ],
    });
    expect(order.createdAt).toBeInstanceOf(Date);
  });

  it("id không tồn tại thì trả null", async () => {
    expect(await repository.findOrderById(999)).toBeNull();
  });
});

describe("cancelOrder: hủy đơn và hoàn kho", () => {
  it("hủy đơn pending thì trả đơn đã hủy và hoàn kho các dòng hàng", async () => {
    const order = await repository.cancelOrder(2);
    expect(order).toMatchObject({ id: 2, status: "cancelled", items: [{ productId: 5, quantity: 1 }] });
    expect(await statusOf(2)).toBe("cancelled");
    expect(await stockOf(5)).toBe(31);
  });

  it("đơn vừa đặt nhiều dòng bị hủy thì kho mọi sản phẩm về đúng như trước khi đặt", async () => {
    const before = await allStocks();
    const orderId = await repository.createOrder(3, TWO_LINES);
    expect(await allStocks()).not.toEqual(before);
    await repository.cancelOrder(orderId);
    expect(await allStocks()).toEqual(before);
  });

  it("đơn đã thanh toán thì ném 409 và trạng thái, kho không đổi", async () => {
    const before = await allStocks();
    await expect(repository.cancelOrder(1)).rejects.toMatchObject({
      status: 409,
      code: "CONFLICT",
      message: "Chỉ hủy được đơn đang chờ xử lý",
    });
    expect(await statusOf(1)).toBe("paid");
    expect(await allStocks()).toEqual(before);
  });

  it("đơn đã hủy từ trước thì ném 409 và không hoàn kho thêm lần nữa", async () => {
    await expect(repository.cancelOrder(4)).rejects.toMatchObject({ status: 409, code: "CONFLICT" });
    expect(await stockOf(4)).toBe(0);
  });

  it("đơn không tồn tại thì ném 404", async () => {
    await expect(repository.cancelOrder(999)).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
      message: "Không tìm thấy đơn hàng",
    });
  });

  it("lỗi khi hoàn kho giữa chừng thì đơn vẫn pending và các dòng đã hoàn được hoàn tác", async () => {
    const orderId = await repository.createOrder(2, [
      { productId: 1, quantity: 1 },
      { productId: 3, quantity: 1 },
    ]);
    // Kho sản phẩm 3 đầy tới giới hạn của cột nên cộng thêm sẽ bị MySQL từ chối
    await pool.query("UPDATE products SET stock = 4294967295 WHERE id = 3");
    await expect(repository.cancelOrder(orderId)).rejects.toThrow();
    expect(await statusOf(orderId)).toBe("pending");
    expect(await stockOf(1)).toBe(24);
  });
});

describe("Kết nối được trả về pool và đặt hàng đồng thời", () => {
  it("sau nhiều lần đặt hàng lỗi và thành công (nhiều hơn số kết nối của pool) vẫn lấy được kết nối", async () => {
    for (let i = 0; i < 12; i++) {
      await expect(
        within(
          repository.createOrder(2, [
            { productId: 1, quantity: 1 },
            { productId: 4, quantity: 1 },
          ])
        )
      ).rejects.toMatchObject({ status: 409 });
      await expect(within(repository.createOrder(2, [{ productId: 999, quantity: 1 }]))).rejects.toMatchObject({
        status: 404,
      });
      await within(repository.createOrder(2, [{ productId: 3, quantity: 1 }]));
    }
    const [rows] = await within(pool.query("SELECT 1 AS ok"));
    expect(rows).toEqual([{ ok: 1 }]);
    expect(await stockOf(3)).toBe(38);
  });

  it("sau nhiều lần hủy đơn lỗi (nhiều hơn số kết nối của pool) vẫn lấy được kết nối", async () => {
    for (let i = 0; i < 12; i++) {
      await expect(within(repository.cancelOrder(1))).rejects.toMatchObject({ status: 409 });
      await expect(within(repository.cancelOrder(999))).rejects.toMatchObject({ status: 404 });
    }
    const order = await within(repository.cancelOrder(2));
    expect(order.status).toBe("cancelled");
  });

  it("hai đơn cùng mua sản phẩm còn đúng 1 thì đúng một đơn thành công và kho không âm", async () => {
    await pool.query("UPDATE products SET stock = 1 WHERE id = 1");
    const results = await Promise.allSettled([
      repository.createOrder(2, [{ productId: 1, quantity: 1 }]),
      repository.createOrder(3, [{ productId: 1, quantity: 1 }]),
    ]);
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toMatchObject({ status: 409, message: "Không đủ hàng trong kho" });
    expect(await stockOf(1)).toBe(0);
    expect(await countRows("orders")).toBe(5);
    expect(await countRows("order_items")).toBe(7);
  });

  it("sáu đơn cùng mua trên kho còn 3 thì đúng ba đơn thành công", async () => {
    await pool.query("UPDATE products SET stock = 3 WHERE id = 1");
    const results = await Promise.allSettled(
      [2, 3, 2, 3, 2, 3].map((userId) => repository.createOrder(userId, [{ productId: 1, quantity: 1 }]))
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(3);
    const rejected = results.filter((r) => r.status === "rejected");
    expect(rejected).toHaveLength(3);
    expect(rejected.every((r) => r.reason.status === 409)).toBe(true);
    expect(await stockOf(1)).toBe(0);
    expect(await countRows("orders")).toBe(7);
  });

  it("hai lần hủy cùng một đơn đồng thời thì đúng một lần thành công và kho hoàn đúng một lần", async () => {
    const orderId = await repository.createOrder(2, TWO_LINES);
    const results = await Promise.allSettled([repository.cancelOrder(orderId), repository.cancelOrder(orderId)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const rejected = results.filter((r) => r.status === "rejected");
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toMatchObject({ status: 409 });
    expect(await stockOf(1)).toBe(25);
    expect(await stockOf(3)).toBe(50);
  });
});
