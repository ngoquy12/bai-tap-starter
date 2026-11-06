import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import seed from "../db.seed.json";
import { installCrudcrud } from "./crudcrud-fake.js";
import App from "../src/App.jsx";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import { DataProvider } from "../src/context/DataContext.jsx";

const AN = seed.employees[0]; // Nguyễn Văn An (NV01), đang làm việc
// Máy tính chậm hoặc đang chạy nhiều việc có thể làm mỗi test lâu hơn 5 giây mặc định.
vi.setConfig({ testTimeout: 20000 });

const MSG_500 = "Máy chủ đang gặp sự cố, hãy thử lại sau.";
const MSG_OFFLINE = "Không kết nối được máy chủ.";

let server;
beforeEach(() => {
  server = installCrudcrud(seed);
});

// Nhật ký yêu cầu theo dạng "GET /tasks": đường dẫn thật của crudcrud có thêm /api/<endpoint> ở đầu.
const matcher = (text) => text.replace(" /", " /api/*/");
const callsTo = (text) => window.mockApi.callsTo(matcher(text));
const fail = (text, options) => window.mockApi.fail(matcher(text), options);
const delay = (text, ms) => window.mockApi.delay(matcher(text), ms);
const networkError = (text, times) => window.mockApi.networkError(matcher(text), times);

// Dữ liệu biến thể: một nhân viên đã nghỉ việc (NV04), hoặc nhân viên NV02 không có công việc nào.
function seedWithResignedNV04() {
  return { ...seed, employees: seed.employees.map((e) => (e.code === "NV04" ? { ...e, status: "resigned" } : e)) };
}
function seedWithoutTasksOfNV02() {
  return { ...seed, tasks: seed.tasks.filter((task) => task.assigneeCode !== "NV02") };
}

// Hiện đường dẫn hiện tại để test đọc được URL (chỉ dùng trong test).
function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname + location.search}</span>;
}

function currentPath() {
  return screen.getByTestId("location").textContent.split("?")[0];
}

function currentParams() {
  const search = screen.getByTestId("location").textContent.split("?")[1] ?? "";
  return Object.fromEntries(new URLSearchParams(search));
}

// Dựng ứng dụng tại một đường dẫn; truyền `user` để bắt đầu ở trạng thái đã đăng nhập.
function renderApp(path = "/", user = null) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <DataProvider>
        <AuthProvider initialUser={user}>
          <App />
          <LocationProbe />
        </AuthProvider>
      </DataProvider>
    </MemoryRouter>
  );
}

async function typeEmailAndSubmit(user, email) {
  const input = await screen.findByLabelText("Email");
  if (email) await user.type(input, email);
  await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
}

describe("Đăng nhập bằng email", () => {
  test("email đúng: nút đổi thành Đang đăng nhập..., rồi vào /tasks với lời chào; nhân viên chỉ tải một lần", async () => {
    delay("GET /employees", 300);
    const user = userEvent.setup();
    renderApp("/login");
    await typeEmailAndSubmit(user, "an.nguyen@example.com");
    expect(screen.getByRole("button", { name: "Đang đăng nhập..." })).toBeDisabled();
    expect(await screen.findByText("Xin chào, Nguyễn Văn An")).toBeInTheDocument();
    expect(currentPath()).toBe("/tasks");
    await screen.findByRole("list", { name: "Danh sách công việc" });
    expect(callsTo("GET /employees")).toHaveLength(1);
    expect(callsTo("GET /employees")[0].query).toEqual({});
    expect(callsTo("GET /tasks")).toHaveLength(1);
  });

  test("email có chữ hoa và dấu cách thừa vẫn đăng nhập được", async () => {
    const user = userEvent.setup();
    renderApp("/login");
    await typeEmailAndSubmit(user, "  AN.Nguyen@Example.com ");
    expect(await screen.findByText("Xin chào, Nguyễn Văn An")).toBeInTheDocument();
    expect(currentPath()).toBe("/tasks");
  });

  test("email không có trong danh sách: báo lỗi, ở lại /login và giữ chữ đã gõ", async () => {
    const user = userEvent.setup();
    renderApp("/login");
    await typeEmailAndSubmit(user, "khong.co@example.com");
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Không tìm thấy nhân viên với email này.");
    expect(alert).toHaveClass("alert", "alert-danger");
    expect(currentPath()).toBe("/login");
    expect(screen.getByLabelText("Email")).toHaveValue("khong.co@example.com");
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeEnabled();
  });

  test("nhân viên đã nghỉ việc (resigned) không được vào", async () => {
    server = installCrudcrud(seedWithResignedNV04());
    const user = userEvent.setup();
    renderApp("/login");
    await typeEmailAndSubmit(user, "dung.pham@example.com");
    expect(await screen.findByRole("alert")).toHaveTextContent("Tài khoản đã ngừng hoạt động.");
    expect(currentPath()).toBe("/login");
    expect(screen.queryByText(/Xin chào/)).not.toBeInTheDocument();
  });

  test("ô email trống hoặc toàn dấu cách: báo Vui lòng nhập email. và không gửi yêu cầu nào", async () => {
    const user = userEvent.setup();
    renderApp("/login");
    await typeEmailAndSubmit(user, "");
    expect(await screen.findByRole("alert")).toHaveTextContent("Vui lòng nhập email.");
    await user.type(screen.getByLabelText("Email"), "   ");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng nhập email.");
    expect(server.requestCount()).toBe(0);
  });

  test("mất mạng khi đăng nhập: báo lỗi chung; bấm Đăng nhập lại thì thành công", async () => {
    networkError("GET /employees", 1);
    const user = userEvent.setup();
    renderApp("/login");
    await typeEmailAndSubmit(user, "an.nguyen@example.com");
    expect(await screen.findByRole("alert")).toHaveTextContent(MSG_OFFLINE);
    expect(currentPath()).toBe("/login");
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(await screen.findByText("Xin chào, Nguyễn Văn An")).toBeInTheDocument();
    expect(callsTo("GET /employees")).toHaveLength(2);
  });
});

describe("Bố cục, route bảo vệ và trang 404", () => {
  test("chưa đăng nhập mà mở trang khác thì bị chuyển sang /login và không gửi yêu cầu nào", async () => {
    const first = renderApp("/tasks");
    expect(await screen.findByRole("heading", { name: "Đăng nhập" })).toBeInTheDocument();
    expect(currentPath()).toBe("/login");
    first.unmount();
    renderApp("/employees/NV03");
    expect(await screen.findByRole("heading", { name: "Đăng nhập" })).toBeInTheDocument();
    expect(currentPath()).toBe("/login");
    expect(server.requestCount()).toBe(0);
  });

  test("đã đăng nhập: / chuyển sang /tasks; có tiêu đề Task Hub, lời chào, menu và đổi trang không mất bố cục", async () => {
    const user = userEvent.setup();
    renderApp("/", AN);
    expect(await screen.findByRole("heading", { name: "Công việc" })).toBeInTheDocument();
    expect(currentPath()).toBe("/tasks");
    expect(screen.getByRole("heading", { level: 1, name: "Task Hub" })).toBeInTheDocument();
    expect(screen.getByText("Xin chào, Nguyễn Văn An")).toBeInTheDocument();
    const nav = screen.getByRole("navigation");
    expect(within(nav).getByRole("link", { name: "Công việc" })).toHaveClass("nav-link", "active");
    expect(within(nav).getByRole("link", { name: "Nhân viên" })).not.toHaveClass("active");
    await user.click(within(nav).getByRole("link", { name: "Nhân viên" }));
    expect(await screen.findByRole("heading", { name: "Danh sách nhân viên (8)" })).toBeInTheDocument();
    expect(currentPath()).toBe("/employees");
    expect(within(nav).getByRole("link", { name: "Nhân viên" })).toHaveClass("active");
    expect(within(nav).getByRole("link", { name: "Công việc" })).not.toHaveClass("active");
    expect(screen.getByRole("heading", { level: 1, name: "Task Hub" })).toBeInTheDocument();
  });

  test("bấm Đăng xuất: về trang đăng nhập, mất lời chào", async () => {
    const user = userEvent.setup();
    renderApp("/tasks", AN);
    await user.click(await screen.findByRole("button", { name: "Đăng xuất" }));
    expect(await screen.findByRole("heading", { name: "Đăng nhập" })).toBeInTheDocument();
    expect(currentPath()).toBe("/login");
    expect(screen.queryByText(/Xin chào/)).not.toBeInTheDocument();
  });

  test("đường dẫn lạ khi đã đăng nhập hiện Không tìm thấy trang, menu vẫn còn", async () => {
    renderApp("/khong-co-trang-nay", AN);
    expect(await screen.findByText("Không tìm thấy trang")).toBeInTheDocument();
    expect(screen.getByText("Xin chào, Nguyễn Văn An")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Về danh sách công việc" })).toHaveAttribute("href", "/tasks");
  });
});

describe("Danh sách công việc /tasks", () => {
  test("trang 1: Đang tải..., rồi 5 công việc, tổng, số trang; mỗi tài nguyên được tải một lần không kèm tham số", async () => {
    renderApp("/tasks", AN);
    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
    const list = await screen.findByRole("list", { name: "Danh sách công việc" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(screen.getByText("Tổng: 12 công việc")).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 3")).toBeInTheDocument();
    expect(within(items[0]).getByRole("link", { name: "Viết tài liệu API cho module thanh toán" })).toHaveAttribute(
      "href",
      "/tasks/CV01"
    );
    expect(within(items[0]).getByText("Người nhận: Nguyễn Văn An")).toBeInTheDocument();
    expect(within(items[0]).getByText("Hạn: 10/11/2026")).toBeInTheDocument();
    expect(within(items[0]).getByText("Cao")).toHaveClass("badge", "text-bg-danger");
    expect(callsTo("GET /tasks")).toHaveLength(1);
    expect(callsTo("GET /tasks")[0].query).toEqual({});
    expect(callsTo("GET /employees")).toHaveLength(1);
  });

  test("bấm Sau và Trước: đổi trang ở trình duyệt, ghi ?page= lên URL, không gửi thêm yêu cầu", async () => {
    const user = userEvent.setup();
    renderApp("/tasks", AN);
    await screen.findByText("Trang 1 / 3");
    const loaded = server.requestCount();
    expect(screen.getByRole("button", { name: "Trước" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Sau" }));
    expect(await screen.findByText("Trang 2 / 3")).toBeInTheDocument();
    expect(currentParams()).toEqual({ page: "2" });
    expect(screen.getByRole("link", { name: "Nâng cấp thư viện React lên bản ổn định" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Viết tài liệu API cho module thanh toán" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sau" }));
    expect(await screen.findByText("Trang 3 / 3")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Danh sách công việc" })).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Sau" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Trước" }));
    await screen.findByText("Trang 2 / 3");
    await user.click(screen.getByRole("button", { name: "Trước" }));
    expect(await screen.findByText("Trang 1 / 3")).toBeInTheDocument();
    expect(currentParams()).toEqual({});
    expect(server.requestCount()).toBe(loaded);
  });

  test("lọc theo trạng thái: ghi ?status= lên URL, bỏ ?page=, chỉ còn công việc đang làm và không gửi thêm yêu cầu", async () => {
    const user = userEvent.setup();
    renderApp("/tasks?page=2", AN);
    await screen.findByText("Trang 2 / 3");
    const loaded = server.requestCount();
    await user.selectOptions(screen.getByLabelText("Trạng thái"), "Đang làm");
    expect(await screen.findByText("Tổng: 5 công việc")).toBeInTheDocument();
    expect(currentParams()).toEqual({ status: "doing" });
    const items = within(screen.getByRole("list", { name: "Danh sách công việc" })).getAllByRole("listitem");
    expect(items).toHaveLength(5);
    items.forEach((item) => expect(within(item).getByText("Trạng thái: Đang làm")).toBeInTheDocument());
    expect(screen.getByText("Trang 1 / 1")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Trạng thái"), "Tất cả");
    expect(await screen.findByText("Tổng: 12 công việc")).toBeInTheDocument();
    expect(currentParams()).toEqual({});
    expect(server.requestCount()).toBe(loaded);
  });

  test("lọc theo người nhận: ghi ?assignee= (mã nhân viên) lên URL và không gửi thêm yêu cầu", async () => {
    const user = userEvent.setup();
    renderApp("/tasks", AN);
    await screen.findByRole("option", { name: "Đặng Quốc Huy" });
    await screen.findByRole("list", { name: "Danh sách công việc" });
    const loaded = server.requestCount();
    await user.selectOptions(screen.getByLabelText("Người nhận"), "Đặng Quốc Huy");
    expect(await screen.findByText("Tổng: 2 công việc")).toBeInTheDocument();
    expect(currentParams()).toEqual({ assignee: "NV07" });
    const items = within(screen.getByRole("list", { name: "Danh sách công việc" })).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    items.forEach((item) => expect(within(item).getByText("Người nhận: Đặng Quốc Huy")).toBeInTheDocument());
    expect(server.requestCount()).toBe(loaded);
  });

  test("mở thẳng /tasks?status=doing&assignee=NV07&page=1: hai ô chọn đúng giá trị; số trang quá lớn về trang cuối", async () => {
    const first = renderApp("/tasks?status=doing&assignee=NV07&page=1", AN);
    expect(await screen.findByText("Tổng: 1 công việc")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Người nhận")).toHaveValue("NV07"));
    expect(screen.getByLabelText("Trạng thái")).toHaveValue("doing");
    expect(screen.getByRole("link", { name: "Tối ưu truy vấn danh sách đơn hàng" })).toBeInTheDocument();
    first.unmount();
    renderApp("/tasks?page=9", AN);
    expect(await screen.findByText("Trang 3 / 3")).toBeInTheDocument();
  });

  test("bộ lọc không có kết quả: hiện Không có công việc nào. và không hiện phân trang", async () => {
    renderApp("/tasks?status=done&assignee=NV07", AN);
    expect(await screen.findByText("Không có công việc nào.")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Danh sách công việc" })).not.toBeInTheDocument();
    expect(screen.queryByText(/^Trang \d/)).not.toBeInTheDocument();
  });

  test("máy chủ lỗi 500: báo lỗi trong role alert, không hiện danh sách; bấm Thử lại thì hiện danh sách", async () => {
    fail("GET /tasks", { status: 500, times: 1 });
    const user = userEvent.setup();
    renderApp("/tasks", AN);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(MSG_500);
    expect(alert).toHaveClass("alert", "alert-danger");
    expect(screen.queryByRole("list", { name: "Danh sách công việc" })).not.toBeInTheDocument();
    expect(screen.queryByText("Đang tải...")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByRole("list", { name: "Danh sách công việc" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(callsTo("GET /tasks")).toHaveLength(2);
    expect(callsTo("GET /employees")).toHaveLength(1);
  });
});

describe("Chi tiết công việc /tasks/:id", () => {
  test("hiện đủ thông tin; người nhận là Link tới hồ sơ nhân viên", async () => {
    renderApp("/tasks/CV01", AN);
    expect(await screen.findByRole("heading", { name: "Viết tài liệu API cho module thanh toán" })).toBeInTheDocument();
    expect(screen.getByText("Cao")).toBeInTheDocument();
    expect(screen.getByText("Trạng thái: Đang làm")).toBeInTheDocument();
    expect(screen.getByText("Hạn: 10/11/2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nguyễn Văn An" })).toHaveAttribute("href", "/employees/NV01");
    expect(screen.getByRole("button", { name: "Hoàn thành" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quay lại" })).toBeInTheDocument();
  });

  test("mã công việc không có: hiện Không tìm thấy công việc CV99", async () => {
    renderApp("/tasks/CV99", AN);
    expect(await screen.findByText("Không tìm thấy công việc CV99")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Bắt đầu" })).not.toBeInTheDocument();
  });

  test("đổi trạng thái: PUT bản ghi đầy đủ không có _id, cập nhật ngay không tải lại, còn nguyên khi dựng lại ứng dụng", async () => {
    delay("PUT /tasks/*", 300);
    const user = userEvent.setup();
    const first = renderApp("/tasks/CV02", AN);
    expect(await screen.findByText("Trạng thái: Cần làm")).toBeInTheDocument();
    const stored = server.db.tasks.find((task) => task.code === "CV02");
    await user.click(screen.getByRole("button", { name: "Bắt đầu" }));
    expect(screen.getByRole("button", { name: "Đang lưu..." })).toBeDisabled();
    expect(await screen.findByText("Trạng thái: Đang làm")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hoàn thành" })).toBeEnabled();
    const puts = callsTo("PUT /tasks/*");
    expect(puts).toHaveLength(1);
    expect(puts[0].path.endsWith(`/tasks/${stored._id}`)).toBe(true);
    expect(puts[0].body).not.toHaveProperty("_id");
    expect(puts[0].body).toEqual({
      code: "CV02",
      title: "Chuẩn bị buổi phỏng vấn ứng viên frontend",
      status: "doing",
      priority: "high",
      dueDate: "2026-11-09",
      assigneeCode: "NV02",
    });
    expect(callsTo("GET /tasks")).toHaveLength(1);
    expect(server.db.tasks.find((task) => task.code === "CV02").status).toBe("doing");
    first.unmount();
    renderApp("/tasks/CV02", AN);
    expect(await screen.findByText("Trạng thái: Đang làm")).toBeInTheDocument();
  });

  test("PUT lỗi 500: báo lỗi, giữ nguyên trạng thái cũ, bấm lại được và thành công thì mất thông báo lỗi", async () => {
    fail("PUT /tasks/*", { status: 500, times: 1 });
    const user = userEvent.setup();
    renderApp("/tasks/CV02", AN);
    await user.click(await screen.findByRole("button", { name: "Bắt đầu" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(`Không cập nhật được công việc: ${MSG_500}`);
    expect(screen.getByText("Trạng thái: Cần làm")).toBeInTheDocument();
    expect(server.db.tasks.find((task) => task.code === "CV02").status).toBe("todo");
    await user.click(screen.getByRole("button", { name: "Bắt đầu" }));
    expect(await screen.findByText("Trạng thái: Đang làm")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("Quay lại đưa về trang danh sách công việc đã mở trước đó", async () => {
    const user = userEvent.setup();
    renderApp("/tasks", AN);
    await user.click(await screen.findByRole("link", { name: "Chuẩn bị buổi phỏng vấn ứng viên frontend" }));
    expect(await screen.findByRole("heading", { name: "Chi tiết công việc" })).toBeInTheDocument();
    expect(currentPath()).toBe("/tasks/CV02");
    await user.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(await screen.findByRole("list", { name: "Danh sách công việc" })).toBeInTheDocument();
    expect(currentPath()).toBe("/tasks");
  });
});

describe("Nhân viên và hồ sơ nhân viên", () => {
  test("danh sách 8 nhân viên, mỗi tên là Link; nhân viên đã nghỉ việc không hiện lương", async () => {
    server = installCrudcrud(seedWithResignedNV04());
    renderApp("/employees", AN);
    expect(await screen.findByRole("heading", { name: "Danh sách nhân viên (8)" })).toBeInTheDocument();
    const items = within(screen.getByRole("list", { name: "Danh sách nhân viên" })).getAllByRole("listitem");
    expect(items).toHaveLength(8);
    expect(within(items[0]).getByRole("link", { name: "Nguyễn Văn An" })).toHaveAttribute("href", "/employees/NV01");
    expect(within(items[0]).getByText("Lương: 18.000.000 đ")).toBeInTheDocument();
    expect(within(items[4]).getByText("Thử việc")).toBeInTheDocument();
    expect(within(items[3]).getByRole("link", { name: "Phạm Thu Dung" })).toBeInTheDocument();
    expect(within(items[3]).getByText("Đã nghỉ việc")).toBeInTheDocument();
    expect(within(items[3]).queryByText(/Lương/)).not.toBeInTheDocument();
  });

  test("bấm tên nhân viên: hồ sơ hiện thông tin và các công việc được giao, lọc theo assigneeCode ở trình duyệt", async () => {
    const user = userEvent.setup();
    renderApp("/employees", AN);
    await user.click(await screen.findByRole("link", { name: "Nguyễn Văn An" }));
    expect(await screen.findByRole("heading", { name: "Hồ sơ nhân viên" })).toBeInTheDocument();
    expect(currentPath()).toBe("/employees/NV01");
    expect(screen.getByRole("heading", { name: "Nguyễn Văn An" })).toBeInTheDocument();
    expect(screen.getByText("an.nguyen@example.com")).toBeInTheDocument();
    expect(screen.getByText("Lương: 18.000.000 đ")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Công việc được giao (2)" })).toBeInTheDocument();
    const items = within(screen.getByRole("list", { name: "Công việc của nhân viên" })).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByRole("link", { name: "Viết tài liệu API cho module thanh toán" })).toHaveAttribute(
      "href",
      "/tasks/CV01"
    );
    expect(within(items[0]).getByText("(Đang làm)")).toBeInTheDocument();
    expect(within(items[1]).getByText("(Cần làm)")).toBeInTheDocument();
    expect(callsTo("GET /tasks")[0].query).toEqual({});
  });

  test("nhân viên chưa có công việc nào: hiện Chưa có công việc nào.", async () => {
    server = installCrudcrud(seedWithoutTasksOfNV02());
    renderApp("/employees/NV02", AN);
    expect(await screen.findByRole("heading", { name: "Trần Thị Bình" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Công việc được giao (0)" })).toBeInTheDocument();
    expect(screen.getByText("Chưa có công việc nào.")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Công việc của nhân viên" })).not.toBeInTheDocument();
  });

  test("mã nhân viên không có: hiện Không tìm thấy nhân viên NV99", async () => {
    renderApp("/employees/NV99", AN);
    expect(await screen.findByText("Không tìm thấy nhân viên NV99")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Hồ sơ nhân viên" })).not.toBeInTheDocument();
  });
});

describe("Dữ liệu dùng chung, lỗi mạng và hạn mức", () => {
  test("đi qua nhiều trang: nhân viên và công việc mỗi thứ chỉ được tải một lần", async () => {
    const user = userEvent.setup();
    renderApp("/tasks", AN);
    await screen.findByRole("list", { name: "Danh sách công việc" });
    const nav = screen.getByRole("navigation");
    await user.click(within(nav).getByRole("link", { name: "Nhân viên" }));
    await user.click(await screen.findByRole("link", { name: "Nguyễn Văn An" }));
    await screen.findByRole("heading", { name: "Hồ sơ nhân viên" });
    await user.click(await screen.findByRole("link", { name: "Viết tài liệu API cho module thanh toán" }));
    await screen.findByRole("heading", { name: "Chi tiết công việc" });
    await user.click(within(nav).getByRole("link", { name: "Công việc" }));
    await screen.findByRole("list", { name: "Danh sách công việc" });
    expect(callsTo("GET /employees")).toHaveLength(1);
    expect(callsTo("GET /tasks")).toHaveLength(1);
    expect(server.requestCount()).toBe(2);
  });

  test("đổi trạng thái xong sang trang khác thì thấy trạng thái mới, không tải lại danh sách", async () => {
    const user = userEvent.setup();
    renderApp("/tasks/CV02", AN);
    await user.click(await screen.findByRole("button", { name: "Bắt đầu" }));
    await screen.findByText("Trạng thái: Đang làm");
    await user.click(screen.getByRole("link", { name: "Trần Thị Bình" }));
    const list = await screen.findByRole("list", { name: "Công việc của nhân viên" });
    expect(within(list).getByText("(Đang làm)")).toBeInTheDocument();
    await user.click(within(screen.getByRole("navigation")).getByRole("link", { name: "Công việc" }));
    const tasks = await screen.findByRole("list", { name: "Danh sách công việc" });
    expect(within(tasks).getAllByText("Trạng thái: Đang làm")).toHaveLength(3);
    expect(callsTo("GET /tasks")).toHaveLength(1);
    expect(callsTo("PUT /tasks/*")).toHaveLength(1);
    expect(server.requestCount()).toBe(3);
  });

  test("mất mạng khi tải công việc: báo lỗi chung có nút Thử lại; bấm lại thì hiện danh sách", async () => {
    networkError("GET /tasks", 1);
    const user = userEvent.setup();
    renderApp("/tasks", AN);
    expect(await screen.findByRole("alert")).toHaveTextContent(MSG_OFFLINE);
    expect(screen.queryByRole("list", { name: "Danh sách công việc" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByRole("list", { name: "Danh sách công việc" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("vượt hạn mức yêu cầu của endpoint: báo lỗi chung, không treo ở Đang tải...", async () => {
    server = installCrudcrud(seed, { quota: 1 });
    renderApp("/tasks", AN);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(MSG_OFFLINE);
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeInTheDocument();
    expect(screen.queryByText("Đang tải...")).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Danh sách công việc" })).not.toBeInTheDocument();
  });
});
