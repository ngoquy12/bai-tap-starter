import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import App from "../src/App.jsx";
import { EmployeeProvider } from "../src/context/EmployeeContext.jsx";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import employees from "../src/data/employees.js";

// Nhân viên đăng nhập sẵn: Nguyễn Văn An (id 1, đang làm việc).
const an = employees[0];

// Hiện đường dẫn, query hiện tại và một nút lùi một bước để kiểm tra điều hướng.
function Probe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div>
      <p data-testid="path">{location.pathname}</p>
      <p data-testid="query">{JSON.stringify(Object.fromEntries(new URLSearchParams(location.search)))}</p>
      <button onClick={() => navigate(-1)}>Lùi một bước (kiểm thử)</button>
    </div>
  );
}

// Dựng ứng dụng như main.jsx nhưng dùng MemoryRouter với các địa chỉ cho trước.
function renderApp(entries, user = null) {
  return render(
    <MemoryRouter initialEntries={entries}>
      <EmployeeProvider initialEmployees={employees}>
        <AuthProvider initialUser={user}>
          <App />
          <Probe />
        </AuthProvider>
      </EmployeeProvider>
    </MemoryRouter>
  );
}

const path = () => screen.getByTestId("path").textContent;
const query = () => JSON.parse(screen.getByTestId("query").textContent);

// Điền form nhân viên mới (các ô có nhãn theo đề).
async function fillNewEmployee(user) {
  await user.type(screen.getByLabelText("Họ tên"), "Nguyễn Hải Yến");
  await user.type(screen.getByLabelText("Email"), "yen.nguyen@example.com");
  await user.selectOptions(screen.getByLabelText("Phòng ban"), "Kế toán");
  await user.type(screen.getByLabelText("Vị trí"), "Kế toán thuế");
  await user.type(screen.getByLabelText("Lương"), "14000000");
}

describe("Bảng tuyến và trang không tồn tại", () => {
  it("địa chỉ / chuyển sang /employees và hiện danh sách", () => {
    renderApp(["/"]);
    expect(path()).toBe("/employees");
    expect(screen.getByText("Tìm thấy 12 nhân viên")).toBeInTheDocument();
  });

  it("địa chỉ lạ hiện Không tìm thấy trang bên trong bố cục chung", () => {
    renderApp(["/khong-co-trang"]);
    expect(screen.getByText("Không tìm thấy trang")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Quản lý nhân viên" })).toBeInTheDocument();
  });
});

describe("MainLayout: tiêu đề và thanh menu", () => {
  it("hiện tiêu đề và ba liên kết khi chưa đăng nhập", () => {
    renderApp(["/employees"]);
    expect(screen.getByRole("heading", { name: "Quản lý nhân viên" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nhân viên" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Thêm nhân viên" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toBeInTheDocument();
    expect(screen.queryByText(/Xin chào/)).not.toBeInTheDocument();
  });

  it("bấm liên kết đổi trang giữ nguyên bố cục và NavLink của trang hiện tại có class active", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/employees"]);
    expect(screen.getByRole("link", { name: "Nhân viên" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Đăng nhập" })).not.toHaveClass("active");
    await user.click(screen.getByRole("link", { name: "Đăng nhập" }));
    expect(path()).toBe("/login");
    expect(screen.getByRole("heading", { name: "Quản lý nhân viên" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Nhân viên" })).not.toHaveClass("active");
  });

  it("đã đăng nhập thì hiện lời chào, nút Đăng xuất và ẩn liên kết Đăng nhập", () => {
    renderApp(["/employees"], an);
    expect(screen.getByText("Xin chào, Nguyễn Văn An")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đăng xuất" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Đăng nhập" })).not.toBeInTheDocument();
  });

  it("bấm Đăng xuất ở trang cần đăng nhập thì chuyển sang /login", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/employees/new"], an);
    expect(path()).toBe("/employees/new");
    await user.click(screen.getByRole("button", { name: "Đăng xuất" }));
    expect(path()).toBe("/login");
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toBeInTheDocument();
  });
});

describe("EmployeesPage: danh sách, lọc và tìm kiếm trên URL", () => {
  it("hiện đủ 12 nhân viên, mỗi tên là liên kết tới trang chi tiết", () => {
    renderApp(["/employees"]);
    expect(screen.getByText("Tìm thấy 12 nhân viên")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nguyễn Văn An" })).toHaveAttribute("href", "/employees/1");
    expect(screen.getByRole("link", { name: "Trịnh Bảo Châu" })).toHaveAttribute("href", "/employees/12");
  });

  it("bấm nút phòng ban lọc danh sách và ghi vào URL, bấm Tất cả thì bỏ lọc", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/employees"]);
    expect(screen.getByRole("button", { name: "Tất cả" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Kỹ thuật" }));
    expect(screen.getByText("Tìm thấy 4 nhân viên")).toBeInTheDocument();
    expect(query()).toEqual({ department: "Kỹ thuật" });
    expect(screen.getByRole("button", { name: "Kỹ thuật" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Tất cả" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("link", { name: "Trần Thị Bình" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tất cả" }));
    expect(screen.getByText("Tìm thấy 12 nhân viên")).toBeInTheDocument();
    expect(query()).toEqual({});
  });

  it("mở thẳng địa chỉ có query thì ra đúng kết quả và đúng trạng thái các điều khiển", () => {
    renderApp(["/employees?department=Nhân sự&q=an"]);
    expect(screen.getByText("Tìm thấy 2 nhân viên")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Trần Thị Bình" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bùi Lan Khanh" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Trịnh Bảo Châu" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Tìm nhân viên")).toHaveValue("an");
    expect(screen.getByRole("button", { name: "Nhân sự" })).toHaveAttribute("aria-pressed", "true");
  });

  it("gõ vào ô tìm kiếm ghi q vào URL và giữ nguyên bộ lọc phòng ban", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/employees?department=Kinh doanh"]);
    expect(screen.getByText("Tìm thấy 3 nhân viên")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Tìm nhân viên"), "ha");
    expect(query()).toEqual({ department: "Kinh doanh", q: "ha" });
    expect(screen.getByText("Tìm thấy 1 nhân viên")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Vũ Ngọc Hà" })).toBeInTheDocument();
  });

  it("không có kết quả thì hiện Không có nhân viên phù hợp.", () => {
    renderApp(["/employees?q=zzz"]);
    expect(screen.getByText("Không có nhân viên phù hợp.")).toBeInTheDocument();
    expect(screen.getByText("Tìm thấy 0 nhân viên")).toBeInTheDocument();
  });

  it("tìm không phân biệt hoa thường và tìm được theo email", () => {
    renderApp(["/employees?q=BINH.TRAN"]);
    expect(screen.getByText("Tìm thấy 1 nhân viên")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Trần Thị Bình" })).toBeInTheDocument();
  });
});

describe("EmployeeDetailPage: chi tiết theo :id", () => {
  it("bấm tên trong danh sách mở trang chi tiết với đầy đủ thông tin", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/employees"]);
    await user.click(screen.getByRole("link", { name: "Lê Hoàng Cường" }));
    expect(path()).toBe("/employees/3");
    expect(screen.getByRole("heading", { name: "Lê Hoàng Cường" })).toBeInTheDocument();
    expect(screen.getByText("cuong.le@example.com")).toBeInTheDocument();
    expect(screen.getByText("Lương: 22.000.000 đ")).toBeInTheDocument();
    expect(screen.getByText("Vào làm: 20/01/2020")).toBeInTheDocument();
    expect(screen.getByText("Đang làm việc")).toBeInTheDocument();
  });

  it("id không có trong dữ liệu hoặc không phải số thì hiện Không tìm thấy nhân viên", () => {
    const first = renderApp(["/employees/99"]);
    expect(screen.getByText("Không tìm thấy nhân viên 99")).toBeInTheDocument();
    first.unmount();
    renderApp(["/employees/abc"]);
    expect(screen.getByText("Không tìm thấy nhân viên abc")).toBeInTheDocument();
  });

  it("nút Chỉnh sửa chuyển tới /employees/<id>/edit", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/employees/3"], an);
    await user.click(screen.getByRole("button", { name: "Chỉnh sửa" }));
    expect(path()).toBe("/employees/3/edit");
    expect(screen.getByLabelText("Họ tên")).toHaveValue("Lê Hoàng Cường");
  });

  it("nút Quay lại trở về trang trước, giữ nguyên bộ lọc trên URL", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/employees?department=Nhân sự", "/employees/2"]);
    expect(path()).toBe("/employees/2");
    await user.click(screen.getByRole("button", { name: "Quay lại" }));
    expect(path()).toBe("/employees");
    expect(query()).toEqual({ department: "Nhân sự" });
    expect(screen.getByText("Tìm thấy 3 nhân viên")).toBeInTheDocument();
  });
});

describe("EmployeeFormPage: thêm mới và sửa", () => {
  it("thêm nhân viên: lưu xong chuyển tới trang chi tiết của id mới (13)", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/employees"], an);
    await user.click(screen.getByRole("link", { name: "Thêm nhân viên" }));
    expect(path()).toBe("/employees/new");
    expect(screen.getByRole("heading", { name: "Thêm nhân viên mới" })).toBeInTheDocument();
    expect(screen.queryByText(/Không tìm thấy nhân viên/)).not.toBeInTheDocument();
    await fillNewEmployee(user);
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    expect(path()).toBe("/employees/13");
    expect(screen.getByRole("heading", { name: "Nguyễn Hải Yến" })).toBeInTheDocument();
    expect(screen.getByText("Lương: 14.000.000 đ")).toBeInTheDocument();
  });

  it("nhân viên vừa thêm xuất hiện trong danh sách, dữ liệu giữ nguyên khi đổi trang", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/employees/new"], an);
    await fillNewEmployee(user);
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    await user.click(screen.getByRole("link", { name: "Nhân viên" }));
    expect(path()).toBe("/employees");
    expect(screen.getByText("Tìm thấy 13 nhân viên")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nguyễn Hải Yến" })).toHaveAttribute("href", "/employees/13");
  });

  it("sửa nhân viên: form điền sẵn dữ liệu, lưu xong chuyển về trang chi tiết đã cập nhật", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/employees/3/edit"], an);
    expect(screen.getByLabelText("Họ tên")).toHaveValue("Lê Hoàng Cường");
    expect(screen.getByLabelText("Email")).toHaveValue("cuong.le@example.com");
    expect(screen.getByLabelText("Lương")).toHaveValue(22000000);
    await user.clear(screen.getByLabelText("Họ tên"));
    await user.type(screen.getByLabelText("Họ tên"), "Lê Hoàng Cường Phát");
    await user.clear(screen.getByLabelText("Lương"));
    await user.type(screen.getByLabelText("Lương"), "25000000");
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    expect(path()).toBe("/employees/3");
    expect(screen.getByRole("heading", { name: "Lê Hoàng Cường Phát" })).toBeInTheDocument();
    expect(screen.getByText("Lương: 25.000.000 đ")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Nhân viên" }));
    expect(screen.getByText("Tìm thấy 12 nhân viên")).toBeInTheDocument();
  });

  it("nút Hủy quay lại trang trước và không lưu thay đổi", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/employees/3", "/employees/3/edit"], an);
    await user.type(screen.getByLabelText("Họ tên"), " đã gõ thêm");
    await user.click(screen.getByRole("button", { name: "Hủy" }));
    expect(path()).toBe("/employees/3");
    expect(screen.getByRole("heading", { name: "Lê Hoàng Cường" })).toBeInTheDocument();
  });

  it("sửa nhân viên không tồn tại hiện Không tìm thấy nhân viên", () => {
    renderApp(["/employees/99/edit"], an);
    expect(screen.getByText("Không tìm thấy nhân viên 99")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Lưu" })).not.toBeInTheDocument();
  });
});

describe("Đăng nhập và route được bảo vệ", () => {
  it("chưa đăng nhập vào trang thêm hoặc sửa thì bị chuyển sang /login", () => {
    const first = renderApp(["/employees/new"]);
    expect(path()).toBe("/login");
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    first.unmount();
    renderApp(["/employees/3/edit"]);
    expect(path()).toBe("/login");
  });

  it("chuyển hướng dùng replace nên lùi một bước về trang trước đó, không quay lại trang bị chặn", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/employees", "/employees/new"]);
    expect(path()).toBe("/login");
    await user.click(screen.getByRole("button", { name: "Lùi một bước (kiểm thử)" }));
    expect(path()).toBe("/employees");
  });

  it("đăng nhập bằng email nhân viên (bỏ khoảng trắng, không phân biệt hoa thường) thì vào /employees", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/login"]);
    await user.type(screen.getByLabelText("Email"), "  AN.NGUYEN@example.com ");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(path()).toBe("/employees");
    expect(screen.getByText("Xin chào, Nguyễn Văn An")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đăng xuất" })).toBeInTheDocument();
  });

  it("email trống hoặc không có trong danh sách hiện Không tìm thấy nhân viên với email này.", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/login"]);
    await user.type(screen.getByLabelText("Email"), "   ");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Không tìm thấy nhân viên với email này.");
    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "nobody@example.com");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Không tìm thấy nhân viên với email này.");
    expect(path()).toBe("/login");
  });

  it("nhân viên đã nghỉ việc không đăng nhập được", async () => {
    const user = userEvent.setup({ delay: null });
    renderApp(["/login"]);
    await user.type(screen.getByLabelText("Email"), "phuong.do@example.com");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Tài khoản đã ngừng hoạt động.");
    expect(path()).toBe("/login");
    expect(screen.queryByText(/Xin chào/)).not.toBeInTheDocument();
  });
});
