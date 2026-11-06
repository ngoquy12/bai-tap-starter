import { configure, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import seed from "../db.seed.json";
import { installCrudcrud } from "./crudcrud-fake.js";
import TaskManager from "../src/components/TaskManager.jsx";

// Mỗi test dựng lại ứng dụng và gõ chữ thật nên cho thời gian rộng hơn mặc định (test 5 giây, chờ findBy 1 giây).
vi.setConfig({ testTimeout: 20000 });
configure({ asyncUtilTimeout: 5000 });

let server;

beforeEach(() => {
  server = installCrudcrud(seed);
});

// Dòng (li) của một công việc theo tiêu đề.
function rowOf(title) {
  return screen.getByRole("heading", { name: title }).closest("li");
}

// Số yêu cầu GET */tasks đã gửi tới "máy chủ".
function tasksReads() {
  return window.mockApi.callsTo("GET */tasks").length;
}

// Điền form thêm công việc (người nhận và độ ưu tiên chỉ chọn khi truyền vào).
async function fillForm(user, { title, priority, assignee, dueDate = "2026-11-20" }) {
  await user.type(screen.getByLabelText("Tên công việc"), title);
  if (priority) await user.selectOptions(screen.getByLabelText("Độ ưu tiên"), priority);
  if (assignee) await user.selectOptions(screen.getByLabelText("Người nhận"), assignee);
  fireEvent.change(screen.getByLabelText("Hạn hoàn thành"), { target: { value: dueDate } });
}

const NETWORK_MESSAGE = /Không kết nối được máy chủ API\. Hãy kiểm tra mạng; nếu endpoint đã dùng quá 100 yêu cầu hoặc quá 24 giờ, hãy lấy endpoint mới ở crudcrud\.com\./;

const T1 = "Viết tài liệu API cho module thanh toán";
const T2 = "Chuẩn bị buổi phỏng vấn ứng viên frontend";
const T3 = "Đối soát hóa đơn tháng 10";
const T6 = "Kiểm thử chức năng đăng nhập";
const T9 = "Nâng cấp thư viện React lên bản ổn định";
const T11 = "Tối ưu truy vấn danh sách đơn hàng";

describe("TaskManager: tải, phân trang, lọc và tìm kiếm", () => {
  test("tải lần đầu: hiện Đang tải công việc..., rồi 5 công việc, tổng, Trang 1 / 3 và tên người nhận; đúng một GET mỗi tài nguyên", async () => {
    render(<TaskManager />);
    expect(screen.getByText("Đang tải công việc...")).toBeInTheDocument();
    expect(document.querySelector(".spinner-border")).toBeInTheDocument();
    expect(await screen.findByText(T1)).toBeInTheDocument();
    expect(screen.queryByText("Đang tải công việc...")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByText("Tìm thấy 12 công việc")).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 3")).toBeInTheDocument();
    expect(await within(rowOf(T1)).findByText("Người nhận: Nguyễn Văn An | Hạn: 10/11/2026")).toBeInTheDocument();
    expect(tasksReads()).toBe(1);
    expect(window.mockApi.callsTo("GET */employees")).toHaveLength(1);
    expect(server.requestCount()).toBe(2);
  });

  test("Sau và Trước đổi trang ngay ở trình duyệt: hiện đúng hàng, nút vô hiệu ở trang đầu và cuối, không gửi yêu cầu mới", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TaskManager />);
    await screen.findByText(T1);
    expect(screen.getByRole("button", { name: "Trước" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Sau" }));
    expect(await screen.findByText(T6)).toBeInTheDocument();
    expect(screen.queryByText(T1)).not.toBeInTheDocument();
    expect(screen.getByText("Trang 2 / 3")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: "Sau" }));
    expect(await screen.findByText("Trang 3 / 3")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText(T11)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sau" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Trước" }));
    expect(await screen.findByText("Trang 2 / 3")).toBeInTheDocument();
    expect(server.requestCount()).toBe(2);
  });

  test("lọc theo trạng thái ở trình duyệt: về trang 1, cập nhật tổng và số trang, không gửi yêu cầu mới", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TaskManager />);
    await screen.findByText(T1);
    await user.click(screen.getByRole("button", { name: "Sau" }));
    await screen.findByText("Trang 2 / 3");
    await user.selectOptions(screen.getByLabelText("Trạng thái"), "Đang làm");
    expect(await screen.findByText("Tìm thấy 5 công việc")).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 1")).toBeInTheDocument();
    expect(screen.getAllByText("Trạng thái: Đang làm")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Sau" })).toBeDisabled();
    expect(server.requestCount()).toBe(2);
  });

  test("ô Tìm công việc: lọc theo tên không phân biệt hoa thường, đang ở trang 2 thì về trang 1, gõ nhiều chữ vẫn không gửi yêu cầu nào", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TaskManager />);
    await screen.findByText(T1);
    await user.click(screen.getByRole("button", { name: "Sau" }));
    await screen.findByText("Trang 2 / 3");
    await user.type(screen.getByLabelText("Tìm công việc"), "ng");
    expect(await screen.findByText("Tìm thấy 11 công việc")).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 3")).toBeInTheDocument();
    expect(screen.getByText(T2)).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Tìm công việc"));
    await user.type(screen.getByLabelText("Tìm công việc"), "KIỂM THỬ");
    expect(await screen.findByText("Tìm thấy 2 công việc")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText(T6)).toBeInTheDocument();
    expect(screen.getByText("Thiết lập môi trường kiểm thử tự động")).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 1")).toBeInTheDocument();
    expect(server.requestCount()).toBe(2);
  });

  test("không có kết quả: hiện Không có công việc nào., Tìm thấy 0 công việc và Trang 1 / 1", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TaskManager />);
    await screen.findByText(T1);
    await user.type(screen.getByLabelText("Tìm công việc"), "zzzz");
    expect(await screen.findByText("Không có công việc nào.")).toBeInTheDocument();
    expect(screen.getByText("Tìm thấy 0 công việc")).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 1")).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  test("tải lỗi 500: hiện thông báo chung và nút Thử lại; bấm Thử lại thì tải được danh sách", async () => {
    const user = userEvent.setup({ delay: null });
    window.mockApi.fail("GET */tasks", { status: 500, times: 1 });
    render(<TaskManager />);
    const loadAlert = await screen.findByRole("alert");
    expect(loadAlert).toHaveTextContent("Không tải được công việc: Máy chủ đang gặp sự cố, hãy thử lại sau.");
    expect(loadAlert).toHaveClass("alert-danger");
    expect(screen.queryByText(/Tìm thấy/)).not.toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText(T1)).toBeInTheDocument();
    expect(screen.getByText("Tìm thấy 12 công việc")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Thử lại" })).not.toBeInTheDocument();
  });

  test("tải lỗi mất mạng và lỗi vượt hạn mức 100 yêu cầu: cùng một thông báo chung, có nút Thử lại, không treo ở Đang tải", async () => {
    window.mockApi.networkError("GET */tasks");
    const first = render(<TaskManager />);
    expect(await screen.findByRole("alert")).toHaveTextContent(NETWORK_MESSAGE);
    expect(screen.queryByText("Đang tải công việc...")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeInTheDocument();
    first.unmount();

    window.mockApi.reset();
    installCrudcrud(seed, { quota: 0 });
    render(<TaskManager />);
    const quotaAlert = await screen.findByRole("alert");
    expect(quotaAlert).toHaveTextContent("Không tải được công việc:");
    expect(quotaAlert).toHaveTextContent(NETWORK_MESSAGE);
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeInTheDocument();
  });
});

describe("TaskManager: thêm công việc", () => {
  test("thêm thành công: POST đúng thân, chỉ hiện dòng mới SAU khi máy chủ trả lời, báo thành công, xóa form và không tải lại danh sách", async () => {
    const user = userEvent.setup({ delay: null });
    window.mockApi.delay("POST */tasks", 150);
    render(<TaskManager />);
    await screen.findByText(T1);
    await screen.findByRole("option", { name: "Trần Thị Bình" });
    await fillForm(user, { title: "  Học Vitest  ", priority: "Cao", assignee: "Trần Thị Bình" });
    await user.click(screen.getByRole("button", { name: "Thêm công việc" }));

    expect(screen.getByRole("button", { name: "Thêm công việc" })).toBeDisabled();
    expect(screen.getByText("Tìm thấy 12 công việc")).toBeInTheDocument();
    expect(window.mockApi.callsTo("POST */tasks")[0].body).toEqual({
      title: "Học Vitest",
      status: "todo",
      priority: "high",
      assigneeCode: "NV02",
      dueDate: "2026-11-20",
    });

    const notice = await screen.findByRole("status");
    expect(notice).toHaveTextContent('Đã thêm công việc "Học Vitest".');
    expect(notice).toHaveClass("alert-success");
    expect(screen.getByText("Tìm thấy 13 công việc")).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sau" }));
    await user.click(screen.getByRole("button", { name: "Sau" }));
    const row = rowOf("Học Vitest");
    expect(within(row).getByText("Trạng thái: Cần làm")).toBeInTheDocument();
    expect(within(row).getByText("Người nhận: Trần Thị Bình | Hạn: 20/11/2026")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").at(-1)).toBe(row);
    expect(screen.getByLabelText("Tên công việc")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Thêm công việc" })).toBeEnabled();
    expect(server.db.tasks.at(-1)).toMatchObject({ title: "Học Vitest", status: "todo" });
    expect(tasksReads()).toBe(1);
  });

  test("thêm lỗi 500: báo lỗi theo tên việc, danh sách không đổi, form giữ chữ để thử lại", async () => {
    const user = userEvent.setup({ delay: null });
    window.mockApi.fail("POST */tasks", { status: 500 });
    render(<TaskManager />);
    await screen.findByText(T1);
    await fillForm(user, { title: "Học Vitest" });
    await user.click(screen.getByRole("button", { name: "Thêm công việc" }));

    const addAlert = await screen.findByRole("alert");
    expect(addAlert).toHaveTextContent('Không thêm được công việc "Học Vitest": Máy chủ đang gặp sự cố, hãy thử lại sau.');
    expect(addAlert).toHaveClass("alert-danger");
    expect(screen.getByText("Tìm thấy 12 công việc")).toBeInTheDocument();
    expect(screen.getByLabelText("Tên công việc")).toHaveValue("Học Vitest");
    expect(screen.getByRole("button", { name: "Thêm công việc" })).toBeEnabled();
    expect(server.db.tasks).toHaveLength(12);
  });

  test("thêm khi endpoint đã hết hạn mức: báo lỗi chung, không treo, danh sách và form giữ nguyên", async () => {
    const user = userEvent.setup({ delay: null });
    server = installCrudcrud(seed, { quota: 2 });
    render(<TaskManager />);
    await screen.findByText(T1);
    await screen.findByRole("option", { name: "Trần Thị Bình" });
    await fillForm(user, { title: "Học Vitest" });
    await user.click(screen.getByRole("button", { name: "Thêm công việc" }));

    const addAlert = await screen.findByRole("alert");
    expect(addAlert).toHaveTextContent('Không thêm được công việc "Học Vitest":');
    expect(addAlert).toHaveTextContent(NETWORK_MESSAGE);
    expect(screen.getByText("Tìm thấy 12 công việc")).toBeInTheDocument();
    expect(screen.getByLabelText("Tên công việc")).toHaveValue("Học Vitest");
    expect(screen.getByRole("button", { name: "Thêm công việc" })).toBeEnabled();
  });

  test("bấm Thêm công việc hai lần khi đang chờ máy chủ: chỉ gửi một POST", async () => {
    const user = userEvent.setup({ delay: null });
    window.mockApi.delay("POST */tasks", 200);
    render(<TaskManager />);
    await screen.findByText(T1);
    await fillForm(user, { title: "Học Vitest" });
    const button = screen.getByRole("button", { name: "Thêm công việc" });
    await user.click(button);
    await user.click(button);
    expect(await screen.findByRole("status")).toHaveTextContent('Đã thêm công việc "Học Vitest".');
    expect(window.mockApi.callsTo("POST */tasks")).toHaveLength(1);
    expect(server.db.tasks).toHaveLength(13);
    expect(screen.getByText("Tìm thấy 13 công việc")).toBeInTheDocument();
  });

  test("đang lọc Hoàn thành: việc mới (Chưa giao) được lưu nhưng không chen vào danh sách đang xem, đổi sang Cần làm mới thấy", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TaskManager />);
    await screen.findByText(T1);
    await user.selectOptions(screen.getByLabelText("Trạng thái"), "Hoàn thành");
    await screen.findByText("Tìm thấy 3 công việc");
    await fillForm(user, { title: "Học Vitest" });
    await user.click(screen.getByRole("button", { name: "Thêm công việc" }));

    expect(await screen.findByRole("status")).toHaveTextContent('Đã thêm công việc "Học Vitest".');
    expect(window.mockApi.callsTo("POST */tasks")[0].body.assigneeCode).toBeNull();
    expect(screen.queryByRole("heading", { name: "Học Vitest" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Tìm thấy 3 công việc")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Trạng thái"), "Cần làm");
    expect(await screen.findByText("Tìm thấy 5 công việc")).toBeInTheDocument();
    expect(within(rowOf("Học Vitest")).getByText("Người nhận: Chưa giao | Hạn: 20/11/2026")).toBeInTheDocument();
  });
});

describe("TaskManager: đổi trạng thái", () => {
  test("Bắt đầu, Hoàn thành, Mở lại: mỗi lần một PUT đủ trường và không có _id, dòng bận khi chờ, chỉ đổi sau khi máy chủ trả lời", async () => {
    const user = userEvent.setup({ delay: null });
    window.mockApi.delay("PUT */tasks/*", 100);
    render(<TaskManager />);
    await screen.findByText(T2);
    const id = server.db.tasks[1]._id;
    const row = rowOf(T2);
    expect(within(row).getByText("Trạng thái: Cần làm")).toBeInTheDocument();

    await user.click(within(row).getByRole("button", { name: "Bắt đầu" }));
    expect(within(row).getByRole("button", { name: "Bắt đầu" })).toBeDisabled();
    expect(within(row).getByRole("button", { name: `Xóa ${T2}` })).toBeDisabled();
    expect(within(row).getByText("Trạng thái: Cần làm")).toBeInTheDocument();
    expect(await within(row).findByText("Trạng thái: Đang làm")).toBeInTheDocument();
    expect(window.mockApi.callsTo(`PUT */tasks/${id}`).at(-1).body).toEqual({ ...seed.tasks[1], status: "doing" });

    await user.click(within(row).getByRole("button", { name: "Hoàn thành" }));
    expect(await within(row).findByText("Trạng thái: Hoàn thành")).toBeInTheDocument();
    expect(window.mockApi.callsTo(`PUT */tasks/${id}`).at(-1).body).toEqual({ ...seed.tasks[1], status: "done" });

    await user.click(within(row).getByRole("button", { name: "Mở lại" }));
    expect(await within(row).findByText("Trạng thái: Cần làm")).toBeInTheDocument();
    expect(within(row).getByRole("button", { name: "Bắt đầu" })).toBeEnabled();

    const puts = window.mockApi.callsTo(`PUT */tasks/${id}`);
    expect(puts).toHaveLength(3);
    puts.forEach((call) => expect(call.body).not.toHaveProperty("_id"));
    expect(window.mockApi.callsTo("PATCH */tasks/*")).toHaveLength(0);
    expect(server.db.tasks[1]).toEqual({ ...seed.tasks[1], _id: id });
    expect(tasksReads()).toBe(1);
  });

  test("đổi trạng thái lỗi 500: báo Không cập nhật được công việc, dòng giữ trạng thái cũ và bấm lại được", async () => {
    const user = userEvent.setup({ delay: null });
    window.mockApi.fail("PUT */tasks/*", { status: 500 });
    render(<TaskManager />);
    await screen.findByText(T2);
    const row = rowOf(T2);
    await user.click(within(row).getByRole("button", { name: "Bắt đầu" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Không cập nhật được công việc: Máy chủ đang gặp sự cố, hãy thử lại sau."
    );
    expect(within(row).getByText("Trạng thái: Cần làm")).toBeInTheDocument();
    expect(within(row).getByRole("button", { name: "Bắt đầu" })).toBeEnabled();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(server.db.tasks[1].status).toBe("todo");
  });
});

describe("TaskManager: xóa công việc", () => {
  test("Xóa <tên>: gửi DELETE theo _id, dòng bận khi chờ, rồi biến mất, tổng giảm 1 và không tải lại danh sách", async () => {
    const user = userEvent.setup({ delay: null });
    window.mockApi.delay("DELETE */tasks/*", 100);
    render(<TaskManager />);
    await screen.findByText(T3);
    const id = server.db.tasks[2]._id;
    const row = rowOf(T3);
    await user.click(within(row).getByRole("button", { name: `Xóa ${T3}` }));

    expect(within(row).getByRole("button", { name: `Xóa ${T3}` })).toBeDisabled();
    expect(screen.getByText(T3)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(T3)).not.toBeInTheDocument());
    expect(window.mockApi.callsTo(`DELETE */tasks/${id}`)).toHaveLength(1);
    expect(screen.getByText("Tìm thấy 11 công việc")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(server.db.tasks.some((task) => task._id === id)).toBe(false);
    expect(tasksReads()).toBe(1);
  });

  test("xóa việc đã bị người khác xóa (404): báo Không xóa được công việc, dòng và tổng giữ nguyên", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TaskManager />);
    await screen.findByText(T3);
    server.db.tasks.splice(2, 1);
    await user.click(within(rowOf(T3)).getByRole("button", { name: `Xóa ${T3}` }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Không xóa được công việc: Không tìm thấy dữ liệu.");
    expect(screen.getByText(T3)).toBeInTheDocument();
    expect(screen.getByText("Tìm thấy 12 công việc")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  test("xóa dòng cuối cùng của trang 2: tự lùi về trang 1 mà không tải lại danh sách", async () => {
    const user = userEvent.setup({ delay: null });
    server = installCrudcrud({ ...seed, tasks: seed.tasks.slice(0, 6) });
    render(<TaskManager />);
    await screen.findByText(T1);
    await user.click(screen.getByRole("button", { name: "Sau" }));
    await screen.findByText(T6);
    expect(screen.getByText("Trang 2 / 2")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: `Xóa ${T6}` }));
    expect(await screen.findByText(T1)).toBeInTheDocument();
    expect(screen.getByText("Trang 1 / 1")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByText("Tìm thấy 5 công việc")).toBeInTheDocument();
    expect(tasksReads()).toBe(1);
  });
});

describe("TaskManager: dữ liệu được lưu thật", () => {
  test("thêm, sửa, xóa rồi gỡ ứng dụng và dựng lại: dữ liệu mới vẫn còn", async () => {
    const user = userEvent.setup({ delay: null });
    const first = render(<TaskManager />);
    await screen.findByText(T2);
    await fillForm(user, { title: "Học Vitest" });
    await user.click(screen.getByRole("button", { name: "Thêm công việc" }));
    await screen.findByRole("status");
    await user.click(within(rowOf(T2)).getByRole("button", { name: "Bắt đầu" }));
    await within(rowOf(T2)).findByText("Trạng thái: Đang làm");
    await user.click(screen.getByRole("button", { name: `Xóa ${T3}` }));
    await waitFor(() => expect(screen.queryByText(T3)).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: `Xóa ${T1}` }));
    await waitFor(() => expect(screen.queryByText(T1)).not.toBeInTheDocument());
    first.unmount();

    // "Tải lại trang": dựng lại ứng dụng, dữ liệu chỉ có thể đến từ máy chủ.
    render(<TaskManager />);
    expect(await screen.findByText("Tìm thấy 11 công việc")).toBeInTheDocument();
    expect(within(rowOf(T2)).getByText("Trạng thái: Đang làm")).toBeInTheDocument();
    expect(screen.queryByText(T3)).not.toBeInTheDocument();
    expect(screen.queryByText(T1)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Tìm công việc"), "Học Vitest");
    expect(await screen.findByText("Tìm thấy 1 công việc")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Học Vitest" })).toBeInTheDocument();
  });
});

describe("TaskManager: hạn mức yêu cầu", () => {
  test("một lần tải cho mỗi tài nguyên; đổi trang, lọc, tìm kiếm không tốn yêu cầu; mỗi thao tác ghi đúng một yêu cầu", async () => {
    const user = userEvent.setup({ delay: null });
    render(<TaskManager />);
    await screen.findByText(T1);
    await screen.findByRole("option", { name: "Trần Thị Bình" });
    expect(server.requestCount()).toBe(2);

    await user.click(screen.getByRole("button", { name: "Sau" }));
    await user.selectOptions(screen.getByLabelText("Trạng thái"), "Cần làm");
    await user.type(screen.getByLabelText("Tìm công việc"), "bảng");
    await user.clear(screen.getByLabelText("Tìm công việc"));
    await user.selectOptions(screen.getByLabelText("Trạng thái"), "Tất cả");
    expect(server.requestCount()).toBe(2);

    await fillForm(user, { title: "Học Vitest" });
    await user.click(screen.getByRole("button", { name: "Thêm công việc" }));
    await screen.findByRole("status");
    expect(server.requestCount()).toBe(3);

    await user.click(within(rowOf(T1)).getByRole("button", { name: "Hoàn thành" }));
    await within(rowOf(T1)).findByText("Trạng thái: Hoàn thành");
    expect(server.requestCount()).toBe(4);

    await user.click(screen.getByRole("button", { name: `Xóa ${T3}` }));
    await waitFor(() => expect(screen.queryByText(T3)).not.toBeInTheDocument());
    expect(server.requestCount()).toBe(5);
    expect(tasksReads()).toBe(1);
    expect(window.mockApi.callsTo("GET */employees")).toHaveLength(1);
  });
});
