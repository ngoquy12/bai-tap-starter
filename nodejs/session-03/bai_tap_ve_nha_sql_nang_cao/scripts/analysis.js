// Công cụ chạy thử cho ba bài Phân tích P2, P3, P4. Chỉ dùng cơ sở dữ liệu THỬ (DB_NAME_TEST, tên kết thúc bằng _test).
// Chạy: npm run p2 | npm run p3 | npm run p4
require("dotenv").config();
process.env.DB_NAME = process.env.DB_NAME_TEST || "rikkei_shop_sql_test";

const { connect, freshDatabase, select } = require("../tests/helpers/hw");

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

// Đo thời gian chạy một truy vấn: 1 lần làm nóng, lấy trung vị của 5 lần
async function measure(db, sql, params) {
  await db.query(sql, params);
  const times = [];
  for (let i = 0; i < 5; i += 1) {
    const start = process.hrtime.bigint();
    await db.query(sql, params);
    times.push(Number(process.hrtime.bigint() - start) / 1e6);
  }
  return median(times).toFixed(1);
}

async function runP2() {
  const errors = await freshDatabase([
    "tests/fixtures/many-orders.sql",
    "tests/fixtures/many-order-items.sql",
    "src/sql/p2_indexes.sql",
  ]);
  if (errors["src/sql/p2_indexes.sql"]) {
    console.log(`Tệp src/sql/p2_indexes.sql lỗi: ${errors["src/sql/p2_indexes.sql"].message}`);
    process.exitCode = 1;
    return;
  }
  const queries = require("../src/sql/p2_queries");
  const db = await connect();
  try {
    for (const [name, { sql, params }] of Object.entries(queries)) {
      const { rows: plan } = await select(db, `EXPLAIN ${sql}`, params);
      const { rows } = await select(db, sql, params);
      console.log(`\n${name} (tham số ${JSON.stringify(params)}): ${rows.length} hàng, ${await measure(db, sql, params)} ms`);
      for (const step of plan) {
        console.log(`  bảng ${step.table} | type ${step.type} | key ${step.key} | rows ${step.rows} | Extra ${step.Extra}`);
      }
    }
  } finally {
    await db.end();
  }
}

async function runP3() {
  await freshDatabase(["tests/fixtures/p3-products.sql"]);
  const versions = require("../src/sql/p3_three_versions");
  const db = await connect();
  try {
    for (const [name, sql] of Object.entries(versions)) {
      const { rows } = await select(db, sql);
      console.log(`\n${name}: ${rows.length} hàng`);
      console.table(rows);
    }
  } finally {
    await db.end();
  }
}

async function runSession(label, statements, startDelay, started, log) {
  await new Promise((resolve) => setTimeout(resolve, startDelay));
  const db = await connect();
  await db.query("SET SESSION innodb_lock_wait_timeout = 5");
  try {
    for (const statement of statements) {
      try {
        await db.query(statement);
        log.push({ at: Date.now() - started, label, statement, result: "Query OK" });
      } catch (error) {
        log.push({ at: Date.now() - started, label, statement, result: `ERROR ${error.errno}: ${error.sqlMessage}` });
        await db.query("ROLLBACK");
        return;
      }
    }
  } finally {
    await db.end();
  }
}

async function runP4() {
  await freshDatabase();
  const { sessionA, sessionB } = require("../src/sql/p4_restock_sessions");
  const log = [];
  const started = Date.now();
  await Promise.all([
    runSession("A", sessionA, 0, started, log),
    runSession("B", sessionB, 100, started, log),
  ]);
  log.sort((a, b) => a.at - b.at);
  for (const entry of log) {
    console.log(`${(entry.at / 1000).toFixed(2).padStart(5)} giây | phiên ${entry.label} | ${entry.statement} | ${entry.result}`);
  }
  const db = await connect();
  const { rows } = await select(db, "SELECT id, stock FROM products WHERE id IN (1, 2) ORDER BY id");
  await db.end();
  console.log(`Sau cùng: ${rows.map((row) => `sản phẩm ${row.id} stock ${row.stock}`).join(", ")}`);
}

const tasks = { p2: runP2, p3: runP3, p4: runP4 };
const task = tasks[process.argv[2]];
if (!task) {
  console.error("Dùng: node scripts/analysis.js p2 | p3 | p4");
  process.exit(1);
}
task().catch((error) => {
  console.error("Không chạy được:", error.message);
  process.exit(1);
});
