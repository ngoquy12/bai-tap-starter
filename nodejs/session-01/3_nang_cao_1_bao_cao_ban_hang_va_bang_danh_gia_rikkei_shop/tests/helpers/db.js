// Tạo lại cơ sở dữ liệu thử từ db/schema.sql và db/seed.sql. Gọi trong beforeAll hoặc beforeEach.
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function resetDatabase() {
  const database = process.env.DB_NAME;
  if (!/_test$/.test(database)) {
    throw new Error(`Từ chối xóa dữ liệu: tên cơ sở dữ liệu "${database}" không kết thúc bằng _test.`);
  }
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.query(`USE \`${database}\``);
  const root = path.join(__dirname, "..", "..", "db");
  for (const file of ["schema.sql", "seed.sql"]) {
    await connection.query(fs.readFileSync(path.join(root, file), "utf8"));
  }
  await connection.end();
}

module.exports = { resetDatabase };
