// C4: truy vấn pricePosition trong src/sql/c4_price_position.js. KHÔNG sửa tệp này.
const { connect, freshDatabase, select, sqlText } = require("./helpers/hw");
const { pricePosition } = require("../src/sql/c4_price_position");

let db;

beforeAll(async () => {
  await freshDatabase();
  db = await connect();
});

afterAll(async () => {
  await db.end();
});

describe("C4 - pricePosition", () => {
  it("trả đúng tên và thứ tự cột", async () => {
    const { columns } = await select(db, sqlText(pricePosition, "pricePosition"));
    expect(columns).toEqual(["id", "name", "categoryId", "price", "priceRank", "inStockCount"]);
  });

  it("bỏ sản phẩm hết hàng, xếp hạng giá trong từng danh mục", async () => {
    const { rows } = await select(db, pricePosition);
    expect(rows).toEqual([
      { id: 2, name: "Bàn phím cơ", categoryId: 1, price: 890000, priceRank: 1, inStockCount: 3 },
      { id: 1, name: "Tai nghe Bluetooth", categoryId: 1, price: 450000, priceRank: 2, inStockCount: 3 },
      { id: 6, name: "Chuột không dây", categoryId: 1, price: 320000, priceRank: 3, inStockCount: 3 },
      { id: 7, name: "Quần jeans", categoryId: 2, price: 590000, priceRank: 1, inStockCount: 2 },
      { id: 3, name: "Áo thun", categoryId: 2, price: 199000, priceRank: 2, inStockCount: 2 },
      { id: 8, name: "Sách Cơ sở dữ liệu", categoryId: 3, price: 210000, priceRank: 1, inStockCount: 2 },
      { id: 5, name: "Sách Lập trình", categoryId: 3, price: 160000, priceRank: 2, inStockCount: 2 },
    ]);
  });

  it("sản phẩm hết hàng được nhập lại thì xếp hạng và số đếm đổi theo", async () => {
    await db.query("UPDATE products SET stock = 5 WHERE id = 4");
    const { rows } = await select(db, pricePosition);
    const fashion = rows.filter((row) => row.categoryId === 2);
    expect(fashion.map((row) => [row.id, row.priceRank, row.inStockCount])).toEqual([
      [4, 1, 3],
      [7, 2, 3],
      [3, 3, 3],
    ]);
  });
});
