// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Đổi ngày ISO thành dạng Việt Nam: "2022-03-14" thành "14/03/2022".
function formatDate(iso) {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export default formatDate;
