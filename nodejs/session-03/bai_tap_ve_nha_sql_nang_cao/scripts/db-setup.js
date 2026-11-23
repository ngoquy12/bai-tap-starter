// Tạo cơ sở dữ liệu (nếu chưa có) rồi nạp db/schema.sql và db/seed.sql.
// Chạy: npm run db:setup  (đọc DB_* trong .env; có thể truyền tên khác: node scripts/db-setup.js rikkei_shop)
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const config = require("../src/config/env");

async function main() {
  const database = process.argv[2] || config.db.database;
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.query(`USE \`${database}\``);
  const root = path.join(__dirname, "..", "db");
  for (const file of ["schema.sql", "seed.sql"]) {
    await connection.query(fs.readFileSync(path.join(root, file), "utf8"));
  }
  await connection.end();
  console.log(`Đã nạp schema.sql và seed.sql vào cơ sở dữ liệu ${database}.`);
}

main().catch((error) => {
  console.error("Không nạp được cơ sở dữ liệu:", error.message);
  process.exit(1);
});
