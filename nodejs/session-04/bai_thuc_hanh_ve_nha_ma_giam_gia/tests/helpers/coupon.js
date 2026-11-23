// Hàm dùng chung cho các tệp test của mô-đun mã giảm giá. KHÔNG sửa tệp này.
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { resetDatabase } = require("./db");

const ROOT = path.join(__dirname, "..", "..");

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

// Mở một kết nối riêng tới cơ sở dữ liệu thử, cho phép nhiều câu lệnh trong một lần gửi
function connect(withDatabase = true) {
  return mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: withDatabase ? process.env.DB_NAME : undefined,
    multipleStatements: true,
    decimalNumbers: true,
    dateStrings: true,
  });
}

// Chạy một đoạn SQL trên kết nối mới; trả về lỗi (hoặc null) để test tự quyết định
async function runScript(sql) {
  const connection = await connect();
  try {
    await connection.query(sql);
    return null;
  } catch (error) {
    return error;
  } finally {
    await connection.end();
  }
}

// Xóa các đối tượng của bài (nếu còn từ lần chạy trước) rồi nạp lại schema.sql và seed.sql
async function cleanDatabase() {
  const database = process.env.DB_NAME;
  if (!/_test$/.test(database)) {
    throw new Error(`Từ chối xóa dữ liệu: tên cơ sở dữ liệu "${database}" không kết thúc bằng _test.`);
  }
  const connection = await connect(false);
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      USE \`${database}\`;
      SET FOREIGN_KEY_CHECKS = 0;
      DROP VIEW IF EXISTS v_order_payments;
      DROP PROCEDURE IF EXISTS sp_apply_coupon;
      DROP TABLE IF EXISTS coupon_redemptions, coupon_categories, coupons;
      SET FOREIGN_KEY_CHECKS = 1;`
    );
  } finally {
    await connection.end();
  }
  await resetDatabase();
}

// Chuẩn bị dữ liệu: bảng của bạn (Phần A), dữ liệu mẫu, rồi procedure, trigger, view (Phần C) nếu cần
async function prepareShop({ withRoutines = false } = {}) {
  await cleanDatabase();
  const result = {
    tableError: await runScript(readFile("src/sql/coupon_tables.sql")),
    fixtureError: null,
    procedureError: null,
    triggerViewError: null,
  };
  result.fixtureError = await runScript(readFile("tests/fixtures/coupon-data.sql"));
  if (withRoutines) {
    result.procedureError = await runScript(readFile("src/sql/sp_apply_coupon.sql"));
    result.triggerViewError = await runScript(readFile("src/sql/coupon_trigger_view.sql"));
  }
  return result;
}

// Chạy truy vấn, trả về hàng (đối tượng thuần) và tên cột theo thứ tự
async function select(connection, sql, params = []) {
  const [rows, fields] = await connection.query(sql, params);
  return { rows: JSON.parse(JSON.stringify(rows)), columns: (fields || []).map((field) => field.name) };
}

// Trả về errno của lỗi, hoặc null nếu câu lệnh chạy được
async function errnoOf(promise) {
  try {
    await promise;
    return null;
  } catch (error) {
    return error.errno;
  }
}

// Gọi sp_apply_coupon trên kết nối cho trước; trả { discount } hoặc { errno, message }
async function applyCoupon(connection, orderId, code) {
  try {
    await connection.query("CALL sp_apply_coupon(?, ?, @discount)", [orderId, code]);
    const [[row]] = await connection.query("SELECT @discount AS discount");
    return { discount: row.discount };
  } catch (error) {
    return { errno: error.errno, message: error.sqlMessage };
  }
}

module.exports = { ROOT, readFile, connect, runScript, prepareShop, select, errnoOf, applyCoupon };
