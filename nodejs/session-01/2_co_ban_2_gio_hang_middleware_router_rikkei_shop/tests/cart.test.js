// Bộ test tự chấm Bài 2: giỏ hàng với middleware, Router và lỗi tập trung (45 test)
const request = require("supertest");
const app = require("../src/app");
const products = require("../src/data/products");
const carts = require("../src/data/carts");
const asyncHandler = require("../src/middlewares/asyncHandler");
const errorHandler = require("../src/middlewares/errorHandler");

const API_KEY = process.env.API_KEY;
// Bản sao 5 sản phẩm gốc để trả kho về nguyên trạng trước mỗi test
const SEED = products.map((p) => ({ ...p }));

let logSpy;
let errorSpy;

beforeEach(() => {
  products.splice(0, products.length, ...SEED.map((p) => ({ ...p })));
  carts.clear();
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Gửi một yêu cầu. options: cart (X-Cart-Id), key (true thì gửi đúng khóa API), rawKey (khóa tùy ý),
// body (đối tượng hoặc chuỗi JSON thô), requestId (X-Request-Id). Quá 3 giây coi là treo.
function call(method, path, options = {}) {
  let req = request(app)[method](path).timeout({ deadline: 3000 });
  if (options.cart !== undefined) req = req.set("X-Cart-Id", options.cart);
  if (options.key) req = req.set("X-API-Key", API_KEY);
  if (options.rawKey !== undefined) req = req.set("X-API-Key", options.rawKey);
  if (options.requestId !== undefined) req = req.set("X-Request-Id", options.requestId);
  if (typeof options.body === "string") {
    req = req.set("Content-Type", "application/json").send(options.body);
  } else if (options.body !== undefined) {
    req = req.send(options.body);
  }
  return req;
}

// Thêm hàng vào giỏ bằng API thật và kiểm tra thêm thành công
async function addItem(cart, productId, quantity) {
  const res = await call("post", "/cart/items", { cart, key: true, body: { productId, quantity } });
  expect(res.status).toBe(201);
  return res;
}

describe("logger", () => {
  it("ghi method và URL đầy đủ kể cả query", async () => {
    await call("get", "/cart?x=1", { cart: "A" });
    expect(logSpy).toHaveBeenCalledWith("GET", "/cart?x=1");
  });

  it("ghi cả yêu cầu bị requireApiKey chặn, tức đứng đầu chuỗi middleware", async () => {
    const res = await call("post", "/cart/items", { cart: "A", body: { productId: 1, quantity: 1 } });
    expect(res.status).toBe(401);
    expect(logSpy).toHaveBeenCalledWith("POST", "/cart/items");
  });

  it("ghi đúng một dòng cho mỗi yêu cầu", async () => {
    await call("get", "/products");
    expect(logSpy).toHaveBeenCalledTimes(1);
  });
});

describe("requestId", () => {
  it("phản hồi có header X-Request-Id dạng req-<số>", async () => {
    const res = await call("get", "/products");
    expect(res.headers["x-request-id"]).toMatch(/^req-\d+$/);
  });

  it("hai yêu cầu liên tiếp nhận hai mã khác nhau", async () => {
    const first = await call("get", "/products");
    const second = await call("get", "/products");
    expect(first.headers["x-request-id"]).toBeTruthy();
    expect(second.headers["x-request-id"]).toBeTruthy();
    expect(first.headers["x-request-id"]).not.toBe(second.headers["x-request-id"]);
  });

  it("giữ nguyên mã mà client đã gửi trong X-Request-Id", async () => {
    const res = await call("get", "/products", { requestId: "ma-cua-client-123" });
    expect(res.headers["x-request-id"]).toBe("ma-cua-client-123");
  });

  it("có mặt cả trên phản hồi lỗi 401, 404 và 400 do JSON hỏng", async () => {
    const unauthorized = await call("post", "/cart/items", { cart: "A", body: { productId: 1 } });
    const notFound = await call("get", "/orders");
    const badJson = await call("post", "/cart/items", { cart: "A", key: true, body: '{"productId":' });
    expect([unauthorized.status, notFound.status, badJson.status]).toEqual([401, 404, 400]);
    for (const res of [unauthorized, notFound, badJson]) {
      expect(res.headers["x-request-id"]).toMatch(/^req-\d+$/);
    }
  });
});

describe("requireApiKey", () => {
  it("yêu cầu GET đi qua mà không cần khóa", async () => {
    const res = await call("get", "/cart", { cart: "A" });
    expect(res.status).toBe(200);
  });

  it("POST thiếu khóa nhận 401 đúng thân lỗi và giỏ không đổi", async () => {
    const res = await call("post", "/cart/items", { cart: "A", body: { productId: 1, quantity: 1 } });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: { code: "UNAUTHORIZED", message: "Thiếu hoặc sai mã xác thực" } });
    const cart = await call("get", "/cart", { cart: "A" });
    expect(cart.body.items).toEqual([]);
  });

  it("sai khóa cũng nhận 401", async () => {
    const res = await call("post", "/cart/items", {
      cart: "A",
      rawKey: "khoa-sai",
      body: { productId: 1, quantity: 1 },
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("PATCH, DELETE dòng hàng và DELETE giỏ thiếu khóa đều nhận 401, giỏ giữ nguyên", async () => {
    await addItem("A", 1, 2);
    const patch = await call("patch", "/cart/items/1", { cart: "A", body: { quantity: 5 } });
    const removeItem = await call("delete", "/cart/items/1", { cart: "A" });
    const clear = await call("delete", "/cart", { cart: "A" });
    expect([patch.status, removeItem.status, clear.status]).toEqual([401, 401, 401]);
    const cart = await call("get", "/cart", { cart: "A" });
    expect(cart.body.items).toHaveLength(1);
    expect(cart.body.items[0].quantity).toBe(2);
  });
});

describe("cartContext", () => {
  it("GET /cart thiếu X-Cart-Id nhận 400 đúng thân lỗi", async () => {
    const res = await call("get", "/cart");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: { code: "VALIDATION_ERROR", message: "Thiếu header X-Cart-Id" } });
  });

  it("X-Cart-Id rỗng hoặc chỉ có dấu cách cũng nhận 400", async () => {
    const empty = await call("get", "/cart", { cart: "" });
    const blank = await call("get", "/cart", { cart: "   " });
    expect(empty.status).toBe(400);
    expect(blank.status).toBe(400);
    expect(blank.body.error.message).toBe("Thiếu header X-Cart-Id");
  });

  it("yêu cầu ghi có khóa nhưng thiếu X-Cart-Id nhận 400", async () => {
    const res = await call("post", "/cart/items", { key: true, body: { productId: 1, quantity: 1 } });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Thiếu header X-Cart-Id");
  });

  it("chỉ áp dụng cho /cart: GET /products không cần X-Cart-Id", async () => {
    const res = await call("get", "/products");
    expect(res.status).toBe(200);
  });

  it("mỗi X-Cart-Id là một giỏ riêng", async () => {
    await addItem("A", 1, 2);
    await addItem("B", 3, 1);
    const cartA = await call("get", "/cart", { cart: "A" });
    const cartB = await call("get", "/cart", { cart: "B" });
    const cartC = await call("get", "/cart", { cart: "C" });
    expect(cartA.body.items.map((i) => i.productId)).toEqual([1]);
    expect(cartB.body.items.map((i) => i.productId)).toEqual([3]);
    expect(cartC.body.items).toEqual([]);
  });
});

describe("notFound và thứ tự middleware", () => {
  it("đường dẫn lạ trả 404 JSON Không tìm thấy đường dẫn", async () => {
    const res = await call("get", "/orders");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy đường dẫn" } });
    const inCart = await call("get", "/cart/abc", { cart: "A" });
    expect(inCart.status).toBe(404);
    expect(inCart.body.error.message).toBe("Không tìm thấy đường dẫn");
  });

  it("POST tới đường dẫn lạ: có khóa nhận 404, thiếu khóa nhận 401", async () => {
    const withKey = await call("post", "/orders", { key: true, body: { a: 1 } });
    const withoutKey = await call("post", "/orders", { body: { a: 1 } });
    expect(withKey.status).toBe(404);
    expect(withoutKey.status).toBe(401);
  });

  it("express.json đứng trước requireApiKey: JSON hỏng và thiếu khóa nhận 400 chứ không phải 401", async () => {
    const res = await call("post", "/cart/items", { cart: "A", body: '{"productId":' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: { code: "VALIDATION_ERROR", message: "JSON không hợp lệ" } });
  });

  it("JSON hỏng kèm đủ khóa và mã giỏ cũng nhận 400 JSON không hợp lệ", async () => {
    const res = await call("patch", "/cart/items/1", { cart: "A", key: true, body: "{quantity:" });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("JSON không hợp lệ");
  });
});

describe("errorHandler và asyncHandler", () => {
  it("errorHandler khai báo đủ 4 tham số", () => {
    expect(errorHandler.length).toBe(4);
  });

  it("asyncHandler chuyển lỗi của promise bị từ chối sang next", async () => {
    const error = new Error("hỏng");
    const next = vi.fn();
    const wrapped = asyncHandler(async () => {
      throw error;
    });
    await Promise.resolve(wrapped({}, {}, next)).catch(() => {});
    await new Promise((resolve) => setImmediate(resolve));
    expect(next).toHaveBeenCalledWith(error);
  });

  it("lỗi bất ngờ trong route async trả 500 Lỗi máy chủ, không lộ chi tiết và không treo", async () => {
    const broken = { id: 99, price: 1000, stock: 10 };
    Object.defineProperty(broken, "name", {
      enumerable: true,
      get() {
        throw new Error("Chi tiết nội bộ không được lộ");
      },
    });
    products.push(broken);
    carts.set("gio-hong", [{ productId: 99, quantity: 1 }]);
    const res = await call("get", "/cart", { cart: "gio-hong" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { code: "INTERNAL_ERROR", message: "Lỗi máy chủ" } });
    expect(JSON.stringify(res.body)).not.toContain("nội bộ");
    expect(errorSpy).toHaveBeenCalled();
  });

  it("sau một lỗi 500 máy chủ vẫn phục vụ yêu cầu kế tiếp", async () => {
    const broken = { id: 99, price: 1000, stock: 10 };
    Object.defineProperty(broken, "name", {
      get() {
        throw new Error("boom");
      },
    });
    products.push(broken);
    carts.set("gio-hong", [{ productId: 99, quantity: 1 }]);
    const failed = await call("get", "/cart", { cart: "gio-hong" });
    const next = await call("get", "/cart", { cart: "gio-khac" });
    expect(failed.status).toBe(500);
    expect(next.status).toBe(200);
  });
});

describe("Router sản phẩm có sẵn", () => {
  it("GET /products trả 5 sản phẩm và GET /products/2 trả Bàn phím cơ", async () => {
    const list = await call("get", "/products");
    const one = await call("get", "/products/2");
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(5);
    expect(one.status).toBe(200);
    expect(one.body.name).toBe("Bàn phím cơ");
  });

  it("GET /products/99 trả 404 Không tìm thấy sản phẩm theo định dạng lỗi chung", async () => {
    const res = await call("get", "/products/99");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy sản phẩm" } });
  });
});

describe("GET /cart", () => {
  it("giỏ chưa có gì trả 200 với items rỗng và total 0", async () => {
    const res = await call("get", "/cart", { cart: "moi" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ cartId: "moi", items: [], total: 0 });
  });

  it("mỗi dòng có name, unitPrice, quantity, lineTotal theo thứ tự thêm và total là tổng thành tiền", async () => {
    await addItem("A", 2, 1);
    await addItem("A", 1, 2);
    const res = await call("get", "/cart", { cart: "A" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      cartId: "A",
      items: [
        { productId: 2, name: "Bàn phím cơ", unitPrice: 890000, quantity: 1, lineTotal: 890000 },
        { productId: 1, name: "Tai nghe Bluetooth", unitPrice: 450000, quantity: 2, lineTotal: 900000 },
      ],
      total: 1790000,
    });
  });
});

describe("POST /cart/items", () => {
  it("thêm sản phẩm mới trả 201 kèm nội dung giỏ", async () => {
    const res = await call("post", "/cart/items", { cart: "A", key: true, body: { productId: 1, quantity: 2 } });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      cartId: "A",
      items: [{ productId: 1, name: "Tai nghe Bluetooth", unitPrice: 450000, quantity: 2, lineTotal: 900000 }],
      total: 900000,
    });
  });

  it("không gửi quantity thì mặc định là 1", async () => {
    const res = await call("post", "/cart/items", { cart: "A", key: true, body: { productId: 3 } });
    expect(res.status).toBe(201);
    expect(res.body.items[0].quantity).toBe(1);
  });

  it("thêm lại cùng sản phẩm thì cộng dồn vào một dòng", async () => {
    await addItem("A", 1, 2);
    const res = await addItem("A", 1, 3);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(5);
    expect(res.body.items[0].lineTotal).toBe(2250000);
    expect(res.body.total).toBe(2250000);
  });

  it("thiếu hoặc sai kiểu productId trả 400 với details cho productId", async () => {
    for (const body of [{ quantity: 1 }, { productId: "1", quantity: 1 }, { productId: 1.5 }, { productId: 0 }]) {
      const res = await call("post", "/cart/items", { cart: "A", key: true, body });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.error.message).toBe("Dữ liệu không hợp lệ");
      expect(res.body.error.details).toEqual([
        { field: "productId", message: "productId phải là số nguyên dương" },
      ]);
    }
  });

  it("quantity bằng 0, âm, số lẻ hoặc chuỗi trả 400 với details cho quantity, giỏ không đổi", async () => {
    for (const quantity of [0, -3, 1.5, "2"]) {
      const res = await call("post", "/cart/items", { cart: "A", key: true, body: { productId: 1, quantity } });
      expect(res.status).toBe(400);
      expect(res.body.error.details).toEqual([
        { field: "quantity", message: "quantity phải là số nguyên dương" },
      ]);
    }
    const cart = await call("get", "/cart", { cart: "A" });
    expect(cart.body.items).toEqual([]);
  });

  it("sai cả hai trường thì details có productId trước, quantity sau", async () => {
    const res = await call("post", "/cart/items", { cart: "A", key: true, body: { productId: "x", quantity: -1 } });
    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toEqual(["productId", "quantity"]);
  });

  it("sản phẩm không tồn tại trả 404 Không tìm thấy sản phẩm", async () => {
    const res = await call("post", "/cart/items", { cart: "A", key: true, body: { productId: 99, quantity: 1 } });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy sản phẩm" } });
  });

  it("vượt tồn kho trả 409 Không đủ hàng trong kho, đúng bằng tồn kho thì được, hết hàng (tồn kho 0) thì không thêm được", async () => {
    const tooMany = await call("post", "/cart/items", { cart: "A", key: true, body: { productId: 1, quantity: 26 } });
    expect(tooMany.status).toBe(409);
    expect(tooMany.body).toEqual({ error: { code: "CONFLICT", message: "Không đủ hàng trong kho" } });
    const exact = await call("post", "/cart/items", { cart: "A", key: true, body: { productId: 1, quantity: 25 } });
    expect(exact.status).toBe(201);
    const soldOut = await call("post", "/cart/items", { cart: "A", key: true, body: { productId: 4, quantity: 1 } });
    expect(soldOut.status).toBe(409);
  });

  it("cộng dồn làm tổng vượt tồn kho thì 409 và số lượng cũ giữ nguyên", async () => {
    await addItem("A", 2, 10);
    const res = await call("post", "/cart/items", { cart: "A", key: true, body: { productId: 2, quantity: 3 } });
    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe("Không đủ hàng trong kho");
    const cart = await call("get", "/cart", { cart: "A" });
    expect(cart.body.items[0].quantity).toBe(10);
  });
});

describe("PATCH /cart/items/:productId", () => {
  it("đổi số lượng trả 200 kèm nội dung giỏ mới", async () => {
    await addItem("A", 1, 2);
    const res = await call("patch", "/cart/items/1", { cart: "A", key: true, body: { quantity: 4 } });
    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(4);
    expect(res.body.items[0].lineTotal).toBe(1800000);
    expect(res.body.total).toBe(1800000);
  });

  it("quantity bằng 0 thì xóa dòng, các dòng khác còn nguyên", async () => {
    await addItem("A", 1, 2);
    await addItem("A", 3, 1);
    const res = await call("patch", "/cart/items/1", { cart: "A", key: true, body: { quantity: 0 } });
    expect(res.status).toBe(200);
    expect(res.body.items.map((i) => i.productId)).toEqual([3]);
    expect(res.body.total).toBe(199000);
  });

  it("quantity âm, số lẻ, chuỗi hoặc thiếu trả 400 với details cho quantity", async () => {
    await addItem("A", 1, 2);
    for (const body of [{ quantity: -1 }, { quantity: 2.5 }, { quantity: "3" }, {}]) {
      const res = await call("patch", "/cart/items/1", { cart: "A", key: true, body });
      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe("Dữ liệu không hợp lệ");
      expect(res.body.error.details).toEqual([
        { field: "quantity", message: "quantity phải là số nguyên không âm" },
      ]);
    }
  });

  it("dòng không có trong giỏ, hoặc productId không phải số, trả 404 Sản phẩm không có trong giỏ hàng", async () => {
    const missing = await call("patch", "/cart/items/2", { cart: "A", key: true, body: { quantity: 1 } });
    const notNumber = await call("patch", "/cart/items/abc", { cart: "A", key: true, body: { quantity: 1 } });
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: { code: "NOT_FOUND", message: "Sản phẩm không có trong giỏ hàng" } });
    expect(notNumber.status).toBe(404);
  });

  it("đổi vượt tồn kho trả 409 và số lượng cũ giữ nguyên", async () => {
    await addItem("A", 2, 3);
    const res = await call("patch", "/cart/items/2", { cart: "A", key: true, body: { quantity: 13 } });
    expect(res.status).toBe(409);
    expect(res.body.error.message).toBe("Không đủ hàng trong kho");
    const cart = await call("get", "/cart", { cart: "A" });
    expect(cart.body.items[0].quantity).toBe(3);
  });
});

describe("DELETE /cart/items/:productId", () => {
  it("xóa dòng trả 204 không thân, dòng khác còn nguyên", async () => {
    await addItem("A", 1, 2);
    await addItem("A", 3, 1);
    const res = await call("delete", "/cart/items/1", { cart: "A", key: true });
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    const cart = await call("get", "/cart", { cart: "A" });
    expect(cart.body.items.map((i) => i.productId)).toEqual([3]);
  });

  it("xóa dòng đã xóa hoặc chưa từng có trả 404 Sản phẩm không có trong giỏ hàng", async () => {
    await addItem("A", 1, 2);
    await call("delete", "/cart/items/1", { cart: "A", key: true });
    const again = await call("delete", "/cart/items/1", { cart: "A", key: true });
    expect(again.status).toBe(404);
    expect(again.body).toEqual({ error: { code: "NOT_FOUND", message: "Sản phẩm không có trong giỏ hàng" } });
  });
});

describe("DELETE /cart", () => {
  it("làm trống giỏ trả 204, giỏ khác không bị ảnh hưởng, giỏ chưa từng có cũng trả 204", async () => {
    await addItem("A", 1, 2);
    await addItem("B", 3, 1);
    const res = await call("delete", "/cart", { cart: "A", key: true });
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    const cartA = await call("get", "/cart", { cart: "A" });
    const cartB = await call("get", "/cart", { cart: "B" });
    expect(cartA.body).toEqual({ cartId: "A", items: [], total: 0 });
    expect(cartB.body.items).toHaveLength(1);
    const unknown = await call("delete", "/cart", { cart: "chua-co", key: true });
    expect(unknown.status).toBe(204);
  });
});
