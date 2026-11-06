// Test tự chấm Bài 6 (phần 3): /orders. Token ký bằng tokenFor() nên không phải đăng nhập.
// Không so sánh createdAt vì giá trị phụ thuộc giờ máy chủ.
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/db/pool");
const { resetDatabase } = require("./helpers/db");
const { tokenFor } = require("./helpers/token");

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

const bearer = (token) => "Bearer " + token;
const admin = bearer(tokenFor(1, "admin"));
const lan = bearer(tokenFor(2, "customer"));
const hung = bearer(tokenFor(3, "customer"));

const ids = (res) => res.body.data.map((order) => order.id);

async function stockOf(productId) {
  const [[row]] = await pool.query("SELECT stock FROM products WHERE id = ?", [productId]);
  return row.stock;
}

async function statusOf(orderId) {
  const [[row]] = await pool.query("SELECT status FROM orders WHERE id = ?", [orderId]);
  return row.status;
}

async function countOrders() {
  const [[row]] = await pool.query("SELECT COUNT(*) AS n FROM orders");
  return row.n;
}

const ORDER_1_ITEMS = [
  { productId: 1, name: "Tai nghe Bluetooth", quantity: 2, unitPrice: 450000 },
  { productId: 3, name: "Áo thun", quantity: 1, unitPrice: 199000 },
];

describe("POST /orders", () => {
  it("khách đặt hàng: 201, đơn pending kèm items, tổng tiền đúng và kho bị trừ", async () => {
    const res = await request(app)
      .post("/orders")
      .set("Authorization", lan)
      .send({ items: [{ productId: 1, quantity: 2 }, { productId: 3, quantity: 1 }] });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 5, userId: 2, status: "pending", total: 1099000, items: ORDER_1_ITEMS });
    expect(res.body.createdAt).toBeTruthy();
    expect(await stockOf(1)).toBe(23);
    expect(await stockOf(3)).toBe(49);
  });

  it("không token: 401; token admin: 403; không có đơn nào được tạo", async () => {
    const body = { items: [{ productId: 1, quantity: 1 }] };
    const anonymous = await request(app).post("/orders").send(body);
    expect(anonymous.status).toBe(401);
    const asAdmin = await request(app).post("/orders").set("Authorization", admin).send(body);
    expect(asAdmin.status).toBe(403);
    expect(await countOrders()).toBe(4);
  });

  it("đơn lỗi không để lại gì: thiếu hàng 409 và sản phẩm không có 404, kho dòng trước được hoàn lại", async () => {
    const short = await request(app)
      .post("/orders")
      .set("Authorization", lan)
      .send({ items: [{ productId: 1, quantity: 1 }, { productId: 4, quantity: 1 }] });
    expect(short.status).toBe(409);
    expect(short.body).toEqual({ error: { code: "CONFLICT", message: "Không đủ hàng trong kho" } });
    const unknown = await request(app)
      .post("/orders")
      .set("Authorization", lan)
      .send({ items: [{ productId: 1, quantity: 1 }, { productId: 999, quantity: 1 }] });
    expect(unknown.status).toBe(404);
    expect(unknown.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy sản phẩm" } });
    expect(await stockOf(1)).toBe(25);
    expect(await countOrders()).toBe(4);
  });

  it("thân sai: 400 VALIDATION_ERROR, chỉ rõ trường lỗi", async () => {
    const empty = await request(app).post("/orders").set("Authorization", lan).send({ items: [] });
    expect(empty.status).toBe(400);
    expect(empty.body.error.details.map((d) => d.field)).toEqual(["items"]);
    const missing = await request(app).post("/orders").set("Authorization", lan).send({});
    expect(missing.body.error.details.map((d) => d.field)).toEqual(["items"]);
    const zero = await request(app)
      .post("/orders")
      .set("Authorization", lan)
      .send({ items: [{ productId: 1, quantity: 0 }] });
    expect(zero.status).toBe(400);
    expect(zero.body.error.details.map((d) => d.field)).toEqual(["items.0.quantity"]);
    expect(await countOrders()).toBe(4);
  });

  it("hai khách cùng đặt món cuối cùng: một đơn 201, một đơn 409, kho về 0", async () => {
    await pool.query("UPDATE products SET stock = 1 WHERE id = 5");
    const body = { items: [{ productId: 5, quantity: 1 }] };
    const results = await Promise.all([
      request(app).post("/orders").set("Authorization", lan).send(body),
      request(app).post("/orders").set("Authorization", hung).send(body),
    ]);
    expect(results.map((res) => res.status).sort()).toEqual([201, 409]);
    expect(await stockOf(5)).toBe(0);
    expect(await countOrders()).toBe(5);
  });
});

describe("GET /orders", () => {
  it("khách chỉ thấy đơn của mình, đơn mới nhất trước; userId của người khác bị bỏ qua", async () => {
    const forLan = await request(app).get("/orders").set("Authorization", lan);
    expect(forLan.status).toBe(200);
    expect(ids(forLan)).toEqual([2, 1]);
    expect(forLan.body.meta).toEqual({ page: 1, limit: 5, total: 2, totalPages: 1 });
    const forHung = await request(app).get("/orders").set("Authorization", hung);
    expect(ids(forHung)).toEqual([4, 3]);
    const peeking = await request(app).get("/orders?userId=3").set("Authorization", lan);
    expect(ids(peeking)).toEqual([2, 1]);
  });

  it("admin thấy mọi đơn và lọc được theo userId", async () => {
    const all = await request(app).get("/orders").set("Authorization", admin);
    expect(ids(all)).toEqual([4, 3, 2, 1]);
    expect(all.body.meta.total).toBe(4);
    const ofHung = await request(app).get("/orders?userId=3").set("Authorization", admin);
    expect(ids(ofHung)).toEqual([4, 3]);
    expect(ofHung.body.meta.total).toBe(2);
  });

  it("phân trang theo page và limit", async () => {
    const res = await request(app).get("/orders?limit=2&page=2").set("Authorization", admin);
    expect(ids(res)).toEqual([2, 1]);
    expect(res.body.meta).toEqual({ page: 2, limit: 2, total: 4, totalPages: 2 });
  });

  it("lọc theo status; mỗi đơn trong danh sách kèm items", async () => {
    const res = await request(app).get("/orders?status=paid").set("Authorization", lan);
    expect(ids(res)).toEqual([1]);
    expect(res.body.meta.total).toBe(1);
    expect(res.body.data[0]).toMatchObject({ userId: 2, status: "paid", total: 1099000, items: ORDER_1_ITEMS });
  });

  it("không token: 401; limit hoặc status sai: 400", async () => {
    expect((await request(app).get("/orders")).status).toBe(401);
    expect((await request(app).get("/orders?limit=0").set("Authorization", lan)).status).toBe(400);
    expect((await request(app).get("/orders?status=shipped").set("Authorization", lan)).status).toBe(400);
  });
});

describe("GET /orders/:id", () => {
  it("chủ đơn xem được, admin xem được đơn của người khác: 200 kèm items", async () => {
    const owner = await request(app).get("/orders/1").set("Authorization", lan);
    expect(owner.status).toBe(200);
    expect(owner.body).toMatchObject({ id: 1, userId: 2, status: "paid", total: 1099000, items: ORDER_1_ITEMS });
    expect(owner.body.createdAt).toBeTruthy();
    const byAdmin = await request(app).get("/orders/3").set("Authorization", admin);
    expect(byAdmin.status).toBe(200);
    expect(byAdmin.body.userId).toBe(3);
  });

  it("khách xem đơn của người khác: 403", async () => {
    const res = await request(app).get("/orders/3").set("Authorization", lan);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      error: { code: "FORBIDDEN", message: "Bạn không có quyền thực hiện thao tác này" },
    });
  });

  it("đơn không có: 404 Không tìm thấy đơn hàng (với cả admin và khách)", async () => {
    for (const token of [admin, lan]) {
      const res = await request(app).get("/orders/999").set("Authorization", token);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy đơn hàng" } });
    }
  });

  it("không token: 401; id không phải số: 400", async () => {
    expect((await request(app).get("/orders/1")).status).toBe(401);
    const bad = await request(app).get("/orders/abc").set("Authorization", admin);
    expect(bad.status).toBe(400);
    expect(bad.body.error.details[0].field).toBe("id");
  });
});

describe("PATCH /orders/:id/status", () => {
  const patch = (id, token, body) => request(app).patch(`/orders/${id}/status`).set("Authorization", token).send(body);

  it("admin chuyển pending sang paid: 200 với đơn sau khi sửa, kho không đổi", async () => {
    const res = await patch(2, admin, { status: "paid" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 2, status: "paid", total: 160000 });
    expect(res.body.items).toHaveLength(1);
    expect(await statusOf(2)).toBe("paid");
    expect(await stockOf(5)).toBe(30);
  });

  it("hủy đơn pending: 200 cancelled và kho được hoàn đúng số lượng", async () => {
    const res = await patch(2, admin, { status: "cancelled" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("cancelled");
    expect(await statusOf(2)).toBe("cancelled");
    expect(await stockOf(5)).toBe(31);
  });

  it("hủy đơn đã paid: hoàn kho cho mọi dòng của đơn", async () => {
    const res = await patch(1, admin, { status: "cancelled" });
    expect(res.status).toBe(200);
    expect(await statusOf(1)).toBe("cancelled");
    expect(await stockOf(1)).toBe(27);
    expect(await stockOf(3)).toBe(51);
  });

  it("chuyển không hợp lệ: 409 CONFLICT nêu trạng thái, trạng thái và kho không đổi", async () => {
    const reopen = await patch(4, admin, { status: "paid" });
    expect(reopen.status).toBe(409);
    expect(reopen.body).toEqual({
      error: { code: "CONFLICT", message: "Không thể chuyển đơn hàng từ cancelled sang paid" },
    });
    const again = await patch(4, admin, { status: "cancelled" });
    expect(again.status).toBe(409);
    expect(again.body.error.message).toBe("Không thể chuyển đơn hàng từ cancelled sang cancelled");
    const twice = await patch(1, admin, { status: "paid" });
    expect(twice.status).toBe(409);
    expect(twice.body.error.message).toBe("Không thể chuyển đơn hàng từ paid sang paid");
    expect(await statusOf(4)).toBe("cancelled");
    expect(await stockOf(4)).toBe(0);
    expect(await statusOf(1)).toBe("paid");
  });

  it("status ngoài danh sách (shipped, pending) hoặc thiếu: 400 ở trường status", async () => {
    for (const body of [{ status: "shipped" }, { status: "pending" }, {}]) {
      const res = await patch(2, admin, body);
      expect(res.status).toBe(400);
      expect(res.body.error.details.map((d) => d.field)).toEqual(["status"]);
    }
    expect(await statusOf(2)).toBe("pending");
  });

  it("khách (kể cả chủ đơn): 403; không token: 401; trạng thái không đổi", async () => {
    const owner = await patch(2, lan, { status: "cancelled" });
    expect(owner.status).toBe(403);
    const anonymous = await request(app).patch("/orders/2/status").send({ status: "cancelled" });
    expect(anonymous.status).toBe(401);
    expect(await statusOf(2)).toBe("pending");
    expect(await stockOf(5)).toBe(30);
  });

  it("đơn không có: 404 Không tìm thấy đơn hàng", async () => {
    const res = await patch(999, admin, { status: "cancelled" });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy đơn hàng" } });
  });

  it("lỗi giữa chừng khi hoàn kho: 500, đơn giữ nguyên trạng thái và kho dòng đã hoàn được trả về cũ", async () => {
    // Kho sản phẩm 6 (dòng thứ hai của đơn 3) ở mức tối đa của cột nên cộng thêm sẽ báo lỗi từ MySQL
    await pool.query("UPDATE products SET stock = 4294967295 WHERE id = 6");
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await patch(3, admin, { status: "cancelled" });
    quiet.mockRestore();
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { code: "INTERNAL_ERROR", message: "Lỗi máy chủ" } });
    expect(await statusOf(3)).toBe("paid");
    expect(await stockOf(2)).toBe(12);
  });

  it("hai yêu cầu hủy cùng một đơn đồng thời: một 200, một 409, kho chỉ hoàn một lần", async () => {
    const results = await Promise.all([
      patch(2, admin, { status: "cancelled" }),
      patch(2, admin, { status: "cancelled" }),
    ]);
    expect(results.map((res) => res.status).sort()).toEqual([200, 409]);
    expect(await statusOf(2)).toBe("cancelled");
    expect(await stockOf(5)).toBe(31);
  });
});
