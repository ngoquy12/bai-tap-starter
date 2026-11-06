// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Công việc có thuộc kết quả của bộ lọc hiện tại không? Dùng để biết việc vừa thêm có nên hiện trong danh sách đang xem.
// status: "" (tất cả) hoặc todo/doing/done; q: từ khóa tìm theo tên (không phân biệt hoa thường).
function matchesFilters(task, { status, q }) {
  const keyword = q.trim().toLowerCase();
  const okStatus = status === "" || task.status === status;
  const okKeyword = keyword === "" || task.title.toLowerCase().includes(keyword);
  return okStatus && okKeyword;
}

export default matchesFilters;
