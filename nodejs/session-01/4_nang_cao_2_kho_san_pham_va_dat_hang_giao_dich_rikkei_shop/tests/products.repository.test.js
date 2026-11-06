// Test tự chấm Bài 4 (phần 1): products.repository trên dữ liệu seed Rikkei Shop.
const pool = require("../src/db/pool");
const repository = require("../src/repositories/products.repository");
const { resetDatabase } = require("./helpers/db");

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

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

describe("findAll: danh sách và bộ lọc", () => {
  it("không lọc thì trả đủ 8 sản phẩm theo id tăng dần, mỗi sản phẩm có đúng sáu khóa", async () => {
    const products = await repository.findAll({});
    expect(products.map((p) => p.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(products[0]).toEqual(TAI_NGHE);
  });

  it("lọc theo categoryId chỉ trả sản phẩm của danh mục đó", async () => {
    const products = await repository.findAll({ categoryId: 3 });
    expect(products.map((p) => p.id)).toEqual([5, 8]);
    expect(products.every((p) => p.categoryName === "Sách")).toBe(true);
  });

  it("lọc theo q trả sản phẩm có tên chứa chuỗi, không phân biệt hoa thường", async () => {
    const products = await repository.findAll({ q: "sách" });
    expect(products.map((p) => p.id)).toEqual([5, 8]);
  });

  it("lọc đồng thời categoryId và q thì phải thỏa cả hai", async () => {
    const products = await repository.findAll({ categoryId: 3, q: "dữ liệu" });
    expect(products.map((p) => p.id)).toEqual([8]);
    expect(await repository.findAll({ categoryId: 1, q: "sách" })).toEqual([]);
  });

  it("không có sản phẩm khớp thì trả mảng rỗng", async () => {
    expect(await repository.findAll({ q: "không có sản phẩm này" })).toEqual([]);
  });
});

describe("findById: một sản phẩm", () => {
  it("trả sản phẩm kèm categoryName, khóa camelCase", async () => {
    expect(await repository.findById(1)).toEqual(TAI_NGHE);
  });

  it("id không tồn tại thì trả null", async () => {
    expect(await repository.findById(999)).toBeNull();
  });
});

describe("create: thêm sản phẩm", () => {
  it("trả sản phẩm vừa tạo với id mới và dữ liệu có trong bảng", async () => {
    const created = await repository.create({ name: "Cáp sạc", price: 90000, stock: 15, categoryId: 1 });
    expect(created).toEqual({
      id: 9,
      name: "Cáp sạc",
      price: 90000,
      stock: 15,
      categoryId: 1,
      categoryName: "Điện tử",
    });
    expect(await countProducts()).toBe(9);
  });

  it("thiếu stock thì kho bằng 0", async () => {
    const created = await repository.create({ name: "Sổ tay", price: 35000, categoryId: 3 });
    expect(created.stock).toBe(0);
    expect(created.categoryName).toBe("Sách");
  });

  it("danh mục không tồn tại thì ném 400 VALIDATION_ERROR và không thêm hàng nào", async () => {
    await expect(repository.create({ name: "Cáp sạc", price: 90000, categoryId: 99 })).rejects.toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Danh mục không tồn tại",
    });
    expect(await countProducts()).toBe(8);
  });
});

describe("update: sửa sản phẩm", () => {
  it("chỉ sửa trường có mặt, các trường khác giữ nguyên", async () => {
    const updated = await repository.update(1, { price: 500000 });
    expect(updated).toEqual({ ...TAI_NGHE, price: 500000 });
  });

  it("sửa nhiều trường cùng lúc kể cả categoryId", async () => {
    const updated = await repository.update(1, { name: "Tai nghe chụp tai", stock: 7, categoryId: 2 });
    expect(updated).toEqual({
      id: 1,
      name: "Tai nghe chụp tai",
      price: 450000,
      stock: 7,
      categoryId: 2,
      categoryName: "Thời trang",
    });
  });

  it("id không tồn tại thì trả null", async () => {
    expect(await repository.update(999, { price: 1000 })).toBeNull();
  });

  it("đổi sang danh mục không tồn tại thì ném 400 và sản phẩm giữ nguyên", async () => {
    await expect(repository.update(1, { name: "Tên mới", categoryId: 99 })).rejects.toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Danh mục không tồn tại",
    });
    expect(await repository.findById(1)).toEqual(TAI_NGHE);
  });

  it("khóa không thuộc name, price, stock, categoryId bị bỏ qua", async () => {
    const updated = await repository.update(1, { name: "Tên mới", "price = 1 --": 5, color: "đỏ" });
    expect(updated).toEqual({ ...TAI_NGHE, name: "Tên mới" });
  });
});

describe("remove: xóa sản phẩm", () => {
  it("xóa sản phẩm chưa nằm trong đơn nào thì trả true và sản phẩm biến mất", async () => {
    expect(await repository.remove(7)).toBe(true);
    expect(await repository.findById(7)).toBeNull();
    expect(await countProducts()).toBe(7);
  });

  it("id không tồn tại thì trả false", async () => {
    expect(await repository.remove(999)).toBe(false);
  });

  it("sản phẩm đã nằm trong đơn hàng thì ném 409 CONFLICT và hàng còn nguyên", async () => {
    await expect(repository.remove(1)).rejects.toMatchObject({
      status: 409,
      code: "CONFLICT",
      message: "Sản phẩm đã có trong đơn hàng, không thể xóa",
    });
    expect(await repository.findById(1)).toEqual(TAI_NGHE);
  });
});

describe("Chuỗi độc hại không phá được dữ liệu", () => {
  it("findAll với q là ' OR 1=1 -- thì không trả sản phẩm nào, kể cả khi đã lọc categoryId", async () => {
    expect(await repository.findAll({ q: "' OR 1=1 -- " })).toEqual([]);
    expect(await repository.findAll({ categoryId: 3, q: "' OR 1=1 -- " })).toEqual([]);
  });

  it("findAll với q là '; DROP TABLE products; -- thì không trả gì và bảng products còn nguyên", async () => {
    expect(await repository.findAll({ q: "'; DROP TABLE products; -- " })).toEqual([]);
    expect(await countProducts()).toBe(8);
  });

  it("create và update lưu nguyên văn tên chứa dấu nháy và mã SQL", async () => {
    const name = "Cáp O'Neil'); DROP TABLE products; -- ";
    const created = await repository.create({ name, price: 90000, categoryId: 1 });
    expect(created.name).toBe(name);
    const updated = await repository.update(2, { name });
    expect(updated.name).toBe(name);
    expect(await countProducts()).toBe(9);
  });
});
