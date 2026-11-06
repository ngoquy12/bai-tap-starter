// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Định dạng tiền VND: 18000000 thành "18.000.000 đ".
function formatVnd(amount) {
  return `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} đ`;
}

export default formatVnd;
