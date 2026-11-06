// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Dữ liệu công việc (chép từ seed dùng chung).
const tasks = [
  {
    "id": 1,
    "title": "Viết tài liệu API cho module thanh toán",
    "status": "doing",
    "priority": "high",
    "assigneeId": 1,
    "dueDate": "2026-11-10"
  },
  {
    "id": 2,
    "title": "Sửa lỗi hiển thị bảng giá trên Safari",
    "status": "todo",
    "priority": "medium",
    "assigneeId": 11,
    "dueDate": "2026-11-12"
  },
  {
    "id": 3,
    "title": "Chuẩn bị buổi phỏng vấn ứng viên frontend",
    "status": "todo",
    "priority": "high",
    "assigneeId": 2,
    "dueDate": "2026-11-09"
  },
  {
    "id": 4,
    "title": "Đối soát hóa đơn tháng 10",
    "status": "done",
    "priority": "high",
    "assigneeId": 4,
    "dueDate": "2026-11-03"
  },
  {
    "id": 5,
    "title": "Gọi điện chăm sóc 20 khách hàng cũ",
    "status": "doing",
    "priority": "medium",
    "assigneeId": 6,
    "dueDate": "2026-11-11"
  },
  {
    "id": 6,
    "title": "Lập kế hoạch đào tạo nhân viên mới",
    "status": "todo",
    "priority": "medium",
    "assigneeId": 12,
    "dueDate": "2026-11-20"
  },
  {
    "id": 7,
    "title": "Cập nhật bảng lương tháng 11",
    "status": "todo",
    "priority": "high",
    "assigneeId": 8,
    "dueDate": "2026-11-25"
  },
  {
    "id": 8,
    "title": "Kiểm thử chức năng đăng nhập",
    "status": "doing",
    "priority": "high",
    "assigneeId": 5,
    "dueDate": "2026-11-08"
  },
  {
    "id": 9,
    "title": "Họp tổng kết quý 3 với ban giám đốc",
    "status": "done",
    "priority": "medium",
    "assigneeId": 3,
    "dueDate": "2026-10-30"
  },
  {
    "id": 10,
    "title": "Soạn báo giá cho khách hàng mới",
    "status": "doing",
    "priority": "medium",
    "assigneeId": 3,
    "dueDate": "2026-11-13"
  },
  {
    "id": 11,
    "title": "Nâng cấp thư viện React lên bản ổn định",
    "status": "todo",
    "priority": "low",
    "assigneeId": 7,
    "dueDate": "2026-12-01"
  },
  {
    "id": 12,
    "title": "Rà soát hợp đồng lao động hết hạn",
    "status": "todo",
    "priority": "high",
    "assigneeId": 8,
    "dueDate": "2026-11-15"
  },
  {
    "id": 13,
    "title": "Thiết lập môi trường kiểm thử tự động",
    "status": "done",
    "priority": "medium",
    "assigneeId": 5,
    "dueDate": "2026-11-01"
  },
  {
    "id": 14,
    "title": "Tổng hợp chi phí văn phòng phẩm",
    "status": "done",
    "priority": "low",
    "assigneeId": 9,
    "dueDate": "2026-11-02"
  },
  {
    "id": 15,
    "title": "Cập nhật quy trình onboarding",
    "status": "doing",
    "priority": "medium",
    "assigneeId": 2,
    "dueDate": "2026-11-18"
  },
  {
    "id": 16,
    "title": "Tối ưu truy vấn danh sách đơn hàng",
    "status": "doing",
    "priority": "high",
    "assigneeId": 7,
    "dueDate": "2026-11-14"
  },
  {
    "id": 17,
    "title": "Gửi thư cảm ơn khách hàng sau hội thảo",
    "status": "done",
    "priority": "low",
    "assigneeId": 6,
    "dueDate": "2026-10-28"
  },
  {
    "id": 18,
    "title": "Chuẩn bị báo cáo thuế quý 4",
    "status": "todo",
    "priority": "high",
    "assigneeId": 4,
    "dueDate": "2026-12-05"
  },
  {
    "id": 19,
    "title": "Thiết kế lại trang đăng ký khóa học",
    "status": "todo",
    "priority": "medium",
    "assigneeId": 1,
    "dueDate": "2026-11-22"
  },
  {
    "id": 20,
    "title": "Lên lịch khảo sát mức độ hài lòng nhân viên",
    "status": "todo",
    "priority": "low",
    "assigneeId": 12,
    "dueDate": "2026-12-10"
  },
  {
    "id": 21,
    "title": "Sao lưu dữ liệu máy chủ nội bộ",
    "status": "done",
    "priority": "high",
    "assigneeId": 11,
    "dueDate": "2026-11-04"
  },
  {
    "id": 22,
    "title": "Đàm phán gia hạn hợp đồng với đối tác",
    "status": "doing",
    "priority": "high",
    "assigneeId": 3,
    "dueDate": "2026-11-16"
  },
  {
    "id": 23,
    "title": "Viết kiểm thử cho giỏ hàng",
    "status": "todo",
    "priority": "medium",
    "assigneeId": 5,
    "dueDate": "2026-11-19"
  },
  {
    "id": 24,
    "title": "Kiểm kê tài sản cố định",
    "status": "todo",
    "priority": "low",
    "assigneeId": 9,
    "dueDate": "2026-12-15"
  },
  {
    "id": 25,
    "title": "Cập nhật nội quy công ty",
    "status": "done",
    "priority": "low",
    "assigneeId": 8,
    "dueDate": "2026-10-29"
  },
  {
    "id": 26,
    "title": "Triển khai bản vá bảo mật",
    "status": "doing",
    "priority": "high",
    "assigneeId": 7,
    "dueDate": "2026-11-07"
  },
  {
    "id": 27,
    "title": "Phân tích doanh số theo khu vực",
    "status": "todo",
    "priority": "medium",
    "assigneeId": 6,
    "dueDate": "2026-11-24"
  },
  {
    "id": 28,
    "title": "Đào tạo sử dụng phần mềm kế toán mới",
    "status": "done",
    "priority": "medium",
    "assigneeId": 4,
    "dueDate": "2026-10-31"
  },
  {
    "id": 29,
    "title": "Dọn dẹp nhánh mã nguồn cũ",
    "status": "todo",
    "priority": "low",
    "assigneeId": 11,
    "dueDate": "2026-12-02"
  },
  {
    "id": 30,
    "title": "Tuyển dụng hai lập trình viên backend",
    "status": "doing",
    "priority": "medium",
    "assigneeId": 2,
    "dueDate": "2026-11-30"
  }
];

export default tasks;
