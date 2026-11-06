// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Đổi ngày ISO "2026-11-06" thành "06/11" (ngày/tháng, dùng cho dự báo thời tiết).
function formatShortDate(iso) {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

export default formatShortDate;
