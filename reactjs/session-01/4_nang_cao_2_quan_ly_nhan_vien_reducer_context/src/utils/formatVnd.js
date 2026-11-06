// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Định dạng số tiền VND: 1250000 -> "1.250.000 đ"
function formatVnd(amount) {
  const digits = String(amount);
  let result = "";
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) {
      result += ".";
    }
    result += digits[i];
  }
  return result + " đ";
}

export default formatVnd;
// ===== HẾT MÃ NỀN =====
