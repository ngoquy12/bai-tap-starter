-- Rikkei Learn: lược đồ MySQL 8 (InnoDB, utf8mb4). Không chứa CREATE DATABASE hay USE.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE courses (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  description VARCHAR(500) NOT NULL DEFAULT '',
  level ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE lessons (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  title VARCHAR(120) NOT NULL,
  position INT UNSIGNED NOT NULL,
  CONSTRAINT fk_lessons_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT uq_lessons_position UNIQUE (course_id, position)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE enrollments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  course_id INT UNSIGNED NOT NULL,
  status ENUM('active', 'completed', 'dropped') NOT NULL DEFAULT 'active',
  progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
  enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_enroll_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_enroll_course FOREIGN KEY (course_id) REFERENCES courses (id),
  CONSTRAINT uq_enroll UNIQUE (user_id, course_id),
  CONSTRAINT chk_enroll_progress CHECK (progress <= 100)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
