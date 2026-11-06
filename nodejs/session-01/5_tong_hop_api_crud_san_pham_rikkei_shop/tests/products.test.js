// Test tự chấm Bài 5: API sản phẩm và danh mục trên MySQL (gọi thẳng app bằng Supertest, dữ liệu seed Rikkei Shop).
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/db/pool");
const { resetDatabase } = require("./helpers/db");

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  await pool.end();
});

const ids = (res) => res.body.data.map((product) => product.id);

async function countProducts() {
  const [[row]] = await pool.query("SELECT COUNT(*) AS n FROM products");
  return row.n;
}

const TAI_NGHE = {
  id: 1,
  name: "Tai nghe Bluetooth",
  price: 450000,
  stock: 25,
  categoryId: 1,
  categoryName: "Điện tử",
};

describe("GET /categories", () => {
  beforeEach(resetDatabase);

  it("trả các danh mục theo id, mỗi danh mục kèm productCount", async () => {
    const res = await request(app).get("/categories");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: [
        { id: 1, name: "Điện tử", productCount: 3 },
        { id: 2, name: "Thời trang", productCount: 3 },
        { id: 3, name: "Sách", productCount: 2 },
      ],
    });
  });

  it("danh mục chưa có sản phẩm vẫn xuất hiện với productCount là 0", async () => {
    await pool.query("INSERT INTO categories (name) VALUES ('Đồ gia dụng')");
    const res = await request(app).get("/categories");
    expect(res.body.data[3]).toEqual({ id: 4, name: "Đồ gia dụng", productCount: 0 });
  });

  it("productCount đổi theo khi tạo và xóa sản phẩm", async () => {
    await request(app).post("/products").send({ name: "Sách Node.js", price: 120000, categoryId: 3 });
    await request(app).delete("/products/7");
    const res = await request(app).get("/categories");
    expect(res.body.data.map((category) => category.productCount)).toEqual([3, 2, 3]);
  });
});

describe("GET /products: phân trang", () => {
  beforeAll(resetDatabase);

  it("mặc định trang 1, 5 sản phẩm, meta đủ bốn trường", async () => {
    const res = await request(app).get("/products");
    expect(res.status).toBe(200);
    expect(ids(res)).toEqual([1, 2, 3, 4, 5]);
    expect(res.body.data[0]).toEqual(TAI_NGHE);
    expect(res.body.meta).toEqual({ page: 1, limit: 5, total: 8, totalPages: 2 });
  });

  it("limit=3 và page=3 trả hai sản phẩm còn lại, totalPages làm tròn lên", async () => {
    const res = await request(app).get("/products?limit=3&page=3");
    expect(ids(res)).toEqual([7, 8]);
    expect(res.body.meta).toEqual({ page: 3, limit: 3, total: 8, totalPages: 3 });
  });

  it("trang vượt quá trang cuối vẫn là 200 với danh sách rỗng", async () => {
    const res = await request(app).get("/products?page=9");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta).toEqual({ page: 9, limit: 5, total: 8, totalPages: 2 });
  });
});

describe("GET /products: lọc", () => {
  beforeAll(resetDatabase);

  it("lọc theo categoryId", async () => {
    const res = await request(app).get("/products?categoryId=3");
    expect(ids(res)).toEqual([5, 8]);
    expect(res.body.meta.total).toBe(2);
  });

  it("lọc khoảng giá minPrice và maxPrice, gồm hai đầu", async () => {
    const res = await request(app).get("/products?minPrice=200000&maxPrice=500000");
    expect(ids(res)).toEqual([1, 6, 8]);
    expect(res.body.meta.total).toBe(3);
  });

  it("tìm theo q trong tên, không phân biệt hoa thường và bỏ khoảng trắng hai đầu", async () => {
    const res = await request(app).get("/products").query({ q: "  sÁCH " });
    expect(ids(res)).toEqual([5, 8]);
    expect(res.body.meta.total).toBe(2);
  });

  it("kết hợp nhiều bộ lọc, total đếm theo bộ lọc chứ không theo trang", async () => {
    const res = await request(app).get("/products?categoryId=2&minPrice=200000&limit=1");
    expect(ids(res)).toEqual([4]);
    expect(res.body.meta).toEqual({ page: 1, limit: 1, total: 2, totalPages: 2 });
  });
});

describe("GET /products: sắp xếp", () => {
  beforeEach(resetDatabase);

  it("sort=price tăng dần là mặc định của order, order=desc đảo ngược", async () => {
    const asc = await request(app).get("/products?sort=price");
    expect(ids(asc)).toEqual([5, 3, 8, 6, 1]);
    const desc = await request(app).get("/products?categoryId=1&sort=price&order=desc");
    expect(ids(desc)).toEqual([2, 1, 6]);
    expect(desc.body.meta).toEqual({ page: 1, limit: 5, total: 3, totalPages: 1 });
  });

  it("sort=name giảm dần: tên đứng cuối bảng chữ cái lên đầu", async () => {
    const res = await request(app).get("/products?sort=name&order=desc&limit=1");
    expect(res.body.data[0].name).toBe("Tai nghe Bluetooth");
  });

  it("sort=createdAt giảm dần: sản phẩm tạo gần nhất lên đầu", async () => {
    const res = await request(app).get("/products?sort=createdAt&order=desc");
    expect(ids(res)).toEqual([8, 7, 6, 5, 4]);
  });

  it("cùng giá thì xếp theo id tăng dần, kể cả khi order=desc", async () => {
    await pool.query(
      "INSERT INTO products (name, price, stock, category_id) VALUES ('Tai nghe A', 450000, 1, 1), ('Tai nghe B', 450000, 1, 1)"
    );
    const res = await request(app).get("/products?minPrice=450000&maxPrice=450000&sort=price&order=desc");
    expect(ids(res)).toEqual([1, 9, 10]);
  });
});

describe("GET /products: tham số sai", () => {
  beforeAll(resetDatabase);

  it("sort và order ngoài danh sách cho phép: 400 với thông báo cố định", async () => {
    const sort = await request(app).get("/products?sort=stock");
    expect(sort.status).toBe(400);
    expect(sort.body.error.code).toBe("VALIDATION_ERROR");
    expect(sort.body.error.message).toBe("Dữ liệu không hợp lệ");
    expect(sort.body.error.details).toEqual([{ field: "sort", message: "sort chỉ nhận price, name hoặc createdAt" }]);
    const order = await request(app).get("/products?order=up");
    expect(order.status).toBe(400);
    expect(order.body.error.details).toEqual([{ field: "order", message: "order chỉ nhận asc hoặc desc" }]);
  });

  it("sort chứa mã SQL bị chặn bằng 400, bảng products còn nguyên", async () => {
    const res = await request(app).get("/products").query({ sort: "price;DROP TABLE products" });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe("sort");
    expect(await countProducts()).toBe(8);
  });

  it("limit ngoài khoảng 1 đến 50: 400; limit=50 là hợp lệ", async () => {
    const zero = await request(app).get("/products?limit=0");
    expect(zero.status).toBe(400);
    expect(zero.body.error.details).toEqual([{ field: "limit", message: "limit tối thiểu là 1" }]);
    const tooBig = await request(app).get("/products?limit=51");
    expect(tooBig.status).toBe(400);
    expect(tooBig.body.error.details).toEqual([{ field: "limit", message: "limit tối đa là 50" }]);
    const edge = await request(app).get("/products?limit=50");
    expect(edge.status).toBe(200);
    expect(edge.body.meta).toEqual({ page: 1, limit: 50, total: 8, totalPages: 1 });
  });

  it("page nhỏ hơn 1, không phải số, thập phân hoặc quá lớn: 400 ở trường page", async () => {
    const cases = [
      ["0", "page tối thiểu là 1"],
      ["abc", "page phải là số"],
      ["1.5", "page phải là số nguyên"],
      ["100001", "page tối đa là 100000"],
    ];
    for (const [value, message] of cases) {
      const res = await request(app).get("/products").query({ page: value });
      expect(res.status).toBe(400);
      expect(res.body.error.details).toEqual([{ field: "page", message }]);
    }
  });

  it("minPrice âm, categoryId chứa mã SQL, q toàn dấu cách: 400", async () => {
    const price = await request(app).get("/products?minPrice=-5");
    expect(price.status).toBe(400);
    expect(price.body.error.details).toEqual([{ field: "minPrice", message: "minPrice không được âm" }]);
    const category = await request(app).get("/products").query({ categoryId: "1 OR 1=1" });
    expect(category.status).toBe(400);
    expect(category.body.error.details).toEqual([{ field: "categoryId", message: "categoryId phải là số" }]);
    const text = await request(app).get("/products").query({ q: "   " });
    expect(text.status).toBe(400);
    expect(text.body.error.details).toEqual([{ field: "q", message: "q không được để trống" }]);
  });

  it("q chứa ' OR 1=1 -- chỉ là chuỗi tìm kiếm: không có kết quả", async () => {
    const res = await request(app).get("/products").query({ q: "' OR 1=1 -- " });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta).toEqual({ page: 1, limit: 5, total: 0, totalPages: 0 });
  });
});

describe("GET /products/:id", () => {
  beforeAll(resetDatabase);

  it("trả sản phẩm kèm categoryName", async () => {
    const res = await request(app).get("/products/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(TAI_NGHE);
  });

  it("không có sản phẩm: 404 đúng định dạng lỗi", async () => {
    const res = await request(app).get("/products/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy sản phẩm" } });
  });

  it("id không phải số nguyên dương: 400 ở trường id", async () => {
    const cases = [
      ["abc", "id phải là số"],
      ["0", "id phải lớn hơn 0"],
      ["1.5", "id phải là số nguyên"],
    ];
    for (const [value, message] of cases) {
      const res = await request(app).get("/products/" + value);
      expect(res.status).toBe(400);
      expect(res.body.error.details).toEqual([{ field: "id", message }]);
    }
  });
});

describe("POST /products", () => {
  beforeEach(resetDatabase);

  it("201 với sản phẩm vừa tạo: tên được cắt khoảng trắng, stock mặc định 0, id của client bị bỏ qua", async () => {
    const res = await request(app)
      .post("/products")
      .send({ id: 100, name: "  Tai nghe chụp tai  ", price: 780000, categoryId: 1 });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 9,
      name: "Tai nghe chụp tai",
      price: 780000,
      stock: 0,
      categoryId: 1,
      categoryName: "Điện tử",
    });
    const [[row]] = await pool.query("SELECT name, stock FROM products WHERE id = 9");
    expect(row).toEqual({ name: "Tai nghe chụp tai", stock: 0 });
    expect(await countProducts()).toBe(9);
  });

  it("thân rỗng: 400 với ba lỗi theo thứ tự name, price, categoryId", async () => {
    const res = await request(app).post("/products").send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toBe("Dữ liệu không hợp lệ");
    expect(res.body.error.details).toEqual([
      { field: "name", message: "Tên sản phẩm là bắt buộc" },
      { field: "price", message: "Giá là bắt buộc" },
      { field: "categoryId", message: "Danh mục là bắt buộc" },
    ]);
    expect(await countProducts()).toBe(8);
  });

  it("tên toàn dấu cách và giá âm: mỗi trường một thông báo", async () => {
    const res = await request(app).post("/products").send({ name: "   ", price: -5, categoryId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([
      { field: "name", message: "Tên sản phẩm không được để trống" },
      { field: "price", message: "Giá phải lớn hơn 0" },
    ]);
    expect(await countProducts()).toBe(8);
  });

  it("giá thập phân hoặc gửi dạng chuỗi bị từ chối", async () => {
    const decimal = await request(app).post("/products").send({ name: "Cáp", price: 1.5, categoryId: 1 });
    expect(decimal.status).toBe(400);
    expect(decimal.body.error.details).toEqual([{ field: "price", message: "Giá phải là số nguyên" }]);
    const text = await request(app).post("/products").send({ name: "Cáp", price: "90000", categoryId: 1 });
    expect(text.status).toBe(400);
    expect(text.body.error.details).toEqual([{ field: "price", message: "Giá phải là số" }]);
  });

  it("tên quá dài và các số vượt giới hạn: 400, không có hàng nào được ghi", async () => {
    const res = await request(app)
      .post("/products")
      .send({ name: "a".repeat(101), price: 1000000001, stock: 1000001, categoryId: 99999999999 });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([
      { field: "name", message: "Tên sản phẩm tối đa 100 ký tự" },
      { field: "price", message: "Giá tối đa là 1000000000" },
      { field: "stock", message: "Tồn kho tối đa là 1000000" },
      { field: "categoryId", message: "Danh mục quá lớn" },
    ]);
    expect(await countProducts()).toBe(8);
  });

  it("danh mục không tồn tại: 400 do MySQL báo, errorHandler đổi thành thông báo tiếng Việt", async () => {
    const res = await request(app).post("/products").send({ name: "Cáp sạc", price: 90000, categoryId: 99 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Danh mục không tồn tại",
        details: [{ field: "categoryId", message: "Danh mục không tồn tại" }],
      },
    });
    expect(await countProducts()).toBe(8);
  });

  it("JSON sai cú pháp: 400 JSON không hợp lệ", async () => {
    const res = await request(app).post("/products").set("Content-Type", "application/json").send("{ name: ");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: { code: "VALIDATION_ERROR", message: "JSON không hợp lệ" } });
  });
});

describe("PUT và PATCH /products/:id", () => {
  beforeEach(resetDatabase);

  it("PUT đủ trường: 200 với sản phẩm sau khi sửa và dữ liệu được ghi", async () => {
    const res = await request(app)
      .put("/products/2")
      .send({ name: "Bàn phím cơ RGB", price: 950000, stock: 10, categoryId: 1 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 2,
      name: "Bàn phím cơ RGB",
      price: 950000,
      stock: 10,
      categoryId: 1,
      categoryName: "Điện tử",
    });
    const [[row]] = await pool.query("SELECT name, price FROM products WHERE id = 2");
    expect(row).toEqual({ name: "Bàn phím cơ RGB", price: 950000 });
  });

  it("PUT thiếu trường bắt buộc: 400 và dữ liệu không đổi", async () => {
    const res = await request(app).put("/products/2").send({ name: "Bàn phím cơ RGB", categoryId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([{ field: "price", message: "Giá là bắt buộc" }]);
    const [[row]] = await pool.query("SELECT name FROM products WHERE id = 2");
    expect(row.name).toBe("Bàn phím cơ");
  });

  it("PUT và PATCH sản phẩm không có: 404", async () => {
    const put = await request(app).put("/products/999").send({ name: "Cáp", price: 90000, categoryId: 1 });
    expect(put.status).toBe(404);
    expect(put.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy sản phẩm" } });
    const patch = await request(app).patch("/products/999").send({ price: 1000 });
    expect(patch.status).toBe(404);
    expect(patch.body.error.message).toBe("Không tìm thấy sản phẩm");
  });

  it("PATCH một trường: các trường khác giữ nguyên", async () => {
    const res = await request(app).patch("/products/2").send({ price: 850000 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 2,
      name: "Bàn phím cơ",
      price: 850000,
      stock: 12,
      categoryId: 1,
      categoryName: "Điện tử",
    });
  });

  it("PATCH thân rỗng: 400 Cần gửi ít nhất một trường", async () => {
    const res = await request(app).patch("/products/2").send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual([{ field: "", message: "Cần gửi ít nhất một trường" }]);
  });

  it("PATCH giá sai: 400 và dữ liệu không đổi", async () => {
    const res = await request(app).patch("/products/2").send({ price: -1 });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([{ field: "price", message: "Giá phải lớn hơn 0" }]);
    const [[row]] = await pool.query("SELECT price FROM products WHERE id = 2");
    expect(row.price).toBe(890000);
  });

  it("PATCH sang danh mục không tồn tại: 400 và danh mục cũ được giữ", async () => {
    const res = await request(app).patch("/products/1").send({ categoryId: 99 });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Danh mục không tồn tại");
    const [[row]] = await pool.query("SELECT category_id FROM products WHERE id = 1");
    expect(row.category_id).toBe(1);
  });
});

describe("DELETE /products/:id", () => {
  beforeEach(resetDatabase);

  it("xóa sản phẩm chưa có trong đơn: 204 không thân, lần xóa thứ hai và xem lại đều 404", async () => {
    const first = await request(app).delete("/products/7");
    expect(first.status).toBe(204);
    expect(first.text).toBe("");
    expect(await countProducts()).toBe(7);
    const second = await request(app).delete("/products/7");
    expect(second.status).toBe(404);
    expect(second.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy sản phẩm" } });
    expect((await request(app).get("/products/7")).status).toBe(404);
  });

  it("sản phẩm đã có trong đơn hàng: 409 và hàng còn nguyên", async () => {
    const res = await request(app).delete("/products/1");
    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: { code: "CONFLICT", message: "Sản phẩm đã có trong đơn hàng, không thể xóa" },
    });
    expect(await countProducts()).toBe(8);
  });

  it("id không phải số: 400 và không xóa gì", async () => {
    const res = await request(app).delete("/products/abc");
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([{ field: "id", message: "id phải là số" }]);
    expect(await countProducts()).toBe(8);
  });
});

describe("Ghép ứng dụng và lỗi chung", () => {
  beforeAll(resetDatabase);

  it("GET /health trả { status: ok }", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("đường dẫn không tồn tại: 404 NOT_FOUND, kể cả với phương thức POST", async () => {
    const get = await request(app).get("/khong-co-duong-dan-nay");
    expect(get.status).toBe(404);
    expect(get.body).toEqual({ error: { code: "NOT_FOUND", message: "Không tìm thấy đường dẫn" } });
    const post = await request(app).post("/orders").send({});
    expect(post.status).toBe(404);
    expect(post.body.error.code).toBe("NOT_FOUND");
  });

  it("lỗi cơ sở dữ liệu bất ngờ: 500 cố định, không lộ chi tiết", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const failure = new Error("Table 'rikkei_shop.produts' doesn't exist");
    vi.spyOn(pool, "execute").mockRejectedValue(failure);
    vi.spyOn(pool, "query").mockRejectedValue(failure);
    const res = await request(app).get("/products/1");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { code: "INTERNAL_ERROR", message: "Lỗi máy chủ" } });
    expect(JSON.stringify(res.body)).not.toContain("produts");
  });
});
