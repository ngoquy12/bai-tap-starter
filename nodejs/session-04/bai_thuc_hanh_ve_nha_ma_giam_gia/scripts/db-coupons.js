// Nạp lại cơ sở dữ liệu DB_NAME (mặc định rikkei_shop_sql) cùng mô-đun mã giảm giá để thử bằng tay.
// Thứ tự: db/schema.sql, db/seed.sql, src/sql/coupon_tables.sql, tests/fixtures/coupon-data.sql,
// src/sql/sp_apply_coupon.sql, src/sql/coupon_trigger_view.sql. Tệp nào lỗi thì dừng và in thông báo của MySQL.
// Chạy: npm run db:coupons
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const config = require("../src/config/env");

const ROOT = path.join(__dirname, "..");
const FILES = [
  "db/schema.sql",
  "db/seed.sql",
  "src/sql/coupon_tables.sql",
  "tests/fixtures/coupon-data.sql",
  "src/sql/sp_apply_coupon.sql",
  "src/sql/coupon_trigger_view.sql",
];

async function main() {
  const database = config.db.database;
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.query(`USE \`${database}\``);
    await connection.query(
      "SET FOREIGN_KEY_CHECKS = 0; DROP VIEW IF EXISTS v_order_payments; DROP PROCEDURE IF EXISTS sp_apply_coupon; DROP TABLE IF EXISTS coupon_redemptions, coupon_categories, coupons; SET FOREIGN_KEY_CHECKS = 1;"
    );
    for (const file of FILES) {
      try {
        await connection.query(fs.readFileSync(path.join(ROOT, file), "utf8"));
        console.log(`Đã chạy ${file}.`);
      } catch (error) {
        console.error(`Lỗi khi chạy ${file}: ${error.errno} ${error.message}`);
        process.exitCode = 1;
        return;
      }
    }
    console.log(`Cơ sở dữ liệu ${database} đã sẵn sàng để thử bằng tay.`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Không nạp được cơ sở dữ liệu:", error.message);
  process.exit(1);
});
