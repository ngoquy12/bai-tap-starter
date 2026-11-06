// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Công việc quá hạn khi hạn nhỏ hơn hôm nay (so chuỗi ISO) và chưa hoàn thành.
function isOverdue(task, today) {
  return task.status !== "done" && task.dueDate < today;
}

export default isOverdue;
