require("dotenv").config();

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "rikkei_shop",
  },
  jwtSecret: process.env.JWT_SECRET || "doi-chuoi-bi-mat-nay",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  apiKey: process.env.API_KEY || "rikkei-api-key",
};

module.exports = config;
