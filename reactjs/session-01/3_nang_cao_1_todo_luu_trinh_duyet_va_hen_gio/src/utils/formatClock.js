// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Đổi số giây thành chuỗi phút:giây, ví dụ 1500 thành "25:00", 65 thành "01:05".
function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

export default formatClock;
