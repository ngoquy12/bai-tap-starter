// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Đổi số tiền thành chuỗi VND: 18000000 thành "18.000.000 đ".
function formatVnd(amount) {
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
}

export default formatVnd;
