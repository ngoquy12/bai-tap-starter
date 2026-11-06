// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Đổi số tiền thành chuỗi có dấu chấm ngăn cách hàng nghìn: formatVnd(18000000) trả "18.000.000 đ".
function formatVnd(amount) {
  const digits = String(Math.trunc(amount));
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
}

export default formatVnd;
