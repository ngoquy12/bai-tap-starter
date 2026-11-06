// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Gọi lần lượt các hàm của hai repository trên cơ sở dữ liệu phát triển (DB_NAME) và in kết quả.
// Chạy: npm run db:setup (đưa dữ liệu về như seed) rồi node scripts/try.js
const pool = require("../src/db/pool");
const products = require("../src/repositories/products.repository");
const orders = require("../src/repositories/orders.repository");

// In kết quả trả về, bỏ createdAt vì giá trị đổi theo thời điểm chạy
function show(label, value) {
  console.log(label + " -> " + JSON.stringify(value, (key, v) => (key === "createdAt" ? undefined : v)));
}

// Chạy một lời gọi và in kết quả hoặc lỗi (status, code, message)
async function step(label, fn) {
  try {
    show(label, await fn());
  } catch (error) {
    if (error.status) {
      console.log(label + " -> lỗi " + error.status + " " + error.code + ": " + error.message);
    } else {
      console.log(label + " -> lỗi không mong đợi: " + error.message);
    }
  }
}

async function main() {
  await step("1. products.findAll({ categoryId: 3 })", () => products.findAll({ categoryId: 3 }));
  await step("2. products.findById(999)", () => products.findById(999));
  await step("3. products.create({ name: 'Cáp sạc', price: 90000, categoryId: 99 })", () =>
    products.create({ name: "Cáp sạc", price: 90000, categoryId: 99 })
  );
  await step("4. orders.createOrder(2, [sp 1 x 2, sp 3 x 1])", () =>
    orders.createOrder(2, [
      { productId: 1, quantity: 2 },
      { productId: 3, quantity: 1 },
    ])
  );
  await step("5. orders.findOrderById(5)", () => orders.findOrderById(5));
  await step("6. products.update(1, { price: 500000 })", () => products.update(1, { price: 500000 }));
  await step("7. orders.findOrderById(5) sau khi đổi giá", () => orders.findOrderById(5));
  await step("8. orders.createOrder(2, [sp 1 x 1, sp 4 x 1])", () =>
    orders.createOrder(2, [
      { productId: 1, quantity: 1 },
      { productId: 4, quantity: 1 },
    ])
  );
  await step("9. products.findById(1) sau lần đặt lỗi", () => products.findById(1));
  await step("10. orders.cancelOrder(5)", () => orders.cancelOrder(5));
  await step("11. products.findById(1) sau khi hủy", () => products.findById(1));
  await step("12. orders.cancelOrder(1)", () => orders.cancelOrder(1));
  await step("13. orders.cancelOrder(5) lần hai", () => orders.cancelOrder(5));
  await pool.end();
}

main();
