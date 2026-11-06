// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Đổi ngày ISO sang dạng Việt Nam: "2022-03-14" -> "14/03/2022" (xử lý chuỗi, không dùng Date)
function formatDate(isoDate) {
  const [year, month, day] = String(isoDate).split("-");
  return `${day}/${month}/${year}`;
}

export default formatDate;
// ===== HẾT MÃ NỀN =====
