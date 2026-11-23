// Công cụ dùng chung cho các tệp test. KHÔNG sửa tệp này.
// freshDatabase() xóa hẳn cơ sở dữ liệu thử (bảng, view, procedure, trigger) rồi nạp lại db/schema.sql và db/seed.sql.
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const ROOT = path.join(__dirname, "..", "..");

function connectionOptions(withDatabase) {
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: withDatabase ? process.env.DB_NAME : undefined,
    multipleStatements: true,
    decimalNumbers: true,
  };
}

function checkTestName() {
  const database = process.env.DB_NAME;
  if (!/_test$/.test(database)) {
    throw new Error(`Từ chối xóa dữ liệu: tên cơ sở dữ liệu "${database}" không kết thúc bằng _test.`);
  }
  return database;
}

async function resetDatabase() {
  const database = checkTestName();
  const connection = await mysql.createConnection(connectionOptions(false));
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.query(`USE \`${database}\``);
  for (const file of ["schema.sql", "seed.sql"]) {
    await connection.query(fs.readFileSync(path.join(ROOT, "db", file), "utf8"));
  }
  await connection.end();
}

async function freshDatabase() {
  const database = checkTestName();
  const connection = await mysql.createConnection(connectionOptions(false));
  await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
  await connection.end();
  await resetDatabase();
}

// Mở một kết nối riêng tới cơ sở dữ liệu thử; nhớ gọi end() khi dùng xong.
function openConnection() {
  return mysql.createConnection(connectionOptions(true));
}

// Chạy cả một tệp .sql (đường dẫn tính từ gốc dự án), ví dụ runSqlFile("src", "sql", "lab1_wishlists.sql").
async function runSqlFile(...parts) {
  const connection = await openConnection();
  try {
    await connection.query(fs.readFileSync(path.join(ROOT, ...parts), "utf8"));
  } finally {
    await connection.end();
  }
}

// Như runSqlFile nhưng trả về lỗi (hoặc null) thay vì ném lỗi.
async function tryRunSqlFile(...parts) {
  try {
    await runSqlFile(...parts);
    return null;
  } catch (error) {
    return error;
  }
}

async function errnoOf(promise) {
  try {
    await promise;
    return null;
  } catch (error) {
    return error.errno;
  }
}

module.exports = { resetDatabase, freshDatabase, openConnection, runSqlFile, tryRunSqlFile, errnoOf };
