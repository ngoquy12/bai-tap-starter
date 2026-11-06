// Chạy trước mỗi tệp test: đặt biến môi trường để mã nguồn trỏ vào cơ sở dữ liệu THỬ.
require("dotenv").config();

process.env.NODE_ENV = "test";
process.env.DB_NAME = process.env.DB_NAME_TEST || "rikkei_learn_test";
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || "4";
process.env.JWT_SECRET = process.env.JWT_SECRET || "khoa-bi-mat-cho-test";
process.env.API_KEY = process.env.API_KEY || "rikkei-api-key";
