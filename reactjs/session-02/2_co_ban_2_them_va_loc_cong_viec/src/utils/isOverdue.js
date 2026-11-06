// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Công việc quá hạn khi hạn nhỏ hơn hôm nay và chưa hoàn thành (so sánh chuỗi ISO).
function isOverdue(task, today) {
  return task.status !== "done" && task.dueDate < today;
}

export default isOverdue;
