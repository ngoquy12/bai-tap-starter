// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Làm tròn tối đa một chữ số thập phân và dùng dấu phẩy kiểu Việt Nam:
// formatNumber(25.9) trả "25,9", formatNumber(5) trả "5", formatNumber(23.04) trả "23".
function formatNumber(value) {
  return String(Math.round(value * 10) / 10).replace(".", ",");
}

export default formatNumber;
