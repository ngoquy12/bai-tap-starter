const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    // Mọi test dùng chung một cơ sở dữ liệu thử nên chạy lần lượt từng tệp.
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});
