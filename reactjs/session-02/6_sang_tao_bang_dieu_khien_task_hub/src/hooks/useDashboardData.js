// ===== BÀI LÀM: tải nhân viên và công việc MỘT lần, dùng chung cho cả bảng điều khiển =====
// TODO: dùng useState, useEffect, Promise.all với getEmployees và getTasks (xem đề bài, chức năng 2).
// Trả { employees, tasks, loading, error, reload, changeStatus }.
function useDashboardData() {
  return { employees: [], tasks: [], loading: false, error: "", reload() {}, changeStatus() {} };
}

export default useDashboardData;
