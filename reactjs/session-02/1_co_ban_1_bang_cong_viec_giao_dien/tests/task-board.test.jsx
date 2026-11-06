import { render, screen, within } from "@testing-library/react";
import PriorityBadge from "../src/components/PriorityBadge.jsx";
import TaskCard from "../src/components/TaskCard.jsx";
import TaskColumn from "../src/components/TaskColumn.jsx";
import TaskBoard from "../src/components/TaskBoard.jsx";
import App from "../src/App.jsx";
import seedTasks from "../src/data/tasks.js";
import seedEmployees from "../src/data/employees.js";

// Tạo nhanh một công việc; trường nào cần khác thì truyền vào overrides.
function makeTask(overrides = {}) {
  return {
    id: 1,
    title: "Viết tài liệu API",
    status: "doing",
    priority: "high",
    assigneeId: 1,
    dueDate: "2026-11-10",
    ...overrides,
  };
}

const AN = { id: 1, name: "Nguyễn Văn An" };

// Lấy thẻ section của cột có tiêu đề cho trước.
function columnOf(name) {
  return screen.getByRole("heading", { level: 3, name }).closest("section");
}

// Danh sách tiêu đề h4 (tiêu đề thẻ) trong một vùng, theo thứ tự trên màn hình.
function cardTitles(container) {
  return within(container)
    .getAllByRole("heading", { level: 4 })
    .map((h) => h.textContent);
}

// Test này PHẢI nằm trước mọi test dựng danh sách: React chỉ báo thiếu key một lần
// cho mỗi component trong một tệp test, nên chỉ lần dựng đầu tiên mới bắt được.
describe("Key của danh sách", () => {
  test("dựng bảng công việc mà React không báo lỗi thiếu key", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <TaskBoard
        tasks={[
          makeTask({ id: 1, title: "Việc một", status: "todo" }),
          makeTask({ id: 2, title: "Việc hai", status: "todo" }),
          makeTask({ id: 3, title: "Việc ba", status: "doing" }),
        ]}
        employees={[AN]}
        today="2026-11-11"
      />
    );
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(3);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("PriorityBadge", () => {
  test("hiện nhãn Thấp, Trung bình, Cao cho ba mức độ ưu tiên", () => {
    render(
      <>
        <PriorityBadge priority="low" />
        <PriorityBadge priority="medium" />
        <PriorityBadge priority="high" />
      </>
    );
    expect(screen.getByText("Thấp")).toBeInTheDocument();
    expect(screen.getByText("Trung bình")).toBeInTheDocument();
    expect(screen.getByText("Cao")).toBeInTheDocument();
  });

  test("ba mức có ba lớp màu Bootstrap khác nhau", () => {
    render(
      <>
        <PriorityBadge priority="low" />
        <PriorityBadge priority="medium" />
        <PriorityBadge priority="high" />
      </>
    );
    expect(screen.getByText("Thấp")).toHaveClass("badge", "text-bg-success");
    expect(screen.getByText("Trung bình")).toHaveClass("badge", "text-bg-warning");
    expect(screen.getByText("Cao")).toHaveClass("badge", "text-bg-danger");
  });

  test("giá trị lạ hiện Không rõ", () => {
    render(<PriorityBadge priority="urgent" />);
    expect(screen.getByText("Không rõ")).toHaveClass("badge", "text-bg-secondary");
  });
});

describe("TaskCard", () => {
  test("tiêu đề công việc là thẻ h4", () => {
    render(<TaskCard task={makeTask()} assignee={AN} today="2026-11-11" />);
    expect(
      screen.getByRole("heading", { level: 4, name: "Viết tài liệu API" })
    ).toBeInTheDocument();
  });

  test("hiện độ ưu tiên bằng PriorityBadge", () => {
    render(
      <TaskCard
        task={makeTask({ priority: "low" })}
        assignee={AN}
        today="2026-11-11"
      />
    );
    expect(screen.getByText("Thấp")).toBeInTheDocument();
  });

  test("hiện Người nhận kèm tên nhân viên", () => {
    render(<TaskCard task={makeTask()} assignee={AN} today="2026-11-11" />);
    expect(screen.getByText("Người nhận: Nguyễn Văn An")).toBeInTheDocument();
  });

  test("không có người nhận thì hiện Chưa giao", () => {
    render(<TaskCard task={makeTask()} assignee={undefined} today="2026-11-11" />);
    expect(screen.getByText("Chưa giao")).toBeInTheDocument();
    expect(screen.queryByText(/Người nhận:/)).not.toBeInTheDocument();
  });

  test("hạn hoàn thành hiện theo dạng ngày/tháng/năm", () => {
    render(
      <TaskCard
        task={makeTask({ dueDate: "2026-11-10" })}
        assignee={AN}
        today="2026-11-11"
      />
    );
    expect(screen.getByText("Hạn: 10/11/2026")).toBeInTheDocument();
  });

  test("hạn nhỏ hơn hôm nay và chưa xong thì có nhãn Quá hạn", () => {
    render(
      <TaskCard
        task={makeTask({ status: "doing", dueDate: "2026-11-10" })}
        assignee={AN}
        today="2026-11-11"
      />
    );
    expect(screen.getByText("Quá hạn")).toHaveClass("badge", "text-bg-dark");
  });

  test("hạn đúng bằng hôm nay thì chưa quá hạn", () => {
    render(
      <TaskCard
        task={makeTask({ status: "todo", dueDate: "2026-11-11" })}
        assignee={AN}
        today="2026-11-11"
      />
    );
    expect(screen.getByText("Hạn: 11/11/2026")).toBeInTheDocument();
    expect(screen.queryByText("Quá hạn")).not.toBeInTheDocument();
  });

  test("công việc đã hoàn thành gạch ngang tiêu đề và không có nhãn Quá hạn", () => {
    render(
      <>
        <TaskCard
          task={makeTask({ id: 1, title: "Việc đã xong", status: "done", dueDate: "2026-11-03" })}
          assignee={AN}
          today="2026-11-11"
        />
        <TaskCard
          task={makeTask({ id: 2, title: "Việc đang làm", status: "doing", dueDate: "2026-12-01" })}
          assignee={AN}
          today="2026-11-11"
        />
      </>
    );
    expect(screen.getByRole("heading", { name: "Việc đã xong" })).toHaveClass(
      "text-decoration-line-through"
    );
    expect(screen.getByRole("heading", { name: "Việc đang làm" })).not.toHaveClass(
      "text-decoration-line-through"
    );
    expect(screen.queryByText("Quá hạn")).not.toBeInTheDocument();
  });
});

describe("TaskColumn", () => {
  const tasks = [
    makeTask({ id: 1, title: "Việc cuối tháng", status: "todo", dueDate: "2026-11-30" }),
    makeTask({ id: 2, title: "Việc gần nhất", status: "todo", dueDate: "2026-11-12" }),
    makeTask({ id: 3, title: "Việc giữa tháng", status: "todo", dueDate: "2026-11-20" }),
  ];
  const byId = { 1: AN };

  test("tiêu đề cột kèm số công việc trong cột", () => {
    render(
      <TaskColumn title="Cần làm" tasks={tasks} employeesById={byId} today="2026-11-11" />
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "Cần làm (3)" })
    ).toBeInTheDocument();
  });

  test("cột rỗng hiện Không có công việc nào. và số 0", () => {
    render(
      <TaskColumn title="Đang làm" tasks={[]} employeesById={byId} today="2026-11-11" />
    );
    expect(screen.getByRole("heading", { name: "Đang làm (0)" })).toBeInTheDocument();
    expect(screen.getByText("Không có công việc nào.")).toBeInTheDocument();
  });

  test("công việc sắp theo hạn hoàn thành tăng dần", () => {
    const { container } = render(
      <TaskColumn title="Cần làm" tasks={tasks} employeesById={byId} today="2026-11-11" />
    );
    expect(cardTitles(container)).toEqual([
      "Việc gần nhất",
      "Việc giữa tháng",
      "Việc cuối tháng",
    ]);
  });

  test("cùng hạn thì giữ thứ tự trong dữ liệu", () => {
    const sameDay = [
      makeTask({ id: 1, title: "Hai", dueDate: "2026-11-15" }),
      makeTask({ id: 2, title: "Một", dueDate: "2026-11-15" }),
      makeTask({ id: 3, title: "Sớm", dueDate: "2026-11-01" }),
    ];
    const { container } = render(
      <TaskColumn title="Đang làm" tasks={sameDay} employeesById={byId} today="2026-11-11" />
    );
    expect(cardTitles(container)).toEqual(["Sớm", "Hai", "Một"]);
  });

  test("không làm thay đổi mảng tasks truyền vào", () => {
    const frozen = Object.freeze([...tasks]);
    const { container } = render(
      <TaskColumn title="Cần làm" tasks={frozen} employeesById={byId} today="2026-11-11" />
    );
    expect(cardTitles(container)).toHaveLength(3);
    expect(frozen.map((t) => t.id)).toEqual([1, 2, 3]);
  });

  test("tra người nhận theo employeesById, không tìm thấy thì Chưa giao", () => {
    const two = [
      makeTask({ id: 1, title: "Có người", assigneeId: 1 }),
      makeTask({ id: 2, title: "Không có người", assigneeId: 99 }),
    ];
    render(
      <TaskColumn title="Đang làm" tasks={two} employeesById={byId} today="2026-11-11" />
    );
    expect(screen.getByText("Người nhận: Nguyễn Văn An")).toBeInTheDocument();
    expect(screen.getByText("Chưa giao")).toBeInTheDocument();
  });
});

describe("TaskBoard", () => {
  const small = [
    makeTask({ id: 1, title: "Việc A", status: "todo", assigneeId: 1 }),
    makeTask({ id: 2, title: "Việc B", status: "todo", assigneeId: 2 }),
    makeTask({ id: 3, title: "Việc C", status: "doing", assigneeId: 1 }),
    makeTask({ id: 4, title: "Việc D", status: "done", assigneeId: 2 }),
  ];
  const people = [AN, { id: 2, name: "Trần Thị Bình" }];

  test("có ba cột theo đúng thứ tự Cần làm, Đang làm, Hoàn thành", () => {
    render(<TaskBoard tasks={small} employees={people} today="2026-11-11" />);
    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(titles).toEqual(["Cần làm (2)", "Đang làm (1)", "Hoàn thành (1)"]);
  });

  test("mỗi công việc nằm đúng cột theo status và có tên người nhận", () => {
    render(<TaskBoard tasks={small} employees={people} today="2026-11-11" />);
    expect(cardTitles(columnOf("Cần làm (2)"))).toEqual(["Việc A", "Việc B"]);
    expect(cardTitles(columnOf("Đang làm (1)"))).toEqual(["Việc C"]);
    expect(cardTitles(columnOf("Hoàn thành (1)"))).toEqual(["Việc D"]);
    expect(
      within(columnOf("Hoàn thành (1)")).getByText("Người nhận: Trần Thị Bình")
    ).toBeInTheDocument();
  });

  test("dòng tóm tắt Tổng và Quá hạn tính từ dữ liệu thật", () => {
    render(<TaskBoard tasks={seedTasks} employees={seedEmployees} today="2026-11-11" />);
    expect(screen.getByText("Tổng: 30 công việc | Quá hạn: 4")).toBeInTheDocument();
    expect(screen.getAllByText("Quá hạn")).toHaveLength(4);
  });

  test("số công việc quá hạn đổi theo ngày today", () => {
    const { rerender } = render(
      <TaskBoard tasks={seedTasks} employees={seedEmployees} today="2026-11-06" />
    );
    expect(screen.getByText("Tổng: 30 công việc | Quá hạn: 0")).toBeInTheDocument();
    rerender(<TaskBoard tasks={seedTasks} employees={seedEmployees} today="2026-12-31" />);
    expect(screen.getByText("Tổng: 30 công việc | Quá hạn: 22")).toBeInTheDocument();
  });

  test("danh sách rỗng vẫn hiện ba cột rỗng và Tổng: 0", () => {
    render(<TaskBoard tasks={[]} employees={[]} today="2026-11-11" />);
    expect(screen.getByText("Tổng: 0 công việc | Quá hạn: 0")).toBeInTheDocument();
    expect(screen.getAllByText("Không có công việc nào.")).toHaveLength(3);
  });
});

describe("App", () => {
  test("hiện tiêu đề Task Hub và dòng tóm tắt của dữ liệu có sẵn", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Task Hub" })).toBeInTheDocument();
    expect(screen.getByText("Tổng: 30 công việc | Quá hạn: 4")).toBeInTheDocument();
  });

  test("ba cột có đúng số công việc của dữ liệu có sẵn", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Cần làm (13)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Đang làm (9)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hoàn thành (8)" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(30);
  });
});
