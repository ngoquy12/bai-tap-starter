import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import App from "../src/App.jsx";
import TodoForm from "../src/components/TodoForm.jsx";
import TodoItem from "../src/components/TodoItem.jsx";
import TodoFilter from "../src/components/TodoFilter.jsx";
import TodoList from "../src/components/TodoList.jsx";

const T1 = "Học JSX và component";
const T2 = "Làm bài tập props và state";
const T3 = "Đọc tài liệu về useEffect";
const T4 = "Nộp bài tập Session 01";
const T5 = "Chuẩn bị câu hỏi cho buổi sau";

// Nội dung các việc đang hiện, theo thứ tự trên màn hình (lấy từ nhãn của ô tick).
function shownTitles() {
  return screen.queryAllByRole("checkbox").map((box) => box.labels[0].textContent.trim());
}

function checkbox(title) {
  return screen.getByRole("checkbox", { name: title });
}

describe("TodoForm", () => {
  test("hiện ô nhập `Việc cần làm` đang trống và nút `Thêm`", () => {
    render(<TodoForm onAdd={vi.fn()} />);
    expect(screen.getByPlaceholderText("Việc cần làm")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Thêm" })).toBeInTheDocument();
  });

  test("bấm `Thêm` gọi onAdd một lần với nội dung đã cắt khoảng trắng rồi xóa ô", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoForm onAdd={onAdd} />);
    await user.type(screen.getByPlaceholderText("Việc cần làm"), "  Viết báo cáo tuần  ");
    await user.click(screen.getByRole("button", { name: "Thêm" }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith("Viết báo cáo tuần");
    expect(screen.getByPlaceholderText("Việc cần làm")).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("nhấn Enter trong ô cũng thêm việc", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoForm onAdd={onAdd} />);
    await user.type(screen.getByPlaceholderText("Việc cần làm"), "Học Redux{enter}");
    expect(onAdd).toHaveBeenCalledWith("Học Redux");
  });

  test("ô trống hoặc toàn dấu cách thì hiện lỗi trong role alert và không gọi onAdd", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoForm onAdd={onAdd} />);
    await user.click(screen.getByRole("button", { name: "Thêm" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng nhập nội dung việc cần làm.");
    expect(screen.getByRole("alert")).toHaveClass("alert-danger");
    await user.type(screen.getByPlaceholderText("Việc cần làm"), "     ");
    await user.click(screen.getByRole("button", { name: "Thêm" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng nhập nội dung việc cần làm.");
    expect(onAdd).not.toHaveBeenCalled();
  });

  test("onAdd trả về chuỗi lỗi thì hiện chuỗi đó trong role alert và giữ nguyên nội dung ô", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn(() => "Việc này đã có trong danh sách.");
    render(<TodoForm onAdd={onAdd} />);
    await user.type(screen.getByPlaceholderText("Việc cần làm"), "Học React");
    await user.click(screen.getByRole("button", { name: "Thêm" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Việc này đã có trong danh sách.");
    expect(screen.getByPlaceholderText("Việc cần làm")).toHaveValue("Học React");
  });
});

describe("TodoItem", () => {
  const todo = { id: 7, title: "Đọc sách", completed: false };

  function renderItem(overrides = {}) {
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    const result = render(
      <ul>
        <TodoItem todo={{ ...todo, ...overrides }} onToggle={onToggle} onDelete={onDelete} />
      </ul>
    );
    return { onToggle, onDelete, ...result };
  }

  test("hiện nội dung việc, ô tick chưa chọn và nút `Xóa Đọc sách`, không có cảnh báo thuộc tính DOM", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderItem();
    expect(screen.getByText("Đọc sách")).toBeInTheDocument();
    expect(checkbox("Đọc sách")).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Xóa Đọc sách" })).toBeInTheDocument();
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  test("việc đã hoàn thành có ô tick được chọn và chữ gạch ngang, việc chưa xong thì không", () => {
    const first = renderItem({ completed: true });
    expect(checkbox("Đọc sách")).toBeChecked();
    expect(screen.getByText("Đọc sách")).toHaveClass("text-decoration-line-through");
    first.unmount();
    renderItem({ completed: false });
    expect(screen.getByText("Đọc sách")).not.toHaveClass("text-decoration-line-through");
  });

  test("tick ô gọi onToggle với id của việc", async () => {
    const user = userEvent.setup();
    const { onToggle, onDelete } = renderItem();
    await user.click(checkbox("Đọc sách"));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(7);
    expect(onDelete).not.toHaveBeenCalled();
  });

  test("bấm nút Xóa gọi onDelete với id của việc", async () => {
    const user = userEvent.setup();
    const { onToggle, onDelete } = renderItem();
    await user.click(screen.getByRole("button", { name: "Xóa Đọc sách" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(7);
    expect(onToggle).not.toHaveBeenCalled();
  });
});

describe("TodoFilter", () => {
  test("hiện ba nút và chỉ nút đang chọn có aria-pressed là true", () => {
    render(<TodoFilter value="active" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Tất cả" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Đang làm" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Đang làm" })).toHaveClass("active");
    expect(screen.getByRole("button", { name: "Hoàn thành" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Hoàn thành" })).not.toHaveClass("active");
  });

  test("bấm từng nút gọi onChange với all, active, completed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TodoFilter value="all" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Đang làm" }));
    await user.click(screen.getByRole("button", { name: "Hoàn thành" }));
    await user.click(screen.getByRole("button", { name: "Tất cả" }));
    expect(onChange.mock.calls.map((call) => call[0])).toEqual(["active", "completed", "all"]);
  });
});

describe("TodoList", () => {
  test("mỗi việc một dòng đúng thứ tự, không cảnh báo key và gọi đúng id khi thao tác", async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    const items = [
      { id: 4, title: "Việc D", completed: false },
      { id: 2, title: "Việc B", completed: true },
      { id: 9, title: "Việc C", completed: false },
    ];
    render(<TodoList todos={items} onToggle={onToggle} onDelete={onDelete} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(shownTitles()).toEqual(["Việc D", "Việc B", "Việc C"]);
    await user.click(checkbox("Việc B"));
    await user.click(screen.getByRole("button", { name: "Xóa Việc C" }));
    expect(onToggle).toHaveBeenCalledWith(2);
    expect(onDelete).toHaveBeenCalledWith(9);
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

describe("App: thêm việc", () => {
  test("lúc đầu hiện h1 `Todo list`, 5 việc theo thứ tự dữ liệu và `Còn 3 việc chưa xong`", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Todo list" })).toBeInTheDocument();
    expect(shownTitles()).toEqual([T1, T2, T3, T4, T5]);
    expect(checkbox(T1)).toBeChecked();
    expect(checkbox(T2)).not.toBeChecked();
    expect(checkbox(T5)).toBeChecked();
    expect(screen.getByText("Còn 3 việc chưa xong")).toBeInTheDocument();
  });

  test("thêm việc mới nằm cuối danh sách, ô được xóa và số việc chưa xong tăng", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByPlaceholderText("Việc cần làm"), "  Viết báo cáo tuần ");
    await user.click(screen.getByRole("button", { name: "Thêm" }));
    expect(shownTitles()).toEqual([T1, T2, T3, T4, T5, "Viết báo cáo tuần"]);
    expect(checkbox("Viết báo cáo tuần")).not.toBeChecked();
    expect(screen.getByPlaceholderText("Việc cần làm")).toHaveValue("");
    expect(screen.getByText("Còn 4 việc chưa xong")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("việc trùng nội dung (không phân biệt hoa thường) bị từ chối, giữ nguyên ô nhập", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByPlaceholderText("Việc cần làm"), " học jsx VÀ component ");
    await user.click(screen.getByRole("button", { name: "Thêm" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Việc này đã có trong danh sách.");
    expect(screen.getAllByRole("checkbox")).toHaveLength(5);
    expect(screen.getByPlaceholderText("Việc cần làm")).toHaveValue(" học jsx VÀ component ");
  });

  test("thêm việc sau khi đã xóa bớt vẫn có id riêng: tick việc mới không đụng việc khác", async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<App />);
    await user.click(screen.getByRole("button", { name: `Xóa ${T1}` }));
    await user.type(screen.getByPlaceholderText("Việc cần làm"), "Việc mới");
    await user.click(screen.getByRole("button", { name: "Thêm" }));
    await user.click(checkbox("Việc mới"));
    expect(checkbox("Việc mới")).toBeChecked();
    expect(checkbox(T5)).toBeChecked();
    expect(checkbox(T2)).not.toBeChecked();
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

describe("App: đánh dấu hoàn thành", () => {
  test("tick một việc thì gạch ngang và giảm số việc chưa xong, tick lần nữa thì trở lại", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText(T2)).not.toHaveClass("text-decoration-line-through");
    await user.click(checkbox(T2));
    expect(checkbox(T2)).toBeChecked();
    expect(screen.getByText(T2)).toHaveClass("text-decoration-line-through");
    expect(screen.getByText("Còn 2 việc chưa xong")).toBeInTheDocument();
    await user.click(checkbox(T2));
    expect(checkbox(T2)).not.toBeChecked();
    expect(screen.getByText(T2)).not.toHaveClass("text-decoration-line-through");
    expect(screen.getByText("Còn 3 việc chưa xong")).toBeInTheDocument();
  });

  test("đánh dấu không làm đổi dữ liệu gốc: dựng lại ứng dụng vẫn là `Còn 3 việc chưa xong`", async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(checkbox(T2));
    await user.click(checkbox(T1));
    first.unmount();
    render(<App />);
    expect(screen.getByText("Còn 3 việc chưa xong")).toBeInTheDocument();
    expect(checkbox(T1)).toBeChecked();
    expect(checkbox(T2)).not.toBeChecked();
  });
});

describe("App: xóa việc", () => {
  test("nút `Xóa <nội dung>` bỏ đúng việc đó", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: `Xóa ${T3}` }));
    expect(shownTitles()).toEqual([T1, T2, T4, T5]);
    expect(screen.getByText("Còn 2 việc chưa xong")).toBeInTheDocument();
  });

  test("`Xóa việc đã xong` bỏ mọi việc đã xong rồi tự vô hiệu", async () => {
    const user = userEvent.setup();
    render(<App />);
    const clearButton = screen.getByRole("button", { name: "Xóa việc đã xong" });
    expect(clearButton).toBeEnabled();
    await user.click(clearButton);
    expect(shownTitles()).toEqual([T2, T3, T4]);
    expect(screen.getByText("Còn 3 việc chưa xong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa việc đã xong" })).toBeDisabled();
  });
});

describe("App: lọc", () => {
  test("`Đang làm` chỉ hiện việc chưa xong, `Hoàn thành` chỉ hiện việc đã xong, `Tất cả` hiện đủ", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("button", { name: "Tất cả" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Đang làm" }));
    expect(shownTitles()).toEqual([T2, T3, T4]);
    expect(screen.getByRole("button", { name: "Đang làm" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Tất cả" })).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("button", { name: "Hoàn thành" }));
    expect(shownTitles()).toEqual([T1, T5]);
    expect(screen.getByText("Còn 3 việc chưa xong")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tất cả" }));
    expect(shownTitles()).toEqual([T1, T2, T3, T4, T5]);
  });

  test("đang lọc `Đang làm`, tick một việc thì việc đó biến mất khỏi danh sách", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Đang làm" }));
    await user.click(checkbox(T3));
    expect(shownTitles()).toEqual([T2, T4]);
    expect(screen.getByText("Còn 2 việc chưa xong")).toBeInTheDocument();
  });

  test("mục lọc không có việc nào thì hiện `Không có việc nào trong mục này.`", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.queryByText("Không có việc nào trong mục này.")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Xóa việc đã xong" }));
    await user.click(screen.getByRole("button", { name: "Hoàn thành" }));
    expect(screen.getByText("Không có việc nào trong mục này.")).toBeInTheDocument();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });
});

describe("App: tóm tắt", () => {
  test("tất cả việc đã xong thì hiện `Tất cả việc đã xong`", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(checkbox(T2));
    await user.click(checkbox(T3));
    expect(screen.getByText("Còn 1 việc chưa xong")).toBeInTheDocument();
    await user.click(checkbox(T4));
    expect(screen.getByText("Tất cả việc đã xong")).toBeInTheDocument();
    expect(screen.queryByText(/Còn \d+ việc chưa xong/)).not.toBeInTheDocument();
  });

  test("danh sách rỗng hiện `Chưa có việc nào.` và nút `Xóa việc đã xong` vô hiệu", () => {
    render(<App initialTodos={[]} />);
    expect(screen.getByText("Chưa có việc nào.")).toBeInTheDocument();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(screen.queryByText("Không có việc nào trong mục này.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa việc đã xong" })).toBeDisabled();
  });
});
