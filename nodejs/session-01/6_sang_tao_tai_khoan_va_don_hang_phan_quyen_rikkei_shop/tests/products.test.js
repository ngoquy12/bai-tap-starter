// Test tự chấm Bài 6 (phần 2): /products đọc công khai, ghi chỉ admin (kèm vài kiểm tra kế thừa từ Bài 5).
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

const asAdmin = (req) => req.set("Authorization", "Bearer " + tokenFor(1, "admin"));
const asCustomer = (req) => req.set("Authorization", "Bearer " + tokenFor(2, "customer"));

const NEW_PRODUCT = { name: "Loa Bluetooth", price: 380000, stock: 15, categoryId: 1 };

async function countProducts() {
  const [[row]] = await pool.query("SELECT COUNT(*) AS n FROM products");
  return row.n;
}

describe("Đọc sản phẩm vẫn công khai", () => {
  it("GET /products và GET /products/:id không cần token; id lạ vẫn là 404", async () => {
    const list = await request(app).get("/products");
    expect(list.status).toBe(200);
    expect(list.body.data.map((p) => p.id)).toEqual([1, 2, 3, 4, 5]);
    expect(list.body.meta).toEqual({ page: 1, limit: 5, total: 8, totalPages: 2 });
    const one = await request(app).get("/products/1");
    expect(one.status).toBe(200);
    expect(one.body.name).toBe("Tai nghe Bluetooth");
    const missing = await request(app).get("/products/999");
    expect(missing.status).toBe(404);
    expect(missing.body.error.message).toBe("Không tìm thấy sản phẩm");
  });
});

describe("Ghi sản phẩm chỉ dành cho admin", () => {
  it("POST /products: không token 401, token khách 403, token admin 201; cùng thân rỗng khách nhận 403 còn admin nhận 400", async () => {
    const anonymous = await request(app).post("/products").send(NEW_PRODUCT);
    expect(anonymous.status).toBe(401);
    expect(anonymous.body.error.code).toBe("UNAUTHORIZED");
    const customer = await asCustomer(request(app).post("/products")).send(NEW_PRODUCT);
    expect(customer.status).toBe(403);
    expect(customer.body).toEqual({
      error: { code: "FORBIDDEN", message: "Bạn không có quyền thực hiện thao tác này" },
    });
    expect(await countProducts()).toBe(8);
    const admin = await asAdmin(request(app).post("/products")).send(NEW_PRODUCT);
    expect(admin.status).toBe(201);
    expect(admin.body).toMatchObject({ id: 9, name: "Loa Bluetooth", categoryName: "Điện tử" });
    expect(await countProducts()).toBe(9);
    // Thứ tự middleware: authenticate, authorize rồi mới tới validate
    const emptyAsCustomer = await asCustomer(request(app).post("/products")).send({});
    expect(emptyAsCustomer.status).toBe(403);
    const emptyAsAdmin = await asAdmin(request(app).post("/products")).send({});
    expect(emptyAsAdmin.status).toBe(400);
    expect(emptyAsAdmin.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("PUT, PATCH, DELETE: không token 401, token khách 403 và dữ liệu không đổi", async () => {
    const anonymous = [
      await request(app).put("/products/2").send(NEW_PRODUCT),
      await request(app).patch("/products/2").send({ price: 850000 }),
      await request(app).delete("/products/7"),
    ];
    expect(anonymous.map((res) => res.status)).toEqual([401, 401, 401]);
    const customer = [
      await asCustomer(request(app).put("/products/2")).send(NEW_PRODUCT),
      await asCustomer(request(app).patch("/products/2")).send({ price: 850000 }),
      await asCustomer(request(app).delete("/products/7")),
    ];
    expect(customer.map((res) => res.status)).toEqual([403, 403, 403]);
    const [[row]] = await pool.query("SELECT name, price FROM products WHERE id = 2");
    expect(row).toEqual({ name: "Bàn phím cơ", price: 890000 });
    expect(await countProducts()).toBe(8);
  });

  it("admin sửa và xóa được; xóa sản phẩm đã có trong đơn vẫn là 409", async () => {
    const patch = await asAdmin(request(app).patch("/products/2")).send({ price: 850000 });
    expect(patch.status).toBe(200);
    expect(patch.body.price).toBe(850000);
    const removed = await asAdmin(request(app).delete("/products/7"));
    expect(removed.status).toBe(204);
    const blocked = await asAdmin(request(app).delete("/products/1"));
    expect(blocked.status).toBe(409);
    expect(blocked.body.error.message).toBe("Sản phẩm đã có trong đơn hàng, không thể xóa");
    expect(await countProducts()).toBe(7);
  });
});
