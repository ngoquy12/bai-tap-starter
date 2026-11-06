// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Đổi ngày ISO "2026-11-10" thành "10/11/2026" bằng cách cắt chuỗi (không dùng Date).
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export default formatDate;
