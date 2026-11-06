import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Cấu hình dùng chung: Vite chạy ứng dụng, Vitest + jsdom chạy test giao diện.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.{js,jsx}"],
  },
});
