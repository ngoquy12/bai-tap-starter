import "@testing-library/jest-dom/vitest";
import "./expose-axios.js";
import "./mock-api.js";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Cảnh báo "Future Flag" của React Router 6 chỉ nói về nâng cấp lên v7, không liên quan đến bài làm.
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("React Router Future Flag Warning")) return;
  originalWarn(...args);
};

// Mỗi test bắt đầu với API giả sạch: luật (fail, delay, respond) và nhật ký (calls) được xóa.
beforeEach(() => window.mockApi.reset());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
