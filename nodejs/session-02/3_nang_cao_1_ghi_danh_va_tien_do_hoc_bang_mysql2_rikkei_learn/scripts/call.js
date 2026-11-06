// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Gọi một hàm của repository để thử bằng tay rồi in kết quả hoặc lỗi, kèm số hàng của bảng enrollments.
// Cách dùng: node scripts/call.js <hàm> <đối số 1> <đối số 2> ...
//   <hàm> là tên hàm của enrollments.repository, hoặc courses.<tên hàm> cho courses.repository.
//   Mỗi đối số viết dạng JSON (2, null, "[5,99]"); không phải JSON hợp lệ thì được coi là chuỗi.
// Ví dụ: node scripts/call.js enrollStudent 2 5
//        node scripts/call.js enrollStudentInCourses 6 "[1,99]"
//        node scripts/call.js courses.searchByTitle "' OR 1=1 -- "
const pool = require("../src/db/pool");

const repositories = {
  courses: require("../src/repositories/courses.repository"),
  enrollments: require("../src/repositories/enrollments.repository"),
};

// Đối số dạng JSON thì giải mã, không thì giữ nguyên chuỗi.
function parseArgument(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}

// Bỏ enrolledAt khỏi kết quả in ra vì giá trị đổi theo thời điểm chạy.
function withoutTime(key, value) {
  return key === "enrolledAt" ? undefined : value;
}

async function main() {
  const [target, ...rawArguments] = process.argv.slice(2);
  if (!target) {
    console.log("Cách dùng: node scripts/call.js <hàm> <đối số 1> <đối số 2> ...");
    return;
  }
  const [repositoryName, functionName] = target.includes(".") ? target.split(".") : ["enrollments", target];
  const fn = repositories[repositoryName] && repositories[repositoryName][functionName];
  if (typeof fn !== "function") {
    console.log("Không có hàm", target);
    return;
  }
  const args = rawArguments.map(parseArgument);
  console.log("Gọi:", `${functionName}(${args.map((arg) => JSON.stringify(arg)).join(", ")})`);
  try {
    console.log("Kết quả:", JSON.stringify(await fn(...args), withoutTime));
  } catch (error) {
    if (error.status) {
      console.log("Lỗi", error.status, error.code + ":", error.message);
    } else {
      console.log("Lỗi MySQL", error.code + ":", error.message);
    }
  }
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM enrollments");
  console.log("Số hàng bảng enrollments:", rows[0].total);
  await pool.end();
}

main().catch((error) => {
  console.error("Lỗi:", error.message);
  process.exit(1);
});
// ===== HẾT MÃ NỀN =====
