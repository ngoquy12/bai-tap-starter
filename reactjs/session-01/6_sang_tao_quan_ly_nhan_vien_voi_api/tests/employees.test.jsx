import { StrictMode } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import seed from "../db.seed.json";
import App from "../src/App.jsx";
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from "../src/api/employees.js";
import http, { getErrorMessage } from "../src/api/http.js";
import { API_BASE } from "../src/config.js";
import { EmployeesProvider } from "../src/context/EmployeesContext.jsx";
import useEmployee from "../src/hooks/useEmployee.js";
import useEmployees from "../src/hooks/useEmployees.js";
import { installCrudcrud } from "./crudcrud-fake.js";

// Máy chủ giả (crudcrud, ghi thật trong bộ nhớ) được cài lại trước MỖI test; luật lỗi/độ trễ đặt trong từng test.
let server;
beforeEach(() => {
  server = installCrudcrud(seed);
});

// Đường dẫn trong nhật ký có dạng /api/<endpoint>/employees, nên luật và bộ lọc nhật ký viết "GET /employees"
// được đổi thành "GET /api/*/employees" trước khi đưa cho window.mockApi.
const full = (route) => route.replace(" /", " /api/*/");
const api = () => ({
  calls: window.mockApi.calls,
  callsTo: (route) => window.mockApi.callsTo(full(route)),
  fail: (route, options) => window.mockApi.fail(full(route), options),
  networkError: (route, times) => window.mockApi.networkError(full(route), times),
  delay: (route, ms, times) => window.mockApi.delay(full(route), ms, times),
});

const MSG_404 = "Không tìm thấy dữ liệu (404).";
const MSG_500 = "Máy chủ đang gặp sự cố, hãy thử lại sau.";
const MSG_400 = "Yêu cầu không hợp lệ.";
const MSG_NETWORK =
  "Không kết nối được máy chủ. Hãy kiểm tra mạng; nếu endpoint đã quá 100 yêu cầu hoặc quá 24 giờ, hãy lấy endpoint mới ở crudcrud.com.";

// Số yêu cầu GET lấy cả danh sách nhân viên đã gửi (không tính GET một bản ghi).
const listGets = () => api().callsTo("GET /employees").length;
// _id do máy chủ giả cấp cho nhân viên thứ n (bắt đầu từ 1) trong dữ liệu mẫu.
const idOf = (n) => server.db.employees[n - 1]._id;

// Bắt lỗi axios thật mà bản giả sinh ra để đưa vào getErrorMessage.
async function catchError(promise) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("yêu cầu lẽ ra phải thất bại");
}

function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

// Khung thử hook useEmployees: hiện trạng thái ra DOM để test đọc.
function ListProbe() {
  const { employees, loading, error, reload } = useEmployees();
  return (
    <div>
      <span data-testid="state">{loading ? "loading" : "idle"}</span>
      <span data-testid="count">{employees.length}</span>
      <span data-testid="first">{employees.length > 0 ? employees[0].name : "-"}</span>
      <span data-testid="first-id">{employees.length > 0 ? employees[0]._id : "-"}</span>
      <span data-testid="error">{error || ""}</span>
      <button onClick={reload}>probe-reload</button>
    </div>
  );
}

// Khung thử hook useEmployee: cần EmployeesProvider bao ngoài để có danh sách dùng chung.
function OneProbe({ id }) {
  const { employee, loading, error, notFound } = useEmployee(id);
  return (
    <div>
      <span data-testid="state">{loading ? "loading" : "idle"}</span>
      <span data-testid="name">{employee ? employee.name : "-"}</span>
      <span data-testid="error">{error || ""}</span>
      <span data-testid="notfound">{notFound ? "yes" : "no"}</span>
    </div>
  );
}

async function fillCreateForm(user, { name, email, position, salary }) {
  await user.type(screen.getByLabelText("Họ tên"), name);
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Vị trí"), position);
  await user.clear(screen.getByLabelText("Lương"));
  await user.type(screen.getByLabelText("Lương"), String(salary));
}

const NEW_PERSON = { name: "Phan Minh Tuấn", email: "tuan.phan@example.com", position: "Lập trình viên", salary: 20000000 };
const NEW_BODY = {
  name: "Phan Minh Tuấn",
  email: "tuan.phan@example.com",
  department: "Kỹ thuật",
  position: "Lập trình viên",
  salary: 20000000,
  city: "Hà Nội",
  status: "active",
  joinedAt: "2026-11-06",
};

describe("Lớp API: http và getErrorMessage", () => {
  it("http dùng API_BASE làm baseURL; getErrorMessage đổi 404, 4xx khác, 5xx và mất mạng thành thông báo tiếng Việt", async () => {
    expect(http.defaults.baseURL).toBe(API_BASE);
    expect(getErrorMessage(await catchError(http.get(`/employees/${"a".repeat(24)}`)))).toBe(MSG_404);
    api().fail("GET /employees", { status: 400, body: {} });
    expect(getErrorMessage(await catchError(http.get("/employees")))).toBe(MSG_400);
    api().fail("GET /employees", { status: 422, body: {} });
    expect(getErrorMessage(await catchError(http.get("/employees")))).toBe(MSG_400);
    api().fail("GET /employees", { status: 500, body: {} });
    expect(getErrorMessage(await catchError(http.get("/employees")))).toBe(MSG_500);
    api().fail("GET /employees", { status: 504, body: {} });
    expect(getErrorMessage(await catchError(http.get("/employees")))).toBe(MSG_500);
    api().networkError("GET /employees");
    expect(getErrorMessage(await catchError(http.get("/employees")))).toBe(MSG_NETWORK);
  });
});

describe("Lớp API: các hàm trong employees.js", () => {
  it("getEmployees gửi một GET /employees không kèm tham số và trả mảng 12 nhân viên, mỗi người có _id", async () => {
    const employees = await getEmployees();
    expect(employees).toHaveLength(12);
    expect(employees[0].name).toBe("Nguyễn Văn An");
    expect(employees[0]._id).toMatch(/^[a-f0-9]{24}$/);
    const calls = api().callsTo("GET /employees");
    expect(calls).toHaveLength(1);
    expect(calls[0].query).toEqual({});
  });

  it("createEmployee gửi POST /employees với đúng dữ liệu và trả bản ghi có _id do máy chủ cấp", async () => {
    const created = await createEmployee(NEW_BODY);
    expect(created).toEqual({ ...NEW_BODY, _id: expect.stringMatching(/^[a-f0-9]{24}$/) });
    const calls = api().callsTo("POST /employees");
    expect(calls).toHaveLength(1);
    expect(calls[0].body).toEqual(NEW_BODY);
    expect(server.db.employees).toHaveLength(13);
  });

  it("updateEmployee gửi PUT /employees/<_id> với cả bản ghi nhưng KHÔNG có _id trong thân, và trả lại bản ghi đã sửa", async () => {
    const original = server.db.employees[0];
    const edited = { ...original, position: "Trưởng nhóm kỹ thuật", salary: 21000000 };
    const result = await updateEmployee(edited);
    expect(result).toEqual(edited);
    const calls = api().callsTo(`PUT /employees/${original._id}`);
    expect(calls).toHaveLength(1);
    expect(calls[0].body).not.toHaveProperty("_id");
    const { _id, ...rest } = edited;
    expect(calls[0].body).toEqual(rest);
    expect(calls[0].body.code).toBe("NV01");
    expect(server.db.employees[0]).toEqual(edited);
    expect(api().callsTo("PATCH /employees/*")).toHaveLength(0);
  });

  it("deleteEmployee gửi DELETE /employees/<_id> và bản ghi không còn trên máy chủ", async () => {
    const id = idOf(2);
    await deleteEmployee(id);
    expect(api().callsTo(`DELETE /employees/${id}`)).toHaveLength(1);
    expect(server.db.employees).toHaveLength(11);
    const error = await catchError(http.get(`/employees/${id}`));
    expect(error.response.status).toBe(404);
  });
});

describe("Hook useEmployees và useEmployee", () => {
  it("useEmployees bắt đầu ở trạng thái đang tải rồi có 12 nhân viên, không hiện lỗi hủy khi bọc StrictMode", async () => {
    render(
      <StrictMode>
        <ListProbe />
      </StrictMode>
    );
    expect(screen.getByTestId("state")).toHaveTextContent("loading");
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("idle"));
    expect(screen.getByTestId("count")).toHaveTextContent("12");
    expect(screen.getByTestId("first")).toHaveTextContent("Nguyễn Văn An");
    expect(screen.getByTestId("first-id")).toHaveTextContent(/^[a-f0-9]{24}$/);
    expect(screen.getByTestId("error")).toHaveTextContent("");
  });

  it("useEmployees hủy yêu cầu đang bay bằng signal khi bị gỡ khỏi màn hình", async () => {
    const spy = vi.spyOn(http, "get");
    api().delay("GET /employees", 200);
    const { unmount } = render(<ListProbe />);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    expect(spy.mock.calls[0][1].signal.aborted).toBe(false);
    unmount();
    expect(spy.mock.calls[0][1].signal.aborted).toBe(true);
    spy.mockRestore();
  });

  it("useEmployees báo lỗi 500 bằng thông báo tiếng Việt và reload() gọi lại để xóa lỗi", async () => {
    api().fail("GET /employees", { status: 500, body: {}, times: 1 });
    render(<ListProbe />);
    await waitFor(() => expect(screen.getByTestId("error")).toHaveTextContent(MSG_500));
    expect(screen.getByTestId("state")).toHaveTextContent("idle");
    fireEvent.click(screen.getByText("probe-reload"));
    await waitFor(() => expect(screen.getByTestId("first")).toHaveTextContent("Nguyễn Văn An"));
    expect(screen.getByTestId("error")).toHaveTextContent("");
    expect(listGets()).toBe(2);
  });

  it("useEmployee tìm nhân viên theo _id trong danh sách đã tải; _id không có cho notFound sau khi tải xong", async () => {
    const id = idOf(1);
    const { rerender } = render(
      <EmployeesProvider>
        <OneProbe id={id} />
      </EmployeesProvider>
    );
    expect(screen.getByTestId("state")).toHaveTextContent("loading");
    expect(screen.getByTestId("notfound")).toHaveTextContent("no");
    await waitFor(() => expect(screen.getByTestId("name")).toHaveTextContent("Nguyễn Văn An"));
    expect(screen.getByTestId("notfound")).toHaveTextContent("no");
    rerender(
      <EmployeesProvider>
        <OneProbe id="999" />
      </EmployeesProvider>
    );
    await waitFor(() => expect(screen.getByTestId("notfound")).toHaveTextContent("yes"));
    expect(screen.getByTestId("name")).toHaveTextContent("-");
    expect(screen.getByTestId("state")).toHaveTextContent("idle");
    expect(listGets()).toBe(1);
    expect(api().callsTo(`GET /employees/${id}`)).toHaveLength(0);
  });
});

describe("Tải một lần và tiết kiệm hạn mức yêu cầu", () => {
  it("vào ứng dụng chỉ gửi đúng một GET danh sách; gõ tìm kiếm, lọc, đổi trang không gửi thêm yêu cầu nào", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp("/");
    await screen.findByText("Nguyễn Văn An");
    expect(listGets()).toBe(1);
    await user.type(screen.getByLabelText("Tìm kiếm"), "binh");
    await screen.findByText("Tổng cộng 1 nhân viên");
    await user.clear(screen.getByLabelText("Tìm kiếm"));
    await user.selectOptions(screen.getByLabelText("Phòng ban"), "Kỹ thuật");
    await screen.findByText("Tổng cộng 4 nhân viên");
    await user.selectOptions(screen.getByLabelText("Phòng ban"), "");
    await user.click(screen.getByRole("button", { name: "Sau" }));
    await screen.findByText("Trang 2 / 3");
    expect(server.requestCount()).toBe(1);
    expect(api().calls).toHaveLength(1);
  });

  it("đi từ danh sách vào trang chi tiết, trang sửa rồi quay lại vẫn chỉ có một GET danh sách và không có GET một bản ghi", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp("/");
    await user.click(await screen.findByRole("link", { name: "Hoàng Minh Đức" }));
    expect(await screen.findByRole("heading", { name: "Hoàng Minh Đức" })).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Sửa nhân viên" }));
    expect(await screen.findByLabelText("Họ tên")).toHaveValue("Hoàng Minh Đức");
    await user.click(screen.getByRole("link", { name: "Hủy" }));
    await user.click(await screen.findByRole("link", { name: "Quay lại danh sách" }));
    expect(await screen.findByText("Tổng cộng 12 nhân viên")).toBeInTheDocument();
    expect(listGets()).toBe(1);
    expect(server.requestCount()).toBe(1);
  });

  it("mỗi thao tác thêm, sửa, xóa chỉ gửi đúng một yêu cầu ghi và không kéo theo GET danh sách", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp("/employees/new");
    await fillCreateForm(user, NEW_PERSON);
    await user.click(screen.getByRole("button", { name: "Lưu nhân viên" }));
    await screen.findByRole("heading", { name: "Phan Minh Tuấn" });
    expect(server.requestCount()).toBe(2);
    await user.click(screen.getByRole("link", { name: "Sửa nhân viên" }));
    const position = await screen.findByLabelText("Vị trí");
    await user.clear(position);
    await user.type(position, "Trưởng nhóm kỹ thuật");
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    await screen.findByText("Trưởng nhóm kỹ thuật - Kỹ thuật");
    expect(server.requestCount()).toBe(3);
    await user.click(screen.getByRole("button", { name: "Xóa nhân viên" }));
    await screen.findByText("Đã xóa nhân viên Phan Minh Tuấn.");
    expect(server.requestCount()).toBe(4);
    expect(listGets()).toBe(1);
    expect(api().callsTo("POST /employees")).toHaveLength(1);
    expect(api().calls.filter((call) => call.method === "PUT")).toHaveLength(1);
    expect(api().calls.filter((call) => call.method === "DELETE")).toHaveLength(1);
  }, 20000);
});

describe("Trang danh sách: tìm kiếm, lọc và phân trang", () => {
  it("hiện Đang tải... rồi 5 nhân viên đầu tiên, Trang 1 / 3, tổng 12 và nút Trước bị vô hiệu", async () => {
    renderApp("/");
    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
    expect(document.querySelector(".spinner-border")).toBeInTheDocument();
    expect(await screen.findByText("Nguyễn Văn An")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Danh sách nhân viên" })).getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByText("Hoàng Minh Đức")).toBeInTheDocument();
    expect(screen.queryByText("Vũ Ngọc Hà")).not.toBeInTheDocument();
    expect(screen.getByText("Tổng cộng 12 nhân viên")).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 3")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Phân trang" }).querySelector("ul")).toHaveClass("pagination");
    expect(screen.getByRole("button", { name: "Trước" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sau" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Nguyễn Văn An" })).toHaveAttribute("href", `/employees/${idOf(1)}`);
  });

  it("bấm Sau và Trước đổi trang đúng; trang cuối có 2 nhân viên và nút Sau bị vô hiệu", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp("/");
    await screen.findByText("Nguyễn Văn An");
    await user.click(screen.getByRole("button", { name: "Sau" }));
    expect(await screen.findByText("Vũ Ngọc Hà")).toBeInTheDocument();
    expect(screen.getByText("Trang 2 / 3")).toBeInTheDocument();
    expect(screen.queryByText("Nguyễn Văn An")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sau" }));
    expect(await screen.findByText("Lý Tuấn Anh")).toBeInTheDocument();
    expect(screen.getByText("Trang 3 / 3")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Danh sách nhân viên" })).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Sau" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Trước" }));
    expect(await screen.findByText("Vũ Ngọc Hà")).toBeInTheDocument();
    expect(screen.getByText("Trang 2 / 3")).toBeInTheDocument();
  });

  it("gõ từ khóa ở Trang 2 thì về trang 1 và lọc ngay trên danh sách đã tải; từ khóa toàn dấu cách không lọc gì", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp("/?page=2");
    expect(await screen.findByText("Vũ Ngọc Hà")).toBeInTheDocument();
    const input = screen.getByLabelText("Tìm kiếm");
    await user.type(input, "a");
    expect(await screen.findByText("Trang 1 / 3")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Văn An")).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "binh");
    expect(await screen.findByText("Tổng cộng 1 nhân viên")).toBeInTheDocument();
    expect(screen.getByText("Trần Thị Bình")).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 1")).toBeInTheDocument();
    expect(input).toHaveValue("binh");
    await user.clear(input);
    await user.type(input, "  BINH  ");
    expect(await screen.findByText("Tổng cộng 1 nhân viên")).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "   ");
    expect(await screen.findByText("Tổng cộng 12 nhân viên")).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 3")).toBeInTheDocument();
  });

  it("chọn phòng ban ở Trang 2 thì về trang 1 và chỉ còn nhân viên của phòng đó; kết hợp được với từ khóa", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp("/?page=2");
    await screen.findByText("Vũ Ngọc Hà");
    await user.selectOptions(screen.getByLabelText("Phòng ban"), "Kỹ thuật");
    expect(await screen.findByText("Tổng cộng 4 nhân viên")).toBeInTheDocument();
    expect(screen.getByText("Lý Tuấn Anh")).toBeInTheDocument();
    expect(screen.getByText("Đặng Quốc Huy")).toBeInTheDocument();
    expect(screen.queryByText("Trần Thị Bình")).not.toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 1")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Tìm kiếm"), "duc");
    expect(await screen.findByText("Tổng cộng 1 nhân viên")).toBeInTheDocument();
    expect(screen.getByText("Hoàng Minh Đức")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Phòng ban"), "Nhân sự");
    expect(await screen.findByText("Không có nhân viên phù hợp.")).toBeInTheDocument();
  });

  it("không có kết quả hiện Không có nhân viên phù hợp. với hai nút phân trang bị vô hiệu; trang trên địa chỉ sai được chỉnh về khoảng hợp lệ", async () => {
    const user = userEvent.setup({ delay: null });
    const first = renderApp("/");
    await screen.findByText("Nguyễn Văn An");
    await user.type(screen.getByLabelText("Tìm kiếm"), "zzz");
    expect(await screen.findByText("Không có nhân viên phù hợp.")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Danh sách nhân viên" })).not.toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trước" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sau" })).toBeDisabled();
    first.unmount();
    const second = renderApp("/?page=99");
    expect(await screen.findByText("Trang 3 / 3")).toBeInTheDocument();
    expect(screen.getByText("Lý Tuấn Anh")).toBeInTheDocument();
    second.unmount();
    renderApp("/?page=abc");
    expect(await screen.findByText("Trang 1 / 3")).toBeInTheDocument();
  });
});

describe("Lỗi mạng, lỗi máy chủ và vượt hạn mức", () => {
  it("mất mạng hiện thông báo trong role=alert và nút Thử lại gọi lại để hiện danh sách", async () => {
    const user = userEvent.setup({ delay: null });
    api().networkError("GET /employees", 1);
    renderApp("/");
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(MSG_NETWORK);
    expect(alert).toHaveClass("alert", "alert-danger");
    expect(screen.queryByText("Đang tải...")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("Nguyễn Văn An")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(listGets()).toBe(2);
  });

  it("máy chủ lỗi 500 khi tải danh sách hiện thông báo chung trong role=alert, không treo ở Đang tải..., và Thử lại hoạt động", async () => {
    const user = userEvent.setup({ delay: null });
    api().fail("GET /employees", { status: 500, body: {}, times: 1 });
    renderApp("/");
    expect(await screen.findByRole("alert")).toHaveTextContent(MSG_500);
    expect(screen.queryByText("Đang tải...")).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Danh sách nhân viên" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("Tổng cộng 12 nhân viên")).toBeInTheDocument();
  });

  it("endpoint đã hết hạn mức: lần tải danh sách hiện lỗi trong role=alert kèm Thử lại, không treo; có endpoint mới thì tải được", async () => {
    const user = userEvent.setup({ delay: null });
    server = installCrudcrud(seed, { quota: 0 });
    renderApp("/");
    expect(await screen.findByRole("alert")).toHaveTextContent(MSG_400);
    expect(screen.queryByText("Đang tải...")).not.toBeInTheDocument();
    server = installCrudcrud(seed);
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("Tổng cộng 12 nhân viên")).toBeInTheDocument();
  });

  it("hết hạn mức đúng lúc ghi: trang thêm hiện lỗi trong role=alert, giữ nguyên dữ liệu đã nhập và nút lưu dùng lại được", async () => {
    const user = userEvent.setup({ delay: null });
    server = installCrudcrud(seed, { quota: 1 });
    renderApp("/employees/new");
    await fillCreateForm(user, NEW_PERSON);
    await user.click(screen.getByRole("button", { name: "Lưu nhân viên" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(MSG_400);
    expect(screen.getByLabelText("Họ tên")).toHaveValue("Phan Minh Tuấn");
    expect(screen.getByRole("button", { name: "Lưu nhân viên" })).toBeEnabled();
    expect(server.db.employees).toHaveLength(12);
  }, 20000);
});

describe("Trang chi tiết và xóa nhân viên", () => {
  it("hiện đủ thông tin của nhân viên theo _id trên địa chỉ, kèm liên kết sửa, nút xóa và liên kết quay lại", async () => {
    renderApp(`/employees/${idOf(1)}`);
    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Nguyễn Văn An" })).toBeInTheDocument();
    expect(screen.getByText("Đang làm việc")).toBeInTheDocument();
    expect(screen.getByText("Lập trình viên - Kỹ thuật")).toBeInTheDocument();
    expect(screen.getByText("Email: an.nguyen@example.com")).toBeInTheDocument();
    expect(screen.getByText("Lương: 18.000.000 đ")).toBeInTheDocument();
    expect(screen.getByText("Thành phố: Hà Nội")).toBeInTheDocument();
    expect(screen.getByText("Vào làm: 14/03/2022")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sửa nhân viên" })).toHaveAttribute("href", `/employees/${idOf(1)}/edit`);
    expect(screen.getByRole("link", { name: "Quay lại danh sách" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Xóa nhân viên" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Xóa nhân viên" })).toHaveClass("btn", "btn-danger");
  });

  it("_id không tồn tại hiện Không tìm thấy nhân viên <id> ở cả trang chi tiết và trang sửa, sau khi danh sách đã tải xong", async () => {
    const { unmount } = renderApp("/employees/999");
    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
    expect(await screen.findByRole("alert")).toHaveTextContent("Không tìm thấy nhân viên 999");
    expect(screen.queryByRole("button", { name: "Xóa nhân viên" })).not.toBeInTheDocument();
    unmount();
    renderApp("/employees/999/edit");
    expect(await screen.findByRole("alert")).toHaveTextContent("Không tìm thấy nhân viên 999");
  });

  it("bấm Xóa nhân viên gửi DELETE theo _id, về danh sách với thông báo Đã xóa nhân viên <tên>. và danh sách còn 11", async () => {
    const user = userEvent.setup({ delay: null });
    const id = idOf(2);
    renderApp(`/employees/${id}`);
    await user.click(await screen.findByRole("button", { name: "Xóa nhân viên" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Đã xóa nhân viên Trần Thị Bình.");
    expect(await screen.findByText("Tổng cộng 11 nhân viên")).toBeInTheDocument();
    expect(screen.queryByText("Trần Thị Bình", { selector: "a" })).not.toBeInTheDocument();
    expect(api().callsTo(`DELETE /employees/${id}`)).toHaveLength(1);
    expect(server.db.employees.some((e) => e._id === id)).toBe(false);
  });

  it("khi xóa: nút là Đang xóa... và bị vô hiệu; máy chủ lỗi 500 thì ở lại trang, hiện lỗi và nút xóa dùng lại được", async () => {
    const user = userEvent.setup({ delay: null });
    const id = idOf(3);
    api().delay(`DELETE /employees/${id}`, 100);
    api().fail(`DELETE /employees/${id}`, { status: 500, body: {}, times: 1 });
    renderApp(`/employees/${id}`);
    await user.click(await screen.findByRole("button", { name: "Xóa nhân viên" }));
    expect(screen.getByRole("button", { name: "Đang xóa..." })).toBeDisabled();
    expect(await screen.findByRole("alert")).toHaveTextContent(MSG_500);
    expect(screen.getByRole("heading", { name: "Lê Hoàng Cường" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa nhân viên" })).toBeEnabled();
    expect(server.db.employees).toHaveLength(12);
  });
});

describe("Trang thêm nhân viên", () => {
  it("điền form và bấm Lưu nhân viên gửi một POST đúng dữ liệu, rồi chuyển tới trang chi tiết của bản ghi mới (_id do máy chủ cấp)", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp("/employees/new");
    expect(screen.getByRole("heading", { name: "Thêm nhân viên mới" })).toBeInTheDocument();
    await fillCreateForm(user, NEW_PERSON);
    await user.click(screen.getByRole("button", { name: "Lưu nhân viên" }));
    expect(await screen.findByRole("heading", { name: "Phan Minh Tuấn" })).toBeInTheDocument();
    expect(screen.getByText("Lương: 20.000.000 đ")).toBeInTheDocument();
    const calls = api().callsTo("POST /employees");
    expect(calls).toHaveLength(1);
    expect(calls[0].body).toEqual(NEW_BODY);
    const created = server.db.employees.at(-1);
    expect(created.name).toBe("Phan Minh Tuấn");
    expect(screen.getByRole("link", { name: "Sửa nhân viên" })).toHaveAttribute("href", `/employees/${created._id}/edit`);
    await user.click(screen.getByRole("link", { name: "Quay lại danh sách" }));
    expect(await screen.findByText("Tổng cộng 13 nhân viên")).toBeInTheDocument();
  }, 20000);

  it("khi chờ nút là Đang lưu... và bị vô hiệu; lỗi 500 hiện trong role=alert, giữ nguyên dữ liệu đã nhập và cho gửi lại", async () => {
    const user = userEvent.setup({ delay: null });
    api().delay("POST /employees", 100);
    api().fail("POST /employees", { status: 500, body: {}, times: 1 });
    renderApp("/employees/new");
    await fillCreateForm(user, NEW_PERSON);
    await user.click(screen.getByRole("button", { name: "Lưu nhân viên" }));
    expect(screen.getByRole("button", { name: "Đang lưu..." })).toBeDisabled();
    expect(await screen.findByRole("alert")).toHaveTextContent(MSG_500);
    expect(screen.getByLabelText("Họ tên")).toHaveValue("Phan Minh Tuấn");
    expect(server.db.employees).toHaveLength(12);
    await user.click(screen.getByRole("button", { name: "Lưu nhân viên" }));
    expect(await screen.findByRole("heading", { name: "Phan Minh Tuấn" })).toBeInTheDocument();
    expect(server.db.employees).toHaveLength(13);
  }, 20000);
});

describe("Trang sửa nhân viên", () => {
  it("form có sẵn dữ liệu cũ; không đổi gì thì không gửi yêu cầu; có đổi thì PUT cả bản ghi, không có _id trong thân", async () => {
    const user = userEvent.setup({ delay: null });
    const id = idOf(1);
    renderApp(`/employees/${id}/edit`);
    expect(await screen.findByLabelText("Họ tên")).toHaveValue("Nguyễn Văn An");
    expect(screen.getByLabelText("Lương")).toHaveValue("18000000");
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    expect(screen.getByRole("status")).toHaveTextContent("Chưa có thay đổi nào để lưu.");
    expect(api().calls.filter((call) => call.method === "PUT")).toHaveLength(0);
    await user.clear(screen.getByLabelText("Vị trí"));
    await user.type(screen.getByLabelText("Vị trí"), "Trưởng nhóm kỹ thuật");
    await user.clear(screen.getByLabelText("Lương"));
    await user.type(screen.getByLabelText("Lương"), "21000000");
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    expect(await screen.findByText("Lương: 21.000.000 đ")).toBeInTheDocument();
    expect(screen.getByText("Trưởng nhóm kỹ thuật - Kỹ thuật")).toBeInTheDocument();
    const calls = api().callsTo(`PUT /employees/${id}`);
    expect(calls).toHaveLength(1);
    expect(calls[0].body).not.toHaveProperty("_id");
    expect(calls[0].body).toEqual({
      code: "NV01",
      name: "Nguyễn Văn An",
      email: "an.nguyen@example.com",
      department: "Kỹ thuật",
      position: "Trưởng nhóm kỹ thuật",
      salary: 21000000,
      city: "Hà Nội",
      status: "active",
      joinedAt: "2022-03-14",
    });
    expect(server.db.employees[0].code).toBe("NV01");
  }, 20000);

  it("khi chờ nút là Đang lưu... và bị vô hiệu; PUT lỗi 500 hiện lỗi, giữ form và bản ghi cũ trên máy chủ không đổi", async () => {
    const user = userEvent.setup({ delay: null });
    const id = idOf(4);
    api().delay(`PUT /employees/${id}`, 100);
    api().fail(`PUT /employees/${id}`, { status: 500, times: 1 });
    renderApp(`/employees/${id}/edit`);
    const position = await screen.findByLabelText("Vị trí");
    await user.clear(position);
    await user.type(position, "Kế toán trưởng");
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    expect(screen.getByRole("button", { name: "Đang lưu..." })).toBeDisabled();
    expect(await screen.findByRole("alert")).toHaveTextContent(MSG_500);
    expect(screen.getByLabelText("Vị trí")).toHaveValue("Kế toán trưởng");
    expect(server.db.employees[3].position).toBe("Kế toán tổng hợp");
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    expect(await screen.findByText("Kế toán trưởng - Kế toán")).toBeInTheDocument();
  }, 20000);
});

describe("Dữ liệu được lưu thật trên máy chủ", () => {
  it("thêm, sửa, xóa rồi gỡ và dựng lại ứng dụng (như tải lại trang) vẫn thấy dữ liệu mới", async () => {
    const user = userEvent.setup({ delay: null });
    // Thêm: dựng lại ứng dụng ở trang chi tiết bản ghi mới và ở danh sách.
    let view = renderApp("/employees/new");
    await fillCreateForm(user, NEW_PERSON);
    await user.click(screen.getByRole("button", { name: "Lưu nhân viên" }));
    await screen.findByRole("heading", { name: "Phan Minh Tuấn" });
    const newId = server.db.employees.at(-1)._id;
    view.unmount();
    view = renderApp(`/employees/${newId}`);
    expect(await screen.findByRole("heading", { name: "Phan Minh Tuấn" })).toBeInTheDocument();
    view.unmount();
    view = renderApp("/?page=3");
    expect(await screen.findByText("Phan Minh Tuấn")).toBeInTheDocument();
    expect(screen.getByText("Tổng cộng 13 nhân viên")).toBeInTheDocument();
    view.unmount();
    // Sửa: đổi vị trí rồi dựng lại.
    view = renderApp(`/employees/${newId}/edit`);
    const position = await screen.findByLabelText("Vị trí");
    await user.clear(position);
    await user.type(position, "Trưởng nhóm kỹ thuật");
    await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    await screen.findByRole("heading", { name: "Phan Minh Tuấn" });
    view.unmount();
    view = renderApp(`/employees/${newId}`);
    expect(await screen.findByText("Trưởng nhóm kỹ thuật - Kỹ thuật")).toBeInTheDocument();
    // Xóa: dựng lại ở danh sách và ở địa chỉ cũ của bản ghi đã xóa.
    await user.click(screen.getByRole("button", { name: "Xóa nhân viên" }));
    await screen.findByText("Đã xóa nhân viên Phan Minh Tuấn.");
    view.unmount();
    view = renderApp("/");
    expect(await screen.findByText("Tổng cộng 12 nhân viên")).toBeInTheDocument();
    view.unmount();
    renderApp(`/employees/${newId}`);
    expect(await screen.findByRole("alert")).toHaveTextContent(`Không tìm thấy nhân viên ${newId}`);
    expect(within(document.body).queryByText("Phan Minh Tuấn")).not.toBeInTheDocument();
  }, 20000);
});
