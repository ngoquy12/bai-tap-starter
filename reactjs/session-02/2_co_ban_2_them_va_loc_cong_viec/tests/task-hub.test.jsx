import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import TaskForm from "../src/components/TaskForm.jsx";
import TaskFilters from "../src/components/TaskFilters.jsx";
import seedTasks from "../src/data/tasks.js";
import employees from "../src/data/employees.js";
import { EMPTY_FILTERS } from "../src/config.js";

// ---------- Hàm hỗ trợ ----------

// Đóng băng danh sách: sửa trực tiếp state sẽ ném TypeError ngay trong test.
function frozenTasks(list = seedTasks) {
  return Object.freeze(list.map((task) => Object.freeze({ ...task })));
}

function makeTask(id, changes = {}) {
  return { id, title: `Việc số ${id}`, status: "todo", priority: "medium", assigneeId: 1, dueDate: "2026-11-20", ...changes };
}

// Cột của bảng theo tên ("Cần làm", "Đang làm", "Hoàn thành").
function column(name) {
  return screen.getByRole("heading", { level: 3, name: new RegExp(`^${name} \\(`) }).closest("section");
}

// Thẻ công việc theo tiêu đề (h4).
function card(title) {
  return screen.getByRole("heading", { level: 4, name: title }).closest("li");
}

// Chụp bảng: tên công việc -> tên cột đang chứa nó.
function boardSnapshot() {
  const result = {};
  screen.getAllByRole("heading", { level: 3 }).forEach((heading) => {
    const section = heading.closest("section");
    if (!section) return;
    within(section)
      .queryAllByRole("heading", { level: 4 })
      .forEach((item) => {
        result[item.textContent] = heading.textContent.split(" (")[0];
      });
  });
  return result;
}

// Điền và gửi form thêm công việc.
async function addTaskByForm(user, { title, priority, assignee, due }) {
  if (title !== undefined) await user.type(screen.getByLabelText("Tên công việc"), title);
  if (priority) await user.selectOptions(screen.getByLabelText("Độ ưu tiên"), priority);
  if (assignee) await user.selectOptions(screen.getByLabelText("Người nhận"), assignee);
  if (due) fireEvent.change(screen.getByLabelText("Hạn hoàn thành"), { target: { value: due } });
  await user.click(screen.getByRole("button", { name: "Thêm công việc" }));
}

// ---------- TaskForm ----------

describe("TaskForm", () => {
  test("hiện đủ ô nhập, nút và các lựa chọn mặc định", () => {
    render(<TaskForm employees={employees} onAdd={() => {}} />);
    expect(screen.getByLabelText("Tên công việc")).toHaveValue("");
    expect(screen.getByLabelText("Độ ưu tiên")).toHaveDisplayValue("Trung bình");
    expect(screen.getByLabelText("Người nhận")).toHaveDisplayValue("Chưa giao");
    expect(screen.getByLabelText("Hạn hoàn thành")).toHaveAttribute("type", "date");
    expect(screen.getByRole("button", { name: "Thêm công việc" })).toBeInTheDocument();
    const priorities = within(screen.getByLabelText("Độ ưu tiên")).getAllByRole("option");
    expect(priorities.map((option) => option.textContent)).toEqual(["Thấp", "Trung bình", "Cao"]);
    const people = within(screen.getByLabelText("Người nhận")).getAllByRole("option");
    expect(people).toHaveLength(12);
    expect(people[0]).toHaveTextContent("Chưa giao");
    expect(screen.getByRole("option", { name: "Hoàng Minh Đức" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Đỗ Mai Phương" })).not.toBeInTheDocument();
  });

  test("tên rỗng hoặc chỉ có dấu cách thì báo lỗi và không gọi onAdd", async () => {
    const user = userEvent.setup({ delay: null });
    const onAdd = vi.fn();
    render(<TaskForm employees={employees} onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText("Hạn hoàn thành"), { target: { value: "2026-11-20" } });
    await user.click(screen.getByRole("button", { name: "Thêm công việc" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng nhập tên công việc.");
    expect(screen.getByRole("alert")).toHaveClass("alert-danger");
    await user.type(screen.getByLabelText("Tên công việc"), "   ");
    await user.click(screen.getByRole("button", { name: "Thêm công việc" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng nhập tên công việc.");
    expect(onAdd).not.toHaveBeenCalled();
  });

  test("thiếu hạn hoàn thành thì báo lỗi, giữ nguyên tên đã nhập và không gọi onAdd", async () => {
    const user = userEvent.setup({ delay: null });
    const onAdd = vi.fn();
    render(<TaskForm employees={employees} onAdd={onAdd} />);
    await user.type(screen.getByLabelText("Tên công việc"), "Soạn hợp đồng");
    await user.click(screen.getByRole("button", { name: "Thêm công việc" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng chọn hạn hoàn thành.");
    expect(screen.getByLabelText("Tên công việc")).toHaveValue("Soạn hợp đồng");
    expect(onAdd).not.toHaveBeenCalled();
  });

  test("điền hợp lệ thì gọi onAdd một lần với tên đã cắt khoảng trắng và id người nhận là số", async () => {
    const user = userEvent.setup({ delay: null });
    const onAdd = vi.fn();
    render(<TaskForm employees={employees} onAdd={onAdd} />);
    await addTaskByForm(user, { title: "  Soạn hợp đồng  ", priority: "Cao", assignee: "Phạm Thu Dung", due: "2026-11-20" });
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith({ title: "Soạn hợp đồng", priority: "high", assigneeId: 4, dueDate: "2026-11-20" });
  });

  test("chọn Chưa giao thì assigneeId là null; gửi xong form về trạng thái ban đầu và lỗi cũ biến mất", async () => {
    const user = userEvent.setup({ delay: null });
    const onAdd = vi.fn();
    render(<TaskForm employees={employees} onAdd={onAdd} />);
    await user.click(screen.getByRole("button", { name: "Thêm công việc" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await addTaskByForm(user, { title: "Dọn kho", priority: "Thấp", due: "2026-12-01" });
    expect(onAdd).toHaveBeenCalledWith({ title: "Dọn kho", priority: "low", assigneeId: null, dueDate: "2026-12-01" });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Tên công việc")).toHaveValue("");
    expect(screen.getByLabelText("Độ ưu tiên")).toHaveDisplayValue("Trung bình");
    expect(screen.getByLabelText("Người nhận")).toHaveDisplayValue("Chưa giao");
    expect(screen.getByLabelText("Hạn hoàn thành")).toHaveValue("");
  });

  test("gửi form chặn hành vi mặc định của trình duyệt (không tải lại trang)", () => {
    render(<TaskForm employees={employees} onAdd={() => {}} />);
    const form = screen.getByRole("button", { name: "Thêm công việc" }).closest("form");
    const notPrevented = fireEvent.submit(form);
    expect(notPrevented).toBe(false);
  });
});

// ---------- TaskFilters ----------

describe("TaskFilters", () => {
  const current = { query: "abc", priority: "high", assignee: "3" };

  test("hiện giá trị lọc hiện tại lấy từ props và đủ lựa chọn theo đúng thứ tự", () => {
    render(<TaskFilters filters={current} employees={employees} onChange={() => {}} />);
    expect(screen.getByLabelText("Tìm công việc")).toHaveValue("abc");
    expect(screen.getByLabelText("Lọc độ ưu tiên")).toHaveDisplayValue("Cao");
    expect(screen.getByLabelText("Lọc người nhận")).toHaveDisplayValue("Lê Hoàng Cường");
    expect(screen.getByRole("button", { name: "Xóa bộ lọc" })).toBeInTheDocument();
    const priorities = within(screen.getByLabelText("Lọc độ ưu tiên")).getAllByRole("option");
    expect(priorities.map((option) => option.textContent)).toEqual(["Tất cả", "Thấp", "Trung bình", "Cao"]);
    const people = within(screen.getByLabelText("Lọc người nhận")).getAllByRole("option");
    expect(people).toHaveLength(14);
    expect(people[0]).toHaveTextContent("Tất cả");
    expect(people[1]).toHaveTextContent("Chưa giao");
    expect(people[2]).toHaveTextContent("Nguyễn Văn An");
  });

  test("gõ từ khóa gọi onChange với từ khóa mới và giữ nguyên các điều kiện khác", async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = vi.fn();
    render(<TaskFilters filters={{ query: "", priority: "high", assignee: "3" }} employees={employees} onChange={onChange} />);
    await user.type(screen.getByLabelText("Tìm công việc"), "a");
    expect(onChange).toHaveBeenCalledWith({ query: "a", priority: "high", assignee: "3" });
  });

  test("đổi độ ưu tiên hoặc người nhận gọi onChange với giá trị đúng", async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = vi.fn();
    render(<TaskFilters filters={EMPTY_FILTERS} employees={employees} onChange={onChange} />);
    await user.selectOptions(screen.getByLabelText("Lọc độ ưu tiên"), "Thấp");
    expect(onChange).toHaveBeenLastCalledWith({ query: "", priority: "low", assignee: "all" });
    await user.selectOptions(screen.getByLabelText("Lọc người nhận"), "Chưa giao");
    expect(onChange).toHaveBeenLastCalledWith({ query: "", priority: "all", assignee: "unassigned" });
    await user.selectOptions(screen.getByLabelText("Lọc người nhận"), "Đặng Quốc Huy");
    expect(onChange).toHaveBeenLastCalledWith({ query: "", priority: "all", assignee: "7" });
  });

  test("nút Xóa bộ lọc gọi onChange với bộ lọc rỗng", async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = vi.fn();
    render(<TaskFilters filters={current} employees={employees} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Xóa bộ lọc" }));
    expect(onChange).toHaveBeenCalledWith({ query: "", priority: "all", assignee: "all" });
  });
});

// ---------- App: thêm công việc ----------

describe("Thêm công việc", () => {
  test("công việc mới nằm ở cột Cần làm, số cột và tóm tắt tăng lên", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    expect(screen.getByText("Tổng: 30 công việc | Quá hạn: 4")).toBeInTheDocument();
    expect(screen.getByText("Đang hiển thị 30 / 30 công việc")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Cần làm (13)" })).toBeInTheDocument();
    await addTaskByForm(user, { title: "Chuẩn bị tài liệu họp", due: "2026-11-20" });
    expect(within(column("Cần làm")).getByRole("heading", { level: 4, name: "Chuẩn bị tài liệu họp" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Cần làm (14)" })).toBeInTheDocument();
    expect(screen.getByText("Tổng: 31 công việc | Quá hạn: 4")).toBeInTheDocument();
    expect(screen.getByText("Đang hiển thị 31 / 31 công việc")).toBeInTheDocument();
  });

  test("thẻ mới hiện đúng độ ưu tiên, người nhận, hạn; chọn Chưa giao thì hiện Chưa giao", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    await addTaskByForm(user, { title: "Soạn hợp đồng đối tác", priority: "Cao", assignee: "Lê Hoàng Cường", due: "2026-11-20" });
    const first = within(card("Soạn hợp đồng đối tác"));
    expect(first.getByText("Cao")).toHaveClass("badge", "text-bg-danger");
    expect(first.getByText("Người nhận: Lê Hoàng Cường")).toBeInTheDocument();
    expect(first.getByText("Hạn: 20/11/2026")).toBeInTheDocument();
    await addTaskByForm(user, { title: "Dọn kho lưu trữ", due: "2026-12-02" });
    const second = within(card("Dọn kho lưu trữ"));
    expect(second.getByText("Trung bình")).toBeInTheDocument();
    expect(second.getByText("Chưa giao")).toBeInTheDocument();
    expect(second.queryByText(/Người nhận:/)).not.toBeInTheDocument();
  });

  test("form thiếu thông tin không thêm gì; sau khi thêm được thì form trống để thêm tiếp", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    await addTaskByForm(user, { due: "2026-11-20" });
    expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng nhập tên công việc.");
    expect(screen.getByText("Tổng: 30 công việc | Quá hạn: 4")).toBeInTheDocument();
    await addTaskByForm(user, { title: "Việc thứ nhất", due: "2026-11-20" });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Tên công việc")).toHaveValue("");
    await addTaskByForm(user, { title: "Việc thứ hai", due: "2026-11-21" });
    expect(screen.getByRole("heading", { level: 3, name: "Cần làm (15)" })).toBeInTheDocument();
    expect(screen.getByText("Tổng: 32 công việc | Quá hạn: 4")).toBeInTheDocument();
  });

  test("id mới là id lớn nhất cộng 1, không trùng với công việc có sẵn", async () => {
    const user = userEvent.setup({ delay: null });
    const list = frozenTasks([makeTask(2), makeTask(3), makeTask(4)]);
    render(<App initialTasks={list} />);
    await addTaskByForm(user, { title: "Việc mới thêm", due: "2026-11-20" });
    await user.click(within(card("Việc mới thêm")).getByRole("button", { name: "Bắt đầu" }));
    expect(screen.getByRole("heading", { level: 3, name: "Đang làm (1)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Cần làm (3)" })).toBeInTheDocument();
    expect(within(column("Đang làm")).getByRole("heading", { level: 4, name: "Việc mới thêm" })).toBeInTheDocument();
  });

  test("công việc mới có hạn trước hôm nay thì hiện Quá hạn và tóm tắt tăng", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    await addTaskByForm(user, { title: "Nộp báo cáo muộn", due: "2026-11-01" });
    expect(within(card("Nộp báo cáo muộn")).getByText("Quá hạn")).toHaveClass("badge", "text-bg-danger");
    expect(screen.getByText("Tổng: 31 công việc | Quá hạn: 5")).toBeInTheDocument();
  });
});

// ---------- App: đổi trạng thái ----------

describe("Đổi trạng thái", () => {
  test("nút Bắt đầu chuyển công việc từ Cần làm sang Đang làm", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    const title = "Chuẩn bị buổi phỏng vấn ứng viên frontend";
    await user.click(within(card(title)).getByRole("button", { name: "Bắt đầu" }));
    expect(within(column("Đang làm")).getByRole("heading", { level: 4, name: title })).toBeInTheDocument();
    expect(within(column("Cần làm")).queryByRole("heading", { level: 4, name: title })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Cần làm (12)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Đang làm (10)" })).toBeInTheDocument();
    expect(within(card(title)).getByRole("button", { name: "Hoàn thành" })).toBeInTheDocument();
  });

  test("nút Hoàn thành chuyển sang cột Hoàn thành (gạch ngang tiêu đề), nút Mở lại đưa về Cần làm", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    const title = "Kiểm thử chức năng đăng nhập";
    await user.click(within(card(title)).getByRole("button", { name: "Hoàn thành" }));
    expect(screen.getByRole("heading", { level: 3, name: "Hoàn thành (9)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Đang làm (8)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: title })).toHaveClass("text-decoration-line-through");
    await user.click(within(card(title)).getByRole("button", { name: "Mở lại" }));
    expect(within(column("Cần làm")).getByRole("heading", { level: 4, name: title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Cần làm (14)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Hoàn thành (8)" })).toBeInTheDocument();
  });

  test("chỉ công việc được bấm đổi cột, các công việc khác giữ nguyên (dữ liệu đóng băng không bị sửa)", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    const before = boardSnapshot();
    expect(Object.keys(before)).toHaveLength(30);
    await user.click(within(card("Đối soát hóa đơn tháng 10")).getByRole("button", { name: "Mở lại" }));
    const after = boardSnapshot();
    const changed = Object.keys(after).filter((title) => after[title] !== before[title]);
    expect(changed).toEqual(["Đối soát hóa đơn tháng 10"]);
    expect(after["Đối soát hóa đơn tháng 10"]).toBe("Cần làm");
  });

  test("hoàn thành công việc quá hạn thì nhãn Quá hạn biến mất và tóm tắt giảm", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    await addTaskByForm(user, { title: "Nộp báo cáo muộn", due: "2026-11-01" });
    expect(screen.getByText("Tổng: 31 công việc | Quá hạn: 5")).toBeInTheDocument();
    await user.click(within(card("Nộp báo cáo muộn")).getByRole("button", { name: "Bắt đầu" }));
    expect(screen.getByText("Tổng: 31 công việc | Quá hạn: 5")).toBeInTheDocument();
    await user.click(within(card("Nộp báo cáo muộn")).getByRole("button", { name: "Hoàn thành" }));
    expect(screen.getByText("Tổng: 31 công việc | Quá hạn: 4")).toBeInTheDocument();
    expect(within(card("Nộp báo cáo muộn")).queryByText("Quá hạn")).not.toBeInTheDocument();
  });
});

// ---------- App: lọc công việc ----------

describe("Lọc công việc", () => {
  test("tìm theo tên không phân biệt hoa thường và bỏ khoảng trắng hai đầu", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    await user.type(screen.getByLabelText("Tìm công việc"), "  KHÁCH hàng ");
    expect(screen.getByText("Đang hiển thị 3 / 30 công việc")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Soạn báo giá cho khách hàng mới" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Gửi thư cảm ơn khách hàng sau hội thảo" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 4, name: "Đối soát hóa đơn tháng 10" })).not.toBeInTheDocument();
  });

  test("lọc theo độ ưu tiên Cao chỉ còn công việc Cao, số cột tính theo kết quả lọc", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    await user.selectOptions(screen.getByLabelText("Lọc độ ưu tiên"), "Cao");
    expect(screen.getByText("Đang hiển thị 11 / 30 công việc")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Cần làm (4)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Đang làm (5)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Hoàn thành (2)" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 4, name: "Dọn dẹp nhánh mã nguồn cũ" })).not.toBeInTheDocument();
  });

  test("lọc theo người nhận, kể cả mục Chưa giao cho công việc vừa thêm", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    await addTaskByForm(user, { title: "Dọn kho lưu trữ", due: "2026-12-02" });
    await user.selectOptions(screen.getByLabelText("Lọc người nhận"), "Đặng Quốc Huy");
    expect(screen.getByText("Đang hiển thị 3 / 31 công việc")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Triển khai bản vá bảo mật" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Lọc người nhận"), "Chưa giao");
    expect(screen.getByText("Đang hiển thị 1 / 31 công việc")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Dọn kho lưu trữ" })).toBeInTheDocument();
  });

  test("ba điều kiện kết hợp bằng VÀ; không khớp công việc nào thì mỗi cột báo Không có công việc nào.", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    await user.selectOptions(screen.getByLabelText("Lọc người nhận"), "Đặng Quốc Huy");
    await user.selectOptions(screen.getByLabelText("Lọc độ ưu tiên"), "Cao");
    expect(screen.getByText("Đang hiển thị 2 / 30 công việc")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Tìm công việc"), "bảo mật");
    expect(screen.getByText("Đang hiển thị 1 / 30 công việc")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Triển khai bản vá bảo mật" })).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Tìm công việc"));
    await user.type(screen.getByLabelText("Tìm công việc"), "không có việc này");
    expect(screen.getByText("Đang hiển thị 0 / 30 công việc")).toBeInTheDocument();
    expect(screen.getAllByText("Không có công việc nào.")).toHaveLength(3);
  });

  test("tóm tắt Tổng và Quá hạn luôn tính trên toàn bộ công việc; Xóa bộ lọc trả mọi thứ về ban đầu", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    await user.type(screen.getByLabelText("Tìm công việc"), "báo cáo");
    await user.selectOptions(screen.getByLabelText("Lọc độ ưu tiên"), "Cao");
    expect(screen.getByText("Tổng: 30 công việc | Quá hạn: 4")).toBeInTheDocument();
    expect(screen.getByText("Đang hiển thị 1 / 30 công việc")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Xóa bộ lọc" }));
    expect(screen.getByLabelText("Tìm công việc")).toHaveValue("");
    expect(screen.getByLabelText("Lọc độ ưu tiên")).toHaveDisplayValue("Tất cả");
    expect(screen.getByLabelText("Lọc người nhận")).toHaveDisplayValue("Tất cả");
    expect(screen.getByText("Đang hiển thị 30 / 30 công việc")).toBeInTheDocument();
  });

  test("đổi trạng thái khi đang lọc: công việc sang cột mới, bộ lọc giữ nguyên", async () => {
    const user = userEvent.setup({ delay: null });
    render(<App initialTasks={frozenTasks()} />);
    await user.selectOptions(screen.getByLabelText("Lọc người nhận"), "Đặng Quốc Huy");
    expect(screen.getByRole("heading", { level: 3, name: "Cần làm (1)" })).toBeInTheDocument();
    await user.click(within(card("Nâng cấp thư viện React lên bản ổn định")).getByRole("button", { name: "Bắt đầu" }));
    expect(screen.getByRole("heading", { level: 3, name: "Cần làm (0)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Đang làm (3)" })).toBeInTheDocument();
    expect(screen.getByText("Đang hiển thị 3 / 30 công việc")).toBeInTheDocument();
    expect(screen.getByLabelText("Lọc người nhận")).toHaveDisplayValue("Đặng Quốc Huy");
    await user.click(screen.getByRole("button", { name: "Xóa bộ lọc" }));
    expect(screen.getByRole("heading", { level: 3, name: "Đang làm (10)" })).toBeInTheDocument();
  });
});
