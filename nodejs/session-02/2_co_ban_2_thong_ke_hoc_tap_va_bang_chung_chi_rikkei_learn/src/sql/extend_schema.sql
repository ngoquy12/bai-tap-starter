-- ===== BÀI LÀM: bảng certificates và cột is_published của bảng courses =====
-- Chạy sau db/schema.sql và db/seed.sql. Ví dụ: mysql -u root -p rikkei_learn < src/sql/extend_schema.sql

-- Mã nền (có sẵn): xóa bảng cũ để chạy lại tệp này bao nhiêu lần cũng được.
DROP TABLE IF EXISTS certificates;

-- TODO: CREATE TABLE certificates (id, enrollment_id, code, issued_at) với khóa ngoại và ràng buộc duy nhất.

-- TODO: ALTER TABLE courses thêm cột is_published.

-- TODO: CREATE INDEX idx_courses_is_published trên courses (is_published).
