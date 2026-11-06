// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Đổi chuỗi ngày ISO "2022-03-14" thành "14/03/2022" (cắt chuỗi, không dùng Date).
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export default formatDate;
