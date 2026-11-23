// N3: procedure sp_merge_tags trong src/sql/n3_sp_merge_tags.sql. KHÔNG sửa tệp này.
const { connect, freshDatabase, select, errorOf } = require("./helpers/hw");

const SQL_FILE = "src/sql/n3_sp_merge_tags.sql";
let db;
let fileError;

beforeEach(async () => {
  const errors = await freshDatabase([SQL_FILE]);
  fileError = errors[SQL_FILE];
  db = await connect();
});

afterEach(async () => {
  await db.end();
});

async function tagPairs() {
  const { rows } = await select(db, "SELECT product_id AS p, tag_id AS t FROM product_tags ORDER BY tag_id, product_id");
  return rows.map((row) => `${row.p}-${row.t}`);
}

async function merge(fromTagId, toTagId) {
  await db.query("CALL sp_merge_tags(?, ?, @moved)", [fromTagId, toTagId]);
  const [[row]] = await db.query("SELECT @moved AS moved");
  return row.moved;
}

describe("N3 - sp_merge_tags", () => {
  it("tệp src/sql/n3_sp_merge_tags.sql chạy không lỗi", () => {
    expect(fileError).toBeNull();
  });

  it("gộp Hàng mới (3) vào Giảm giá (2): gắn thêm 1 sản phẩm", async () => {
    expect(await merge(3, 2)).toBe(1);
  });

  it("sau khi gộp: nhãn 2 có sản phẩm 1, 3, 6, 8 và nhãn 3 không còn", async () => {
    await merge(3, 2);
    expect(await tagPairs()).toEqual(["1-1", "2-1", "1-2", "3-2", "6-2", "8-2"]);
    const { rows } = await select(db, "SELECT id FROM tags ORDER BY id");
    expect(rows.map((row) => row.id)).toEqual([1, 2]);
  });

  it("gộp một nhãn vào chính nó: lỗi 1644 'Hai nhãn phải khác nhau'", async () => {
    const error = await errorOf(merge(2, 2));
    expect(error).toEqual({ errno: 1644, message: "Hai nhãn phải khác nhau" });
  });

  it("nhãn bị gộp không tồn tại: lỗi 1644 'Nhãn không tồn tại', dữ liệu không đổi", async () => {
    const before = await tagPairs();
    const error = await errorOf(merge(99, 2));
    expect(error).toEqual({ errno: 1644, message: "Nhãn không tồn tại" });
    expect(await tagPairs()).toEqual(before);
  });
});
