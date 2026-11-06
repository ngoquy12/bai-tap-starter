// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Công việc quá hạn khi hạn hoàn thành nhỏ hơn ngày hôm nay và chưa xong.
// Hai chuỗi ngày ISO so sánh trực tiếp bằng toán tử < được.
function isOverdue(task, today) {
  return task.dueDate < today && task.status !== "done";
}

export default isOverdue;
