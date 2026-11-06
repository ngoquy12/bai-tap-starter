import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App.jsx";
import FocusTimer from "../src/components/FocusTimer.jsx";
import SearchBox from "../src/components/SearchBox.jsx";

const KEY = "rikkei-todos";

// Mỗi test bắt đầu với localStorage sạch, tiêu đề tab đã biết và đồng hồ giả
// (thời gian chỉ trôi khi test gọi advance; tệp setup tự trả đồng hồ thật sau mỗi test).
beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  document.title = "Rikkei React";
});

afterEach(() => {
  vi.restoreAllMocks();
});

function advance(ms) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function typeInto(input, text) {
  fireEvent.change(input, { target: { value: text } });
}

function addTodo(text) {
  typeInto(screen.getByPlaceholderText("Việc cần làm"), text);
  fireEvent.click(screen.getByRole("button", { name: "Thêm" }));
}

function stored() {
  return JSON.parse(localStorage.getItem(KEY));
}

function search(text) {
  typeInto(screen.getByPlaceholderText("Tìm việc"), text);
  advance(400);
}

const saved = [
  { id: 7, title: "Việc đã lưu số bảy", completed: false },
  { id: 9, title: "Việc đã lưu số chín", completed: true },
];

describe("Lưu danh sách vào localStorage", () => {
  it("chưa có dữ liệu thì hiện 5 việc mẫu và ghi danh sách vào khóa rikkei-todos", () => {
    render(<App />);
    expect(screen.getByText("Học JSX và component")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(5);
    expect(stored()).toHaveLength(5);
    expect(stored()[1]).toEqual({ id: 2, title: "Làm bài tập props và state", completed: false });
  });

  it("có danh sách đã lưu thì hiện danh sách đó thay cho dữ liệu mẫu", () => {
    localStorage.setItem(KEY, JSON.stringify(saved));
    render(<App />);
    expect(screen.getByText("Việc đã lưu số bảy")).toBeInTheDocument();
    expect(screen.getByText("Việc đã lưu số chín")).toBeInTheDocument();
    expect(screen.queryByText("Học JSX và component")).toBeNull();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("dữ liệu đã lưu không dùng được (JSON hỏng hoặc không phải mảng) thì quay về dữ liệu mẫu", () => {
    localStorage.setItem(KEY, "{khong phai json");
    const first = render(<App />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(5);
    expect(stored()).toHaveLength(5);
    first.unmount();

    localStorage.setItem(KEY, JSON.stringify({ todos: [] }));
    render(<App />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(5);
    expect(Array.isArray(stored())).toBe(true);
  });

  it("danh sách đã lưu là mảng rỗng thì hiện Chưa có việc nào., không thay bằng dữ liệu mẫu", () => {
    localStorage.setItem(KEY, "[]");
    render(<App />);
    expect(screen.getByText("Chưa có việc nào.")).toBeInTheDocument();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(stored()).toEqual([]);
  });

  it("thêm việc mới thì localStorage có việc đó với id lớn nhất cộng 1", () => {
    localStorage.setItem(KEY, JSON.stringify(saved));
    render(<App />);
    addTodo("Việc mới thêm");
    expect(stored()).toHaveLength(3);
    expect(stored()[2]).toEqual({ id: 10, title: "Việc mới thêm", completed: false });
  });

  it("đánh dấu và xóa việc đều được ghi lại vào localStorage", () => {
    localStorage.setItem(KEY, JSON.stringify(saved));
    render(<App />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Việc đã lưu số bảy" }));
    expect(stored()[0].completed).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Xóa Việc đã lưu số chín" }));
    expect(stored()).toEqual([{ id: 7, title: "Việc đã lưu số bảy", completed: true }]);
  });

  it("gỡ ứng dụng rồi dựng lại (như tải lại trang) vẫn thấy các thay đổi", () => {
    const first = render(<App />);
    addTodo("Việc giữ lại sau khi tải lại");
    fireEvent.click(screen.getByRole("checkbox", { name: "Đọc tài liệu về useEffect" }));
    fireEvent.click(screen.getByRole("button", { name: "Xóa Học JSX và component" }));
    first.unmount();

    render(<App />);
    expect(screen.getByText("Việc giữ lại sau khi tải lại")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Đọc tài liệu về useEffect" })).toBeChecked();
    expect(screen.queryByText("Học JSX và component")).toBeNull();
    expect(screen.getAllByRole("checkbox")).toHaveLength(5);
  });

  it("chỉ đọc localStorage một lần dù component render lại nhiều lần", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    render(<App />);
    addTodo("Việc một");
    addTodo("Việc hai");
    fireEvent.click(screen.getByRole("checkbox", { name: "Việc một" }));
    const reads = getItem.mock.calls.filter((call) => call[0] === KEY);
    expect(reads).toHaveLength(1);
  });
});

describe("Tiêu đề tab", () => {
  it("hiện Todo (3 còn lại) rồi đổi theo số việc chưa xong khi thêm, đánh dấu, xóa", () => {
    render(<App />);
    expect(document.title).toBe("Todo (3 còn lại)");
    addTodo("Việc thứ sáu");
    expect(document.title).toBe("Todo (4 còn lại)");
    fireEvent.click(screen.getByRole("checkbox", { name: "Việc thứ sáu" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Đọc tài liệu về useEffect" }));
    expect(document.title).toBe("Todo (2 còn lại)");
    fireEvent.click(screen.getByRole("button", { name: "Xóa Nộp bài tập Session 01" }));
    expect(document.title).toBe("Todo (1 còn lại)");
    fireEvent.click(screen.getByRole("checkbox", { name: "Làm bài tập props và state" }));
    expect(document.title).toBe("Todo (0 còn lại)");
  });

  it("đếm trên toàn bộ danh sách, không đổi khi đang lọc hoặc tìm kiếm", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Hoàn thành" }));
    expect(document.title).toBe("Todo (3 còn lại)");
    search("jsx");
    expect(document.title).toBe("Todo (3 còn lại)");
  });

  it("gỡ ứng dụng thì trả lại tiêu đề cũ", () => {
    const { unmount } = render(<App />);
    expect(document.title).toBe("Todo (3 còn lại)");
    unmount();
    expect(document.title).toBe("Rikkei React");
  });
});

describe("SearchBox: tìm kiếm trễ", () => {
  it("chưa gõ thì không gọi onSearch, gõ rồi chỉ gọi khi đủ 400 ms", () => {
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} />);
    advance(2000);
    expect(onSearch).not.toHaveBeenCalled();

    typeInto(screen.getByPlaceholderText("Tìm việc"), "react");
    advance(399);
    expect(onSearch).not.toHaveBeenCalled();
    advance(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("react");
  });

  it("gõ liên tiếp chỉ gọi một lần với giá trị cuối", () => {
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} />);
    const input = screen.getByPlaceholderText("Tìm việc");
    typeInto(input, "r");
    advance(300);
    typeInto(input, "re");
    advance(300);
    typeInto(input, "rea");
    advance(399);
    expect(onSearch).not.toHaveBeenCalled();
    advance(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("rea");
    advance(2000);
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it("cắt khoảng trắng hai đầu; xóa hết chữ hoặc chỉ gõ dấu cách thì gọi với chuỗi rỗng", () => {
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} />);
    const input = screen.getByPlaceholderText("Tìm việc");
    typeInto(input, "   hook  ");
    advance(400);
    expect(onSearch).toHaveBeenLastCalledWith("hook");
    typeInto(input, "");
    advance(400);
    expect(onSearch).toHaveBeenLastCalledWith("");
    typeInto(input, "    ");
    advance(400);
    expect(onSearch).toHaveBeenLastCalledWith("");
    expect(onSearch).toHaveBeenCalledTimes(3);
  });

  it("tôn trọng prop delay tùy chỉnh", () => {
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} delay={1000} />);
    typeInto(screen.getByPlaceholderText("Tìm việc"), "abc");
    advance(999);
    expect(onSearch).not.toHaveBeenCalled();
    advance(1);
    expect(onSearch).toHaveBeenCalledWith("abc");
  });

  it("gỡ component khi đang chờ thì hủy lần gọi và không còn hẹn giờ nào", () => {
    const onSearch = vi.fn();
    const { unmount } = render(<SearchBox onSearch={onSearch} />);
    typeInto(screen.getByPlaceholderText("Tìm việc"), "abc");
    advance(200);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    advance(2000);
    expect(onSearch).not.toHaveBeenCalled();
  });
});

describe("FocusTimer: hẹn giờ tập trung", () => {
  it("hiện tiêu đề và 25:00, chưa bấm Bắt đầu thì không chạy; bấm rồi đếm lùi mỗi giây", () => {
    render(<FocusTimer />);
    expect(screen.getByRole("heading", { name: "Hẹn giờ tập trung" })).toBeInTheDocument();
    expect(screen.getByText("25:00")).toBeInTheDocument();
    advance(5000);
    expect(screen.getByText("25:00")).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    advance(999);
    expect(screen.getByText("25:00")).toBeInTheDocument();
    advance(1);
    expect(screen.getByText("24:59")).toBeInTheDocument();
    advance(60000);
    expect(screen.getByText("23:59")).toBeInTheDocument();
  });

  it("Tạm dừng giữ nguyên thời gian và xóa bộ đếm, Bắt đầu đếm tiếp từ chỗ đã dừng", () => {
    render(<FocusTimer />);
    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    advance(3000);
    fireEvent.click(screen.getByRole("button", { name: "Tạm dừng" }));
    advance(5000);
    expect(screen.getByText("24:57")).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    advance(2000);
    expect(screen.getByText("24:55")).toBeInTheDocument();
  });

  it("bấm Bắt đầu hai lần vẫn chỉ một bộ đếm, mỗi giây giảm đúng 1", () => {
    render(<FocusTimer />);
    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    expect(vi.getTimerCount()).toBe(1);
    advance(3000);
    expect(screen.getByText("24:57")).toBeInTheDocument();
  });

  it("về 00:00 thì dừng, hiện Đã hết giờ tập trung. và không còn bộ đếm", () => {
    render(<FocusTimer initialSeconds={3} />);
    expect(screen.getByText("00:03")).toBeInTheDocument();
    expect(screen.queryByText("Đã hết giờ tập trung.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    advance(3000);
    expect(screen.getByText("00:00")).toBeInTheDocument();
    expect(screen.getByText("Đã hết giờ tập trung.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveClass("alert-warning");
    expect(vi.getTimerCount()).toBe(0);
    advance(5000);
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("Đặt lại về giá trị đầu và dừng đếm", () => {
    render(<FocusTimer initialSeconds={65} />);
    expect(screen.getByText("01:05")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    advance(5000);
    expect(screen.getByText("01:00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Đặt lại" }));
    expect(screen.getByText("01:05")).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    advance(5000);
    expect(screen.getByText("01:05")).toBeInTheDocument();
  });

  it("bọc StrictMode vẫn đúng một bộ đếm, giảm 1 giây mỗi giây, gỡ component thì hết bộ đếm", () => {
    const { unmount } = render(
      <StrictMode>
        <FocusTimer />
      </StrictMode>
    );
    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    expect(vi.getTimerCount()).toBe(1);
    advance(3000);
    expect(screen.getByText("24:57")).toBeInTheDocument();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("Ghép vào App", () => {
  it("danh sách chỉ lọc theo từ khóa sau 400 ms và không phân biệt hoa thường", () => {
    render(<App />);
    typeInto(screen.getByPlaceholderText("Tìm việc"), "  USEEFFECT ");
    advance(399);
    expect(screen.getAllByRole("checkbox")).toHaveLength(5);
    advance(1);
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(screen.getByText("Đọc tài liệu về useEffect")).toBeInTheDocument();
    search("");
    expect(screen.getAllByRole("checkbox")).toHaveLength(5);
  });

  it("từ khóa kết hợp với bộ lọc trạng thái; không khớp thì báo, tóm tắt vẫn tính toàn bộ", () => {
    render(<App />);
    search("bài tập");
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Hoàn thành" }));
    expect(screen.getByRole("button", { name: "Hoàn thành" })).toHaveClass("active");
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(screen.getByText("Không tìm thấy việc nào khớp từ khóa.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Đang làm" }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getByText("Còn 3 việc chưa xong")).toBeInTheDocument();
    search("");
    fireEvent.click(screen.getByRole("button", { name: "Hoàn thành" }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("App có phần Hẹn giờ tập trung bắt đầu từ 25:00 và chạy được", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Hẹn giờ tập trung" })).toBeInTheDocument();
    expect(screen.getByText("25:00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    advance(2000);
    expect(screen.getByText("24:58")).toBeInTheDocument();
  });

  it("các chức năng của Bài 2 vẫn đúng: thêm, báo trùng, báo rỗng, xóa việc đã xong", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Todo list" })).toBeInTheDocument();
    expect(screen.getByText("Còn 3 việc chưa xong")).toBeInTheDocument();
    addTodo("   ");
    expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng nhập nội dung việc cần làm.");
    expect(screen.getByRole("alert")).toHaveClass("alert-danger");
    addTodo("học jsx và COMPONENT");
    expect(screen.getByRole("alert")).toHaveTextContent("Việc này đã có trong danh sách.");
    addTodo("Việc cuối danh sách");
    expect(screen.getByText("Còn 4 việc chưa xong")).toBeInTheDocument();
    expect(screen.getByText("Học JSX và component")).toHaveClass("text-decoration-line-through");
    expect(screen.getByText("Việc cuối danh sách")).not.toHaveClass("text-decoration-line-through");
    fireEvent.click(screen.getByRole("button", { name: "Xóa việc đã xong" }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(4);
  });
});
