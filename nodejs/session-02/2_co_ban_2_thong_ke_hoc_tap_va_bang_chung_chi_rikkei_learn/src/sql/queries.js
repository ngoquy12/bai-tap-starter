// ===== BÀI LÀM: truy vấn báo cáo và câu lệnh ghi cho Rikkei Learn =====
// Mỗi giá trị là một chuỗi SQL; tên cột sau AS chính là tên khóa JSON của API sau này.
// Dấu ? là tham số: người gọi truyền mảng giá trị theo đúng thứ tự xuất hiện.
// Điền chuỗi SQL vào từng khóa; giữ nguyên tên khóa, tên cột (bí danh) và thứ tự tham số theo đề bài.

const queries = {
  // ----- Phần B: truy vấn báo cáo -----

  // TODO: khóa đã xuất bản kèm số bài học (kể cả khóa chưa có bài học).
  courseLessonCounts: "",

  // TODO: số học viên đang học (active) của mỗi khóa.
  activeStudentsPerCourse: "",

  // TODO: tiến độ trung bình của mỗi khóa, không tính ghi danh dropped.
  averageProgressPerCourse: "",

  // TODO: học viên chưa ghi danh khóa nào.
  studentsWithoutEnrollment: "",

  // TODO: khóa học chưa có ghi danh nào.
  unenrolledCourses: "",

  // TODO: ba học viên hoàn thành nhiều khóa nhất.
  topCompletedStudents: "",

  // TODO: số ghi danh hoàn thành theo level, chỉ giữ level có từ 2 ghi danh trở lên.
  completionsByLevel: "",

  // TODO: danh sách ghi danh của một học viên. Tham số: [userId].
  studentEnrollments: "",

  // ----- Phần C: câu lệnh ghi -----

  // TODO: tăng tiến độ của ghi danh đang học. Tham số: [newProgress, enrollmentId, newProgress].
  updateProgress: "",

  // TODO: xóa ghi danh dropped có tiến độ dưới ngưỡng. Tham số: [maxProgress].
  deleteDroppedEnrollments: "",

  // TODO: cấp chứng chỉ cho ghi danh completed chưa có chứng chỉ. Tham số: [codePrefix].
  issueCertificates: "",
};

module.exports = queries;
