// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Chạy một truy vấn trong src/sql/queries.js và in kết quả.
// Cách dùng: node scripts/run-query.js <tên> [tham số...]
// Ví dụ: node scripts/run-query.js studentsWithoutEnrollment
//        node scripts/run-query.js studentEnrollments 2
//        node scripts/run-query.js updateProgress 80 3 80
const queries = require("../src/sql/queries");
const pool = require("../src/db/pool");

async function main() {
  const name = process.argv[2];
  const params = process.argv.slice(3);
  if (!queries[name]) {
    console.log("Không có truy vấn", name, "- chọn một trong:", Object.keys(queries).join(", "));
  } else {
    const [result] = await pool.query(queries[name], params);
    if (Array.isArray(result)) {
      console.table(result);
    } else {
      console.log("Số hàng bị tác động (affectedRows):", result.affectedRows);
    }
  }
  await pool.end();
}

main().catch((error) => {
  console.error("Lỗi:", error.message);
  process.exit(1);
});
