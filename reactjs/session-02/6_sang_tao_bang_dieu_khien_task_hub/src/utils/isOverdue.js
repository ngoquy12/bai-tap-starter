// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Quá hạn: hạn nhỏ hơn hôm nay (so sánh chuỗi ISO) và chưa hoàn thành.
function isOverdue(task, today) {
  return task.dueDate < today && task.status !== "done";
}

export default isOverdue;
