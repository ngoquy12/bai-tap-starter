// Chạy SQL trên cơ sở dữ liệu DB_NAME (mặc định rikkei_shop_sql) rồi in kết quả dạng bảng.
// Cách dùng:
//   node scripts/sql.js file src/sql/lab1_wishlists.sql          chạy cả tệp .sql (nhiều câu lệnh)
//   node scripts/sql.js query storefront productsByTag "Giảm giá"  chạy một truy vấn xuất từ src/sql/<tệp>.js với tham số
//   node scripts/sql.js explain catalog categoryFirstPage 3 2   in kế hoạch đọc (EXPLAIN) của một truy vấn xuất
//   node scripts/sql.js exec "SELECT COUNT(*) AS total FROM wishlists"
// Tham số là số nguyên (ví dụ 2) được đổi sang Number trước khi gửi.
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const config = require("../src/config/env");

function printRows(rows) {
  if (rows.length === 0) {
    console.log("Empty set");
    return;
  }
  const columns = Object.keys(rows[0]);
  console.log(columns.join(" | "));
  for (const row of rows) {
    console.log(columns.map((column) => (row[column] === null ? "NULL" : String(row[column]))).join(" | "));
  }
}

function printResult(result) {
  if (Array.isArray(result)) {
    // Kết quả của SELECT là mảng hàng; kết quả của nhiều câu lệnh là mảng các kết quả.
    if (result.length > 0 && (Array.isArray(result[0]) || result[0].constructor.name === "ResultSetHeader")) {
      for (const item of result) {
        printResult(item);
      }
      return;
    }
    printRows(result);
    return;
  }
  console.log(`Query OK, ${result.affectedRows} rows affected`);
}

function parseParams(values) {
  return values.map((value) => (/^\d+$/.test(value) ? Number(value) : value));
}

async function main() {
  const [mode, ...args] = process.argv.slice(2);
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    multipleStatements: true,
    decimalNumbers: true,
  });
  try {
    if (mode === "file") {
      const sql = fs.readFileSync(path.resolve(args[0]), "utf8");
      const [result] = await connection.query(sql);
      printResult(result);
    } else if (mode === "query" || mode === "explain") {
      const [moduleName, exportName, ...params] = args;
      const queries = require(path.join("..", "src", "sql", moduleName));
      const prefix = mode === "explain" ? "EXPLAIN " : "";
      const [result] = await connection.query(prefix + queries[exportName], parseParams(params));
      printResult(result);
    } else if (mode === "exec") {
      const [result] = await connection.query(args[0]);
      printResult(result);
    } else {
      console.log("Cách dùng: node scripts/sql.js file <tệp.sql> | query <tệp> <tên> [tham số...] | explain <tệp> <tên> [tham số...] | exec \"<SQL>\"");
    }
  } catch (error) {
    console.log(`ERROR ${error.errno} (${error.sqlState}): ${error.sqlMessage || error.message}`);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

main();
