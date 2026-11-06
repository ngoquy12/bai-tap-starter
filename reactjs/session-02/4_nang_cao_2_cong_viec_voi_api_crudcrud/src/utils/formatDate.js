// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// "2026-11-10" thành "10/11/2026" (xử lý chuỗi, không dùng Date).
function formatDate(iso) {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export default formatDate;
