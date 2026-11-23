// N2: hàm exchangeItem trong src/sql/n2_exchange_item.js. KHÔNG sửa tệp này.
const { createTestPool, freshDatabase } = require("./helpers/hw");
const { exchangeItem } = require("../src/sql/n2_exchange_item");

let pool;

beforeEach(async () => {
  await freshDatabase();
  pool = createTestPool();
});

afterEach(async () => {
  await pool.end();
});

async function snapshot() {
  const [products] = await pool.query("SELECT id, stock FROM products ORDER BY id");
  const [orders] = await pool.query("SELECT id, total FROM orders ORDER BY id");
  const [items] = await pool.query("SELECT id, product_id, quantity, unit_price FROM order_items ORDER BY id");
  return { products, orders, items };
}

describe("N2 - exchangeItem", () => {
  it("đổi Áo thun (dòng 2 của đơn 1) sang Quần jeans: trả tổng đơn mới", async () => {
    const result = await exchangeItem(pool, 2, 7);
    expect(result).toEqual({ orderId: 1, total: 1490000 });
  });

  it("sau khi đổi: dòng đơn mang sản phẩm và giá mới, kho hai sản phẩm đổi đúng", async () => {
    await exchangeItem(pool, 2, 7);
    const [[item]] = await pool.query("SELECT product_id, quantity, unit_price FROM order_items WHERE id = 2");
    expect(item).toEqual({ product_id: 7, quantity: 1, unit_price: 590000 });
    const [stocks] = await pool.query("SELECT id, stock FROM products WHERE id IN (3, 7) ORDER BY id");
    expect(stocks).toEqual([
      { id: 3, stock: 51 },
      { id: 7, stock: 17 },
    ]);
  });

  it("sản phẩm mới hết hàng: báo 'Không đủ hàng trong kho', dữ liệu không đổi", async () => {
    const before = await snapshot();
    await expect(exchangeItem(pool, 1, 4)).rejects.toThrow("Không đủ hàng trong kho");
    expect(await snapshot()).toEqual(before);
  });

  it("dòng đơn không tồn tại: báo 'Dòng đơn không tồn tại'", async () => {
    await expect(exchangeItem(pool, 99, 7)).rejects.toThrow("Dòng đơn không tồn tại");
  });

  it("sản phẩm mới không tồn tại: báo 'Sản phẩm không tồn tại', dữ liệu không đổi", async () => {
    const before = await snapshot();
    await expect(exchangeItem(pool, 2, 99)).rejects.toThrow("Sản phẩm không tồn tại");
    expect(await snapshot()).toEqual(before);
  });

  it("đổi sang chính sản phẩm đang có: báo 'Sản phẩm mới trùng sản phẩm cũ'", async () => {
    await expect(exchangeItem(pool, 2, 3)).rejects.toThrow("Sản phẩm mới trùng sản phẩm cũ");
  });
});
