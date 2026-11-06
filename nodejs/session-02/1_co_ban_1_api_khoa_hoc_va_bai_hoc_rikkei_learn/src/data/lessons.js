// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Kho bài học tạm trong bộ nhớ, cùng nội dung với bảng lessons của Rikkei Learn.
// Mỗi bài học thuộc một khóa học qua courseId; position là thứ tự bài trong khóa (bắt đầu từ 1).
const lessons = [
  { id: 1, courseId: 1, title: "Thẻ và cấu trúc trang", position: 1 },
  { id: 2, courseId: 1, title: "CSS và bố cục", position: 2 },
  { id: 3, courseId: 2, title: "Biến và kiểu dữ liệu", position: 1 },
  { id: 4, courseId: 2, title: "Hàm và mảng", position: 2 },
  { id: 5, courseId: 2, title: "Đối tượng", position: 3 },
  { id: 6, courseId: 3, title: "Promise và async await", position: 1 },
  { id: 7, courseId: 3, title: "Fetch và axios", position: 2 },
  { id: 8, courseId: 4, title: "Component và JSX", position: 1 },
  { id: 9, courseId: 4, title: "Hooks", position: 2 },
  { id: 10, courseId: 4, title: "React Router", position: 3 },
  { id: 11, courseId: 4, title: "Gọi API", position: 4 },
  { id: 12, courseId: 5, title: "Express cơ bản", position: 1 },
  { id: 13, courseId: 5, title: "MySQL với mysql2", position: 2 },
  { id: 14, courseId: 6, title: "Bảng và khóa", position: 1 },
  { id: 15, courseId: 6, title: "Truy vấn SELECT", position: 2 },
];

module.exports = lessons;
// ===== HẾT MÃ NỀN =====
