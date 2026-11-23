// Hàm dùng chung cho các tệp test của bài tập về nhà. KHÔNG sửa tệp này.
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const ROOT = path.join(__dirname, "..", "..");

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function connectionOptions(withDatabase) {
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: withDatabase ? process.env.DB_NAME : undefined,
    multipleStatements: true,
    decimalNumbers: true,
    dateStrings: true,
  };
}

// Mở một kết nối riêng tới cơ sở dữ liệu thử, cho phép nhiều câu lệnh trong một lần gửi
function connect() {
  return mysql.createConnection(connectionOptions(true));
}

// Tạo pool tới cơ sở dữ liệu thử (bài N2 nhận pool làm tham số)
function createTestPool() {
  return mysql.createPool({ ...connectionOptions(true), connectionLimit: 5 });
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

// Xóa hẳn cơ sở dữ liệu thử (cả bảng, view, procedure của bài) rồi nạp lại db/schema.sql, db/seed.sql
// và các tệp trong danh sách files (đường dẫn tính từ gốc dự án). Trả về lỗi đầu tiên theo tên tệp.
async function freshDatabase(files = []) {
  const database = process.env.DB_NAME;
  if (!/_test$/.test(database)) {
    throw new Error(`Từ chối xóa dữ liệu: tên cơ sở dữ liệu "${database}" không kết thúc bằng _test.`);
  }
  const connection = await mysql.createConnection(connectionOptions(false));
  try {
    await connection.query(
      `DROP DATABASE IF EXISTS \`${database}\`;
      CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      USE \`${database}\`;`
    );
    await connection.query(readFile("db/schema.sql"));
    await connection.query(readFile("db/seed.sql"));
  } finally {
    await connection.end();
  }
  const errors = {};
  for (const file of files) {
    errors[file] = await runScript(readFile(file));
  }
  return errors;
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

// Trả về { errno, message } của lỗi, hoặc null nếu câu lệnh chạy được
async function errorOf(promise) {
  try {
    await promise;
    return null;
  } catch (error) {
    return { errno: error.errno, message: error.sqlMessage || error.message };
  }
}

// Kiểm tra một giá trị xuất là chuỗi SQL bắt đầu bằng SELECT hoặc WITH
function sqlText(value, name) {
  if (typeof value !== "string" || !/^\s*(SELECT|WITH)\b/i.test(value)) {
    throw new Error(`Truy vấn ${name} phải là chuỗi bắt đầu bằng SELECT hoặc WITH`);
  }
  return value;
}

module.exports = {
  ROOT,
  readFile,
  connect,
  createTestPool,
  runScript,
  freshDatabase,
  select,
  errnoOf,
  errorOf,
  sqlText,
};
