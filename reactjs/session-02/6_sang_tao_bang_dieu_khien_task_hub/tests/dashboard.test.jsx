import { render, renderHook, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import seed from "../db.seed.json";
import { installCrudcrud } from "./crudcrud-fake.js";
import { installOpenMeteo } from "./open-meteo-fake.js";
import App from "../src/App.jsx";
import { AuthContext } from "../src/context/AuthContext.jsx";
import calcProgress from "../src/utils/calcProgress.js";
import useDashboardData from "../src/hooks/useDashboardData.js";
import DashboardPage from "../src/pages/DashboardPage.jsx";
import GlobalSearch from "../src/components/GlobalSearch.jsx";

// Công việc dựng tay: hôm nay của ứng dụng là 2026-11-11. Tiêu đề luôn bắt đầu bằng "Việc ".
function makeTask(n, dueDate, status = "todo", assigneeCode = "NV01") {
  return { code: `CV9${n}`, title: `Việc ${n}`, status, priority: "medium", assigneeCode, dueDate };
}

let server;

beforeEach(() => {
  server = installCrudcrud(seed);
  installOpenMeteo();
});

// Dựng lại "máy chủ crudcrud" với dữ liệu riêng của test (luật đặt sau ưu tiên hơn luật đặt trong beforeEach).
function useData({ employees = seed.employees, tasks = seed.tasks } = {}) {
  server = installCrudcrud({ employees, tasks });
  return server;
}

// Vẽ bảng điều khiển với người đăng nhập cho trước (mặc định Nguyễn Văn An, Hà Nội).
function renderDashboard(user = seed.employees[0]) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user, login() {}, logout() {} }}>
        <DashboardPage />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

// Chữ của mọi li, bỏ chữ của nút nằm trong li (nút Xong của mục quá hạn).
function listLines() {
  return screen.queryAllByRole("listitem").map((li) => {
    const button = li.querySelector("button");
    return li.textContent.replace(button ? button.textContent : "", "").trim();
  });
}

// Các dòng tiến độ nhân viên: dạng "Tên: 2/4 (50%)".
function progressLines() {
  return listLines().filter((text) => /^.+: \d+\/\d+ \(\d+%\)$/.test(text));
}

// Các dòng công việc quá hạn: dạng "... - Hạn: dd/mm/yyyy".
function overdueLines() {
  return listLines().filter((text) => / - Hạn: \d\d\/\d\d\/\d{4}$/.test(text));
}

function statValue(label) {
  return within(screen.getByRole("group", { name: label })).getByText(/^\d+$/).textContent;
}

describe("calcProgress", () => {
  test("danh sách rỗng trả total 0, done 0, percent 0", () => {
    expect(calcProgress([])).toEqual({ total: 0, done: 0, percent: 0 });
  });

  test("chỉ công việc có trạng thái done được tính là hoàn thành", () => {
    const tasks = [makeTask(1, "2026-11-10", "done"), makeTask(2, "2026-11-10", "doing"), makeTask(3, "2026-11-10", "todo"), makeTask(4, "2026-11-10", "todo")];
    expect(calcProgress(tasks)).toEqual({ total: 4, done: 1, percent: 25 });
  });

  test("làm tròn phần trăm thành số nguyên: 1 trên 3 là 33, 2 trên 3 là 67", () => {
    const one = [makeTask(1, "2026-11-10", "done"), makeTask(2, "2026-11-10"), makeTask(3, "2026-11-10")];
    const two = [makeTask(1, "2026-11-10", "done"), makeTask(2, "2026-11-10", "done"), makeTask(3, "2026-11-10")];
    expect(calcProgress(one).percent).toBe(33);
    expect(calcProgress(two).percent).toBe(67);
  });
});

describe("useDashboardData", () => {
  test("bắt đầu ở trạng thái đang tải rồi trả đủ 8 nhân viên và 12 công việc, mỗi bản ghi có _id", async () => {
    const { result } = renderHook(() => useDashboardData());
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe("");
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.employees).toHaveLength(8);
    expect(result.current.tasks).toHaveLength(12);
    expect(result.current.employees[0]._id).toMatch(/^[a-f0-9]{24}$/);
    expect(result.current.error).toBe("");
  });

  test("gửi hai yêu cầu cùng lúc, mỗi tài nguyên chỉ tải đúng một lần kể cả khi render lại", async () => {
    window.mockApi.delay("GET */employees", 300);
    window.mockApi.delay("GET */tasks", 300);
    const { result, rerender } = renderHook(() => useDashboardData());
    // Chưa yêu cầu nào kịp trả lời (300 ms) mà cả hai đã được gửi: nếu tải nối tiếp thì yêu cầu thứ hai chưa có.
    await waitFor(
      () => {
        expect(window.mockApi.callsTo("GET */employees")).toHaveLength(1);
        expect(window.mockApi.callsTo("GET */tasks")).toHaveLength(1);
      },
      { timeout: 100 }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender();
    expect(window.mockApi.callsTo("GET */employees")).toHaveLength(1);
    expect(window.mockApi.callsTo("GET */tasks")).toHaveLength(1);
    expect(server.requestCount()).toBe(2);
  });

  test("mất mạng trả error là câu thông báo, danh sách rỗng và hết đang tải", async () => {
    window.mockApi.networkError("GET */tasks");
    const { result } = renderHook(() => useDashboardData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Không kết nối được máy chủ.");
    expect(result.current.employees).toEqual([]);
    expect(result.current.tasks).toEqual([]);
  });
});

describe("DashboardPage: số liệu và tiến độ", () => {
  test("hiện chữ đang tải rồi ba thẻ số liệu: tổng 12, đang làm 5, hoàn thành 3", async () => {
    renderDashboard();
    expect(screen.getByText("Đang tải bảng điều khiển...")).toBeInTheDocument();
    await screen.findByRole("group", { name: "Tổng công việc" });
    expect(statValue("Tổng công việc")).toBe("12");
    expect(statValue("Đang làm")).toBe("5");
    expect(statValue("Hoàn thành")).toBe("3");
    expect(screen.queryByText("Đang tải bảng điều khiển...")).not.toBeInTheDocument();
  });

  test("mỗi nhân viên có dòng tiến độ và thanh tiến độ đúng phần trăm, sắp theo phần trăm giảm dần rồi theo tên", async () => {
    renderDashboard();
    expect(await screen.findByText("Tiến độ theo nhân viên")).toBeInTheDocument();
    expect(progressLines()).toEqual([
      "Phạm Thu Dung: 1/1 (100%)",
      "Hoàng Minh Đức: 1/2 (50%)",
      "Lê Hoàng Cường: 1/2 (50%)",
      "Bùi Lan Khanh: 0/1 (0%)",
      "Đặng Quốc Huy: 0/2 (0%)",
      "Nguyễn Văn An: 0/2 (0%)",
      "Trần Thị Bình: 0/1 (0%)",
      "Vũ Ngọc Hà: 0/1 (0%)",
    ]);
    const bar = screen.getByRole("progressbar", { name: "Hoàng Minh Đức" });
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar).toHaveClass("progress-bar");
    expect(screen.getByRole("progressbar", { name: "Phạm Thu Dung" })).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByRole("progressbar", { name: "Nguyễn Văn An" })).toHaveAttribute("aria-valuenow", "0");
  });

  test("nhân viên chưa có việc hiện 0/0 (0%), nhân viên đã nghỉ việc không có dòng tiến độ", async () => {
    const newcomer = { code: "NV09", name: "Mai Thị Xuân", email: "xuan.mai@example.com", department: "Nhân sự", position: "Thực tập sinh", salary: 8000000, city: "Huế", status: "probation", joinedAt: "2026-10-01" };
    const resigned = { code: "NV10", name: "Đỗ Mai Phương", email: "phuong.do@example.com", department: "Kế toán", position: "Kế toán viên", salary: 11000000, city: "Hà Nội", status: "resigned", joinedAt: "2021-04-01" };
    useData({ employees: [...seed.employees, newcomer, resigned], tasks: [...seed.tasks, makeTask(1, "2026-12-01", "done", "NV10")] });
    renderDashboard();
    await waitFor(() => expect(progressLines()).toContain("Mai Thị Xuân: 0/0 (0%)"));
    expect(progressLines()).toHaveLength(9);
    expect(progressLines().some((line) => line.startsWith("Đỗ Mai Phương"))).toBe(false);
  });
});

describe("DashboardPage: công việc quá hạn", () => {
  test("hiện tối đa 5 việc, hạn cũ nhất trước, cùng hạn giữ thứ tự dữ liệu, mỗi dòng có người nhận và hạn", async () => {
    useData({
      tasks: [
        makeTask(1, "2026-11-05"),
        makeTask(2, "2026-10-20"),
        makeTask(3, "2026-11-01"),
        makeTask(4, "2026-10-20"),
        makeTask(5, "2026-11-02"),
        makeTask(6, "2026-10-01"),
        makeTask(7, "2026-11-04"),
      ],
    });
    renderDashboard();
    expect(await screen.findByText("Công việc quá hạn")).toBeInTheDocument();
    await waitFor(() => expect(overdueLines()).toHaveLength(5));
    expect(overdueLines()).toEqual([
      "Việc 6 - Người nhận: Nguyễn Văn An - Hạn: 01/10/2026",
      "Việc 2 - Người nhận: Nguyễn Văn An - Hạn: 20/10/2026",
      "Việc 4 - Người nhận: Nguyễn Văn An - Hạn: 20/10/2026",
      "Việc 3 - Người nhận: Nguyễn Văn An - Hạn: 01/11/2026",
      "Việc 5 - Người nhận: Nguyễn Văn An - Hạn: 02/11/2026",
    ]);
  });

  test("không tính việc đã hoàn thành và việc hạn đúng hôm nay; việc chưa giao hoặc mã người nhận lạ hiện Chưa giao", async () => {
    useData({
      tasks: [
        makeTask(1, "2026-10-01", "done"),
        makeTask(2, "2026-11-11"),
        makeTask(3, "2026-11-12"),
        makeTask(4, "2026-11-05", "doing", ""),
        makeTask(5, "2026-11-06", "todo", "NV99"),
      ],
    });
    renderDashboard();
    await waitFor(() => expect(overdueLines()).toHaveLength(2));
    expect(overdueLines()).toEqual(["Việc 4 - Chưa giao - Hạn: 05/11/2026", "Việc 5 - Chưa giao - Hạn: 06/11/2026"]);
  });

  test("không có việc quá hạn thì hiện Không có công việc quá hạn.", async () => {
    useData({ tasks: [makeTask(1, "2026-11-11"), makeTask(2, "2026-10-01", "done")] });
    renderDashboard();
    expect(await screen.findByText("Không có công việc quá hạn.")).toBeInTheDocument();
  });
});

describe("DashboardPage: đổi trạng thái công việc", () => {
  const doneButton = () => screen.findByRole("button", { name: "Hoàn thành Kiểm thử chức năng đăng nhập" });

  test("bấm Xong gửi đúng một PUT tới /tasks/<_id>, thân đủ trường và không có _id", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.click(await doneButton());
    await waitFor(() => expect(window.mockApi.callsTo("PUT */tasks/*")).toHaveLength(1));
    const original = seed.tasks.find((task) => task.code === "CV06");
    const stored = server.db.tasks.find((task) => task.code === "CV06");
    const call = window.mockApi.callsTo("PUT */tasks/*")[0];
    expect(call.path.endsWith(`/tasks/${stored._id}`)).toBe(true);
    expect(call.body).toEqual({ ...original, status: "done" });
    expect("_id" in call.body).toBe(false);
    expect(stored.status).toBe("done");
    expect(stored.title).toBe("Kiểm thử chức năng đăng nhập");
  });

  test("sau khi lưu, số liệu, tiến độ và mục quá hạn tự cập nhật mà không tải lại danh sách", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.click(await doneButton());
    await waitFor(() => expect(statValue("Hoàn thành")).toBe("4"));
    expect(statValue("Đang làm")).toBe("4");
    expect(statValue("Tổng công việc")).toBe("12");
    expect(progressLines()).toContain("Hoàng Minh Đức: 2/2 (100%)");
    expect(overdueLines()).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Hoàn thành Kiểm thử chức năng đăng nhập" })).not.toBeInTheDocument();
    expect(window.mockApi.callsTo("GET */employees")).toHaveLength(1);
    expect(window.mockApi.callsTo("GET */tasks")).toHaveLength(1);
  });

  test("PUT lỗi 500 hiện thông báo, giữ nguyên dữ liệu và cho bấm lại", async () => {
    const user = userEvent.setup();
    window.mockApi.fail("PUT */tasks/*", { status: 500, times: 1 });
    renderDashboard();
    await user.click(await doneButton());
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Không cập nhật được: Máy chủ đang gặp sự cố, hãy thử lại sau.");
    expect(alert).toHaveClass("alert-danger");
    expect(statValue("Hoàn thành")).toBe("3");
    expect(overdueLines()).toHaveLength(3);
    expect(await doneButton()).toBeEnabled();
    // Bấm lại khi máy chủ đã ổn: lưu được và thông báo lỗi biến mất.
    await user.click(await doneButton());
    await waitFor(() => expect(statValue("Hoàn thành")).toBe("4"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("nút Xong bị khóa trong lúc đang lưu nên bấm hai lần chỉ gửi một PUT", async () => {
    const user = userEvent.setup();
    window.mockApi.delay("PUT */tasks/*", 300);
    renderDashboard();
    const button = await doneButton();
    await user.click(button);
    expect(button).toBeDisabled();
    await user.click(button);
    await waitFor(() => expect(statValue("Hoàn thành")).toBe("4"));
    expect(window.mockApi.callsTo("PUT */tasks/*")).toHaveLength(1);
  });
});

describe("DashboardPage: thời tiết, lỗi và hạn mức", () => {
  test("thời tiết lấy theo thành phố của người đăng nhập", async () => {
    const cuong = seed.employees.find((employee) => employee.name === "Lê Hoàng Cường");
    renderDashboard(cuong);
    expect(await screen.findByText(/^Đà Nẵng: .+°C/)).toBeInTheDocument();
    const search = window.mockApi.calls.find((call) => call.url.includes("geocoding-api.open-meteo.com"));
    expect(search.query.name).toBe("Đà Nẵng");
    expect(screen.getByText("Dữ liệu thời tiết: Open-Meteo.com")).toBeInTheDocument();
  });

  test("tải dữ liệu lỗi 500: một thông báo có nút Thử lại thay các khối công việc, thời tiết vẫn hiện, Thử lại tải lại được", async () => {
    const user = userEvent.setup();
    window.mockApi.fail("GET */tasks", { status: 500, times: 1 });
    renderDashboard();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Không tải được bảng điều khiển: Máy chủ đang gặp sự cố, hãy thử lại sau.");
    expect(alert).toHaveClass("alert-danger");
    expect(screen.queryByText("Tiến độ theo nhân viên")).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Tổng công việc" })).not.toBeInTheDocument();
    expect(await screen.findByText(/^Hà Nội: .+°C/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByRole("group", { name: "Tổng công việc" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(window.mockApi.callsTo("GET */tasks")).toHaveLength(2);
  });

  test("endpoint vượt hạn mức 100 yêu cầu: hiện thông báo hết hạn mức kèm nút Thử lại, không treo ở trạng thái đang tải", async () => {
    installCrudcrud(seed, { quota: 1 });
    renderDashboard();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Không tải được bảng điều khiển: Endpoint đã hết hạn mức 100 yêu cầu, hãy lấy endpoint mới ở crudcrud.com.");
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeInTheDocument();
    expect(screen.queryByText("Đang tải bảng điều khiển...")).not.toBeInTheDocument();
  });

  test("thời tiết lỗi không làm hỏng các khối công việc", async () => {
    window.mockApi.networkError((req) => req.url.includes("open-meteo.com"));
    renderDashboard();
    expect(await screen.findByRole("alert")).toHaveTextContent("Không tải được thời tiết: Không kết nối được máy chủ.");
    expect(await screen.findByRole("group", { name: "Tổng công việc" })).toBeInTheDocument();
    expect(statValue("Tổng công việc")).toBe("12");
    expect(overdueLines()).toHaveLength(3);
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });
});

describe("GlobalSearch", () => {
  // Vẽ ô tìm kiếm riêng với dữ liệu đã tải (có _id) lấy từ "máy chủ".
  function renderSearch() {
    render(
      <MemoryRouter>
        <GlobalSearch employees={server.db.employees} tasks={server.db.tasks} />
      </MemoryRouter>
    );
    return screen.getByLabelText("Tìm trong Task Hub");
  }

  test("gõ từ khóa lọc ngay trên dữ liệu đã tải, không gửi thêm yêu cầu mạng nào, mỗi kết quả là liên kết theo _id", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByRole("group", { name: "Tổng công việc" });
    await user.type(screen.getByLabelText("Tìm trong Task Hub"), "kiểm thử");
    expect(screen.getByText("Nhân viên (1)")).toBeInTheDocument();
    expect(screen.getByText("Công việc (2)")).toBeInTheDocument();
    const duc = server.db.employees.find((employee) => employee.code === "NV05");
    const cv06 = server.db.tasks.find((task) => task.code === "CV06");
    expect(screen.getByRole("link", { name: "Hoàng Minh Đức" })).toHaveAttribute("href", `/employees/${duc._id}`);
    expect(screen.getByRole("link", { name: "Kiểm thử chức năng đăng nhập" })).toHaveAttribute("href", `/tasks/${cv06._id}`);
    expect(screen.getByRole("link", { name: "Thiết lập môi trường kiểm thử tự động" })).toBeInTheDocument();
    expect(window.mockApi.callsTo("GET */employees")).toHaveLength(1);
    expect(window.mockApi.callsTo("GET */tasks")).toHaveLength(1);
    expect(window.mockApi.calls.filter((call) => call.method !== "GET" && call.url.includes("crudcrud.com"))).toHaveLength(0);
  });

  test("không phân biệt hoa thường; nhân viên khớp theo tên, chức vụ hoặc phòng ban", async () => {
    const user = userEvent.setup();
    const box = renderSearch();
    await user.type(box, "tuyển");
    expect(screen.getByText("Nhân viên (1)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Trần Thị Bình" })).toBeInTheDocument();
    expect(screen.getByText("Công việc (0)")).toBeInTheDocument();
    await user.clear(box);
    await user.type(box, "NHÂN SỰ");
    expect(screen.getByText("Nhân viên (2)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Trần Thị Bình" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bùi Lan Khanh" })).toBeInTheDocument();
    expect(screen.getByText("Công việc (0)")).toBeInTheDocument();
  });

  test("từ khóa được cắt dấu cách hai đầu; không có kết quả thì hiện Không có kết quả cho \"<từ khóa>\".", async () => {
    const user = userEvent.setup();
    const box = renderSearch();
    await user.type(box, "  báo giá  ");
    expect(screen.getByText("Công việc (1)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Soạn báo giá cho khách hàng mới" })).toBeInTheDocument();
    expect(screen.getByText("Nhân viên (0)")).toBeInTheDocument();
    await user.clear(box);
    await user.type(box, "  zzz  ");
    expect(screen.getByText('Không có kết quả cho "zzz".')).toBeInTheDocument();
    expect(screen.queryByText(/^Nhân viên \(/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Công việc \(/)).not.toBeInTheDocument();
  });

  test("ô trống hoặc chỉ toàn dấu cách thì không hiện gì", async () => {
    const user = userEvent.setup();
    const box = renderSearch();
    await user.type(box, "     ");
    expect(screen.queryByText(/^Không có kết quả/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Nhân viên \(/)).not.toBeInTheDocument();
    await user.type(box, "báo");
    expect(screen.getByText("Công việc (1)")).toBeInTheDocument();
    await user.clear(box);
    expect(screen.queryByText(/^Công việc \(/)).not.toBeInTheDocument();
  });
});

describe("Task Hub: đăng nhập và tìm kiếm trong ứng dụng", () => {
  test("đăng nhập bằng email vào bảng điều khiển, thấy việc quá hạn, tìm công việc rồi mở trang chi tiết", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    await user.type(await screen.findByLabelText("Email"), "an.nguyen@example.com");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(await screen.findByText("Xin chào, Nguyễn Văn An")).toBeInTheDocument();
    expect(await screen.findByText("Tiến độ theo nhân viên")).toBeInTheDocument();
    expect(await screen.findByText(/^Hà Nội: .+°C/)).toBeInTheDocument();
    // Dữ liệu gốc có đúng 3 việc quá hạn, hạn cũ nhất trước.
    await waitFor(() => expect(overdueLines()).toHaveLength(3));
    expect(overdueLines()).toEqual([
      "Kiểm thử chức năng đăng nhập - Người nhận: Hoàng Minh Đức - Hạn: 08/11/2026",
      "Chuẩn bị buổi phỏng vấn ứng viên frontend - Người nhận: Trần Thị Bình - Hạn: 09/11/2026",
      "Viết tài liệu API cho module thanh toán - Người nhận: Nguyễn Văn An - Hạn: 10/11/2026",
    ]);
    await user.type(screen.getByLabelText("Tìm trong Task Hub"), "báo giá");
    await user.click(await screen.findByRole("link", { name: "Soạn báo giá cho khách hàng mới" }));
    expect(await screen.findByRole("heading", { name: "Soạn báo giá cho khách hàng mới" })).toBeInTheDocument();
    expect(screen.getByText("Hạn: 13/11/2026")).toBeInTheDocument();
  });
});
