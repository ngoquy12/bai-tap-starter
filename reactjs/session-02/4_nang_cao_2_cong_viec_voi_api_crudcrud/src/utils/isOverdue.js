// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Quá hạn khi hạn nhỏ hơn hôm nay và việc chưa hoàn thành (so sánh chuỗi ISO).
function isOverdue(task, today) {
  return task.status !== "done" && task.dueDate < today;
}

export default isOverdue;
