-- Rikkei Learn: dữ liệu mẫu. Mật khẩu mọi tài khoản: Matkhau123
INSERT INTO users (id, email, password_hash, full_name, role, created_at) VALUES
  (1, 'admin@rikkei.edu', '$2a$10$yQPgiPL0o6iJZMeG8hF6s.bIuT6CLDferySLAvYC9qY0GTHn5tHjy', 'Quản trị Rikkei Learn', 'admin', '2026-07-01 08:00:00'),
  (2, 'an@rikkei.edu', '$2a$10$yQPgiPL0o6iJZMeG8hF6s.bIuT6CLDferySLAvYC9qY0GTHn5tHjy', 'Nguyễn Văn An', 'student', '2026-07-02 08:00:00'),
  (3, 'binh@rikkei.edu', '$2a$10$yQPgiPL0o6iJZMeG8hF6s.bIuT6CLDferySLAvYC9qY0GTHn5tHjy', 'Trần Thị Bình', 'student', '2026-07-03 08:00:00'),
  (4, 'chi@rikkei.edu', '$2a$10$yQPgiPL0o6iJZMeG8hF6s.bIuT6CLDferySLAvYC9qY0GTHn5tHjy', 'Lê Minh Chi', 'student', '2026-07-04 08:00:00'),
  (5, 'dung@rikkei.edu', '$2a$10$yQPgiPL0o6iJZMeG8hF6s.bIuT6CLDferySLAvYC9qY0GTHn5tHjy', 'Phạm Quốc Dũng', 'student', '2026-07-05 08:00:00'),
  (6, 'giang@rikkei.edu', '$2a$10$yQPgiPL0o6iJZMeG8hF6s.bIuT6CLDferySLAvYC9qY0GTHn5tHjy', 'Hoàng Thu Giang', 'student', '2026-07-06 08:00:00');

INSERT INTO courses (id, title, description, level, created_at) VALUES
  (1, 'HTML và CSS cơ bản', 'Dựng trang web tĩnh từ đầu.', 'beginner', '2026-08-01 09:00:00'),
  (2, 'JavaScript cơ bản', 'Biến, hàm, mảng, đối tượng.', 'beginner', '2026-08-02 09:00:00'),
  (3, 'JavaScript nâng cao', 'Bất đồng bộ và gọi API.', 'intermediate', '2026-08-03 09:00:00'),
  (4, 'ReactJS', 'Xây giao diện bằng component.', 'intermediate', '2026-08-04 09:00:00'),
  (5, 'NodeJS và Express', 'Viết API với Express và MySQL.', 'intermediate', '2026-08-05 09:00:00'),
  (6, 'Cơ sở dữ liệu MySQL', 'Thiết kế bảng và truy vấn SQL.', 'beginner', '2026-08-06 09:00:00');

INSERT INTO lessons (id, course_id, title, position) VALUES
  (1, 1, 'Thẻ và cấu trúc trang', 1),
  (2, 1, 'CSS và bố cục', 2),
  (3, 2, 'Biến và kiểu dữ liệu', 1),
  (4, 2, 'Hàm và mảng', 2),
  (5, 2, 'Đối tượng', 3),
  (6, 3, 'Promise và async await', 1),
  (7, 3, 'Fetch và axios', 2),
  (8, 4, 'Component và JSX', 1),
  (9, 4, 'Hooks', 2),
  (10, 4, 'React Router', 3),
  (11, 4, 'Gọi API', 4),
  (12, 5, 'Express cơ bản', 1),
  (13, 5, 'MySQL với mysql2', 2),
  (14, 6, 'Bảng và khóa', 1),
  (15, 6, 'Truy vấn SELECT', 2);

INSERT INTO enrollments (id, user_id, course_id, status, progress, enrolled_at) VALUES
  (1, 2, 1, 'completed', 100, '2026-08-10 09:00:00'),
  (2, 2, 2, 'completed', 100, '2026-08-11 09:00:00'),
  (3, 2, 4, 'active', 60, '2026-08-20 09:00:00'),
  (4, 3, 2, 'completed', 100, '2026-08-12 09:00:00'),
  (5, 3, 3, 'active', 40, '2026-08-21 09:00:00'),
  (6, 4, 2, 'active', 75, '2026-08-13 09:00:00'),
  (7, 4, 4, 'dropped', 10, '2026-08-22 09:00:00'),
  (8, 5, 5, 'active', 25, '2026-08-23 09:00:00'),
  (9, 5, 6, 'completed', 100, '2026-08-14 09:00:00'),
  (10, 6, 6, 'active', 50, '2026-08-15 09:00:00');
