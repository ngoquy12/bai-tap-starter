// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Đổi ngày dạng ISO sang dạng Việt Nam: formatDate("2022-03-14") trả "14/03/2022".
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return day + "/" + month + "/" + year;
}

export default formatDate;
