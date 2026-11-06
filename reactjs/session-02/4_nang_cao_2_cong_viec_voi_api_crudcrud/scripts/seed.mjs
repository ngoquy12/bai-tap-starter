// Nạp dữ liệu mẫu (db.seed.json) vào endpoint crudcrud của BẠN.
//   1. Mở https://crudcrud.com, sao chép địa chỉ endpoint (dạng https://crudcrud.com/api/<32 ký tự>).
//   2. Dán vào API_BASE trong src/config.js.
//   3. Chạy: npm run seed
// Mỗi endpoint chỉ nhận 100 yêu cầu và bị xóa sau 24 giờ. Script dùng đúng 1 yêu cầu đọc cho mỗi tài nguyên
// cộng 1 yêu cầu ghi cho mỗi bản ghi mẫu. Hết hạn mức thì lấy endpoint mới ở crudcrud.com, dán lại và chạy lại.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { API_BASE } = await import(pathToFileURL(join(root, "src", "config.js")).href);

if (!/^https:\/\/crudcrud\.com\/api\/[a-f0-9]{32}$/.test(API_BASE || "") || /\/0{32}$/.test(API_BASE)) {
  console.error("API_BASE trong src/config.js chưa đúng. Dán endpoint lấy từ https://crudcrud.com (không có dấu / ở cuối).");
  process.exit(1);
}

const seed = JSON.parse(readFileSync(join(root, "db.seed.json"), "utf8"));

async function send(method, path, body) {
  const res = await fetch(API_BASE + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    const quota = /exceeded allowed number of requests/.test(text);
    throw new Error(quota ? "Endpoint đã hết 100 yêu cầu. Lấy endpoint mới ở https://crudcrud.com rồi dán vào src/config.js." : `${method} ${path} trả ${res.status} ${text.slice(0, 120)}`);
  }
  return text ? JSON.parse(text) : null;
}

let used = 0;
try {
  for (const [name, rows] of Object.entries(seed)) {
    const existing = await send("GET", `/${name}`);
    used++;
    if (existing.length > 0) {
      console.log(`/${name} đã có ${existing.length} bản ghi, bỏ qua. Muốn nạp lại từ đầu, hãy lấy endpoint mới ở https://crudcrud.com.`);
      continue;
    }
    for (const row of rows) {
      await send("POST", `/${name}`, row);
      used++;
    }
    console.log(`Đã nạp ${rows.length} bản ghi vào /${name}.`);
  }
  console.log(`Xong. Đã dùng ${used} trong 100 yêu cầu của endpoint này.`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
