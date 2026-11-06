const mysql = require("mysql2/promise");
const config = require("../config/env");

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  // SUM và AVG trả DECIMAL; bật tùy chọn này để nhận số thay vì chuỗi.
  decimalNumbers: true,
});

module.exports = pool;
