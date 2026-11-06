// Bộ test tự chấm Bài 1: API danh mục sản phẩm trong bộ nhớ. KHÔNG sửa tệp này.
const net = require("net");
const request = require("supertest");
const app = require("../src/app");
const products = require("../src/data/products");

const SEED = [
  { id: 1, name: "Tai nghe Bluetooth", price: 450000, stock: 25, category: "Điện tử" },
  { id: 2, name: "Bàn phím cơ", price: 890000, stock: 12, category: "Điện tử" },
  { id: 3, name: "Áo thun", price: 199000, stock: 50, category: "Thời trang" },
  { id: 4, name: "Giày chạy bộ", price: 1250000, stock: 0, category: "Thời trang" },
  { id: 5, name: "Sách Lập trình", price: 160000, stock: 30, category: "Sách" },
];

const NOT_FOUND_PRODUCT = { error: { code: "NOT_FOUND", message: "Không tìm thấy sản phẩm" } };
const NOT_FOUND_PATH = { error: { code: "NOT_FOUND", message: "Không tìm thấy đường dẫn" } };

// Trả kho về đúng 5 sản phẩm canon trước mỗi test (sửa tại chỗ để app và test dùng chung một mảng)
beforeEach(() => {
  products.splice(0, products.length, ...SEED.map((p) => ({ ...p })));
});

// Lấy mảng id từ thân phản hồi danh sách
function ids(res) {
  return res.body.data.map((p) => p.id);
}

// Thân lỗi 400 chuẩn với danh sách details
function validationError(details) {
  return { error: { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", details } };
}

describe("Cấu trúc app và GET /health", () => {
  it("app.js chỉ xuất app, không tự mở cổng nào", () => {
    const servers = process._getActiveHandles().filter((handle) => handle instanceof net.Server);
    expect(servers).toHaveLength(0);
  });

  it("GET /health trả 200 và JSON { status: ok } với Content-Type JSON", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("GET /products: danh sách, tìm kiếm và lọc", () => {
  it("không truyền gì thì trả đủ 5 sản phẩm theo id và meta page 1, limit 10, total 5, totalPages 1", async () => {
    const res = await request(app).get("/products");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(ids(res)).toEqual([1, 2, 3, 4, 5]);
    expect(res.body.data[0]).toEqual(SEED[0]);
    expect(res.body.meta).toEqual({ page: 1, limit: 10, total: 5, totalPages: 1 });
  });

  it("q tìm theo tên, không phân biệt hoa thường và bỏ khoảng trắng hai đầu", async () => {
    const res = await request(app).get("/products").query({ q: "  SÁCH " });
    expect(res.status).toBe(200);
    expect(ids(res)).toEqual([5]);
    const part = await request(app).get("/products").query({ q: "t" });
    expect(ids(part)).toEqual([1, 3, 5]);
  });

  it("q chỉ gồm khoảng trắng thì không lọc, trả đủ 5 sản phẩm", async () => {
    const res = await request(app).get("/products").query({ q: "   " });
    expect(res.status).toBe(200);
    expect(ids(res)).toEqual([1, 2, 3, 4, 5]);
  });

  it("category lọc đúng tên danh mục, không phân biệt hoa thường và bỏ khoảng trắng hai đầu", async () => {
    const res = await request(app).get("/products").query({ category: " thời TRANG " });
    expect(res.status).toBe(200);
    expect(ids(res)).toEqual([3, 4]);
  });

  it("q và category dùng cùng lúc thì sản phẩm phải thỏa cả hai", async () => {
    const res = await request(app).get("/products").query({ q: "ph", category: "điện tử" });
    expect(res.status).toBe(200);
    expect(ids(res)).toEqual([2]);
  });

  it("minPrice và maxPrice lọc theo khoảng giá, gồm cả hai đầu mút", async () => {
    const res = await request(app).get("/products").query({ minPrice: 199000, maxPrice: 450000 });
    expect(res.status).toBe(200);
    expect(ids(res)).toEqual([1, 3]);
    const onlyMax = await request(app).get("/products").query({ maxPrice: 160000 });
    expect(ids(onlyMax)).toEqual([5]);
  });

  it("không có sản phẩm khớp thì trả 200, data rỗng, total 0 và totalPages 0", async () => {
    const res = await request(app).get("/products").query({ q: "xyz" });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
  });
});

describe("GET /products: sắp xếp", () => {
  it("sort=price không có order thì xếp giá tăng dần", async () => {
    const res = await request(app).get("/products").query({ sort: "price" });
    expect(res.status).toBe(200);
    expect(ids(res)).toEqual([5, 3, 1, 2, 4]);
  });

  it("sort=price&order=desc xếp giá giảm dần", async () => {
    const res = await request(app).get("/products").query({ sort: "price", order: "desc" });
    expect(res.status).toBe(200);
    expect(ids(res)).toEqual([4, 2, 1, 3, 5]);
  });

  it("sort=name xếp tên theo thứ tự chữ cái tiếng Việt (Áo đứng trước Bàn)", async () => {
    const res = await request(app).get("/products").query({ sort: "name" });
    expect(res.status).toBe(200);
    expect(res.body.data.map((p) => p.name)).toEqual([
      "Áo thun",
      "Bàn phím cơ",
      "Giày chạy bộ",
      "Sách Lập trình",
      "Tai nghe Bluetooth",
    ]);
  });

  it("sort=name&order=desc đảo ngược thứ tự tên", async () => {
    const res = await request(app).get("/products").query({ sort: "name", order: "desc" });
    expect(res.status).toBe(200);
    expect(ids(res)).toEqual([1, 5, 4, 2, 3]);
  });
});

describe("GET /products: phân trang", () => {
  it("limit=2&page=2 trả sản phẩm thứ 3 và 4, meta total 5 và totalPages 3", async () => {
    const res = await request(app).get("/products").query({ page: 2, limit: 2 });
    expect(res.status).toBe(200);
    expect(ids(res)).toEqual([3, 4]);
    expect(res.body.meta).toEqual({ page: 2, limit: 2, total: 5, totalPages: 3 });
  });

  it("page vượt quá số trang thì trả 200 với data rỗng nhưng meta vẫn đúng", async () => {
    const res = await request(app).get("/products").query({ page: 9, limit: 2 });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta).toEqual({ page: 9, limit: 2, total: 5, totalPages: 3 });
  });

  it("lọc, sắp xếp rồi mới phân trang; total tính trên kết quả đã lọc", async () => {
    const res = await request(app)
      .get("/products")
      .query({ category: "Điện tử", sort: "price", order: "desc", limit: 1, page: 2 });
    expect(res.status).toBe(200);
    expect(ids(res)).toEqual([1]);
    expect(res.body.meta).toEqual({ page: 2, limit: 1, total: 2, totalPages: 2 });
  });
});

describe("GET /products: tham số truy vấn sai trả 400", () => {
  it("sort và order ngoài danh sách cho phép bị từ chối, details đúng thứ tự", async () => {
    const res = await request(app).get("/products").query({ sort: "stock", order: "up" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      validationError([
        { field: "sort", message: "sort chỉ nhận price hoặc name" },
        { field: "order", message: "order chỉ nhận asc hoặc desc" },
      ])
    );
  });

  it("page bằng 0 và limit lớn hơn 50 bị từ chối", async () => {
    const res = await request(app).get("/products").query({ page: 0, limit: 51 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      validationError([
        { field: "page", message: "page phải là số nguyên từ 1 trở lên" },
        { field: "limit", message: "limit phải là số nguyên từ 1 đến 50" },
      ])
    );
  });

  it("minPrice âm hoặc không phải số bị từ chối", async () => {
    const res = await request(app).get("/products").query({ minPrice: -5, maxPrice: "abc" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      validationError([
        { field: "minPrice", message: "minPrice phải là số nguyên không âm" },
        { field: "maxPrice", message: "maxPrice phải là số nguyên không âm" },
      ])
    );
  });

  it("minPrice lớn hơn maxPrice bị từ chối", async () => {
    const res = await request(app).get("/products").query({ minPrice: 500000, maxPrice: 100000 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      validationError([{ field: "minPrice", message: "minPrice không được lớn hơn maxPrice" }])
    );
  });
});

describe("GET /products/:id", () => {
  it("id có thật thì trả 200 và đúng sản phẩm", async () => {
    const res = await request(app).get("/products/2");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(SEED[1]);
  });

  it("id không có trong kho thì trả 404 với thân lỗi chuẩn", async () => {
    const res = await request(app).get("/products/99");
    expect(res.status).toBe(404);
    expect(res.body).toEqual(NOT_FOUND_PRODUCT);
  });

  it("id không phải số nguyên dương (abc, 1.5) cũng trả 404 chuẩn, không phải 500", async () => {
    const letters = await request(app).get("/products/abc");
    expect(letters.status).toBe(404);
    expect(letters.body).toEqual(NOT_FOUND_PRODUCT);
    const decimal = await request(app).get("/products/1.5");
    expect(decimal.status).toBe(404);
    expect(decimal.body).toEqual(NOT_FOUND_PRODUCT);
  });
});

describe("POST /products", () => {
  it("dữ liệu hợp lệ thì trả 201, id 6, và xem lại được bằng GET", async () => {
    const payload = { name: "Chuột không dây", price: 320000, stock: 40, category: "Điện tử" };
    const res = await request(app).post("/products").send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 6, ...payload });
    const again = await request(app).get("/products/6");
    expect(again.status).toBe(200);
    expect(again.body).toEqual({ id: 6, ...payload });
  });

  it("thiếu stock và category thì stock là 0, category là Chưa phân loại; name và category được cắt khoảng trắng", async () => {
    const res = await request(app).post("/products").send({ name: "  Chuột không dây  ", price: 320000 });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 6, name: "Chuột không dây", price: 320000, stock: 0, category: "Chưa phân loại" });
    const trimmed = await request(app)
      .post("/products")
      .send({ name: "Balo", price: 250000, category: "  Phụ kiện " });
    expect(trimmed.body.category).toBe("Phụ kiện");
  });

  it("id mới là id lớn nhất đang có cộng 1 và client không chọn được id", async () => {
    await request(app).delete("/products/1");
    const res = await request(app).post("/products").send({ id: 99, name: "Chuột không dây", price: 320000 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(6);
  });

  it("thiếu name và price thì trả 400, details theo thứ tự name rồi price", async () => {
    const res = await request(app).post("/products").send({ stock: 5 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      validationError([
        { field: "name", message: "Tên không được để trống" },
        { field: "price", message: "Giá phải là số nguyên dương" },
      ])
    );
  });

  it("name chỉ gồm khoảng trắng bị từ chối ở trường name", async () => {
    const res = await request(app).post("/products").send({ name: "     ", price: 100000 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(validationError([{ field: "name", message: "Tên không được để trống" }]));
  });

  it.each([
    ["số âm", -5, "Giá phải là số nguyên dương"],
    ["chuỗi số", "450000", "Giá phải là số nguyên dương"],
    ["số quá lớn", 1000000001, "Giá không được vượt quá 1000000000"],
  ])("price là %s bị từ chối ở trường price", async (label, price, message) => {
    const res = await request(app).post("/products").send({ name: "Chuột không dây", price });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(validationError([{ field: "price", message }]));
  });

  it("stock âm và category rỗng cùng lúc thì details có stock rồi category", async () => {
    const res = await request(app)
      .post("/products")
      .send({ name: "Chuột không dây", price: 320000, stock: -1, category: "   " });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      validationError([
        { field: "stock", message: "Tồn kho phải là số nguyên không âm" },
        { field: "category", message: "Danh mục phải là chuỗi không rỗng" },
      ])
    );
  });

  it("dữ liệu bị từ chối thì kho vẫn nguyên 5 sản phẩm", async () => {
    await request(app).post("/products").send({ name: "", price: -1 });
    expect(products).toEqual(SEED);
  });

  it("tên trùng với sản phẩm có sẵn (không phân biệt hoa thường) thì trả 409 CONFLICT", async () => {
    const res = await request(app).post("/products").send({ name: " bàn PHÍM cơ ", price: 100000 });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: { code: "CONFLICT", message: "Tên sản phẩm đã tồn tại" } });
    expect(products).toHaveLength(5);
  });
});

describe("PATCH /products/:id", () => {
  it("sửa giá thì trả 200 với sản phẩm đã sửa, các trường khác giữ nguyên, GET thấy giá mới", async () => {
    const res = await request(app).patch("/products/2").send({ price: 850000 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...SEED[1], price: 850000 });
    const again = await request(app).get("/products/2");
    expect(again.body.price).toBe(850000);
  });

  it("sửa nhiều trường một lần: name và category được cắt khoảng trắng, stock được phép bằng 0", async () => {
    const res = await request(app)
      .patch("/products/1")
      .send({ name: "  Tai nghe không dây  ", stock: 0, category: " Phụ kiện " });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, name: "Tai nghe không dây", price: 450000, stock: 0, category: "Phụ kiện" });
  });

  it("id không có hoặc không phải số thì trả 404 chuẩn", async () => {
    const missing = await request(app).patch("/products/99").send({ price: 100000 });
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual(NOT_FOUND_PRODUCT);
    const letters = await request(app).patch("/products/abc").send({ price: 100000 });
    expect(letters.status).toBe(404);
    expect(letters.body).toEqual(NOT_FOUND_PRODUCT);
  });

  it("body không có trường nào để sửa thì trả 400 với details field body", async () => {
    const res = await request(app).patch("/products/1").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual(validationError([{ field: "body", message: "Cần gửi ít nhất một trường cần sửa" }]));
  });

  it("trường gửi lên sai thì trả 400 theo từng trường và sản phẩm không bị đổi", async () => {
    const res = await request(app).patch("/products/1").send({ name: "  ", price: -1 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      validationError([
        { field: "name", message: "Tên không được để trống" },
        { field: "price", message: "Giá phải là số nguyên dương" },
      ])
    );
    expect(products[0]).toEqual(SEED[0]);
  });

  it("đổi tên trùng với sản phẩm khác thì trả 409 CONFLICT và sản phẩm không bị đổi", async () => {
    const res = await request(app).patch("/products/1").send({ name: "Áo THUN" });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: { code: "CONFLICT", message: "Tên sản phẩm đã tồn tại" } });
    expect(products[0]).toEqual(SEED[0]);
  });

  it("đổi hoa thường tên của chính sản phẩm đó thì không bị coi là trùng", async () => {
    const res = await request(app).patch("/products/2").send({ name: "BÀN PHÍM CƠ" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("BÀN PHÍM CƠ");
  });
});

describe("DELETE /products/:id", () => {
  it("xóa thành công trả 204 không có thân, sản phẩm biến mất khỏi danh sách", async () => {
    const res = await request(app).delete("/products/3");
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    const list = await request(app).get("/products");
    expect(ids(list)).toEqual([1, 2, 4, 5]);
    expect(list.body.meta.total).toBe(4);
  });

  it("xóa lần hai cùng id, hoặc id không tồn tại, trả 404 chuẩn", async () => {
    await request(app).delete("/products/3");
    const again = await request(app).delete("/products/3");
    expect(again.status).toBe(404);
    expect(again.body).toEqual(NOT_FOUND_PRODUCT);
    const letters = await request(app).delete("/products/abc");
    expect(letters.status).toBe(404);
  });
});

describe("Lỗi chung của API", () => {
  it("đường dẫn không tồn tại trả 404 JSON với message Không tìm thấy đường dẫn", async () => {
    const res = await request(app).get("/orders");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toEqual(NOT_FOUND_PATH);
  });

  it("body JSON sai cú pháp trả 400 VALIDATION_ERROR với message JSON không hợp lệ", async () => {
    const res = await request(app).post("/products").set("Content-Type", "application/json").send("{name:");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: { code: "VALIDATION_ERROR", message: "JSON không hợp lệ" } });
  });
});
