import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../src/App.jsx";

// React chỉ báo mỗi loại cảnh báo (ví dụ thiếu key) một lần trong mỗi tệp test,
// nên cảnh báo được kiểm ở tệp riêng này và chỉ render App một lần.
describe("Cảnh báo của React", () => {
  it("hiển thị trang danh bạ không phát sinh console.error nào (kể cả thiếu key)", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<App />);
    const messages = spy.mock.calls.map((args) => args.map(String).join(" "));
    spy.mockRestore();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(12);
    expect(messages).toEqual([]);
  });
});
