import { act, render, renderHook, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import EmployeeManager from "../src/components/EmployeeManager.jsx";
import { EmployeeProvider, useEmployees } from "../src/context/EmployeeContext.jsx";
import { employeesReducer } from "../src/reducers/employeesReducer.js";
import { useDepartmentStats } from "../src/hooks/useDepartmentStats.js";
import employees from "../src/data/employees.js";

// Danh sách gốc đóng băng: nếu reducer sửa trực tiếp state thì test báo lỗi ngay.
vi.setConfig({ testTimeout: 20000 }); // máy chậm hoặc đang chạy nhiều việc vẫn đủ thời gian

const base = Object.freeze(employees.map((employee) => Object.freeze({ ...employee })));

const draft = {
  name: "Phan Văn Test",
  email: "test@example.com",
  department: "Kỹ thuật",
  position: "Thực tập sinh",
  salary: 9000000,
  city: "Huế",
  status: "probation",
  joinedAt: "2026-11-06",
};

function Wrapper({ children }) {
  return <EmployeeProvider initialEmployees={employees}>{children}</EmployeeProvider>;
}

function renderManager(initial = employees) {
  return render(
    <EmployeeProvider initialEmployees={initial}>
      <EmployeeManager />
    </EmployeeProvider>
  );
}

// Điền một ô chữ: xóa nội dung cũ rồi dán giá trị mới (giá trị rỗng thì chỉ xóa). Dán nhanh hơn gõ từng ký tự.
async function typeInto(user, label, text) {
  const input = screen.getByLabelText(label);
  await user.clear(input);
  if (text !== "") await user.paste(text);
}

// Điền các trường của form (chỉ những trường được truyền).
async function fillForm(user, values) {
  if (values.name !== undefined) await typeInto(user, "Họ tên", values.name);
  if (values.email !== undefined) await typeInto(user, "Email", values.email);
  if (values.position !== undefined) await typeInto(user, "Vị trí", values.position);
  if (values.salary !== undefined) await typeInto(user, "Lương", values.salary);
  if (values.department) await user.selectOptions(screen.getByLabelText("Phòng ban"), values.department);
  if (values.city) await user.selectOptions(screen.getByLabelText("Thành phố"), values.city);
  if (values.status) await user.selectOptions(screen.getByLabelText("Trạng thái"), values.status);
}

const validValues = {
  name: "Phan Văn Test",
  email: "test.phan@example.com",
  position: "Thực tập sinh",
  salary: "9000000",
};

const cardOf = (name) => screen.getByRole("heading", { level: 3, name }).closest("li");
const cardNames = () => screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent);

describe("employeesReducer", () => {
  test("ADD gán id bằng id lớn nhất cộng 1 (kể cả khi thiếu id giữa chừng hoặc danh sách rỗng), thêm vào cuối, không sửa state cũ", () => {
    const gap = Object.freeze(base.filter((employee) => employee.id !== 5));
    const next = employeesReducer(gap, { type: "ADD", payload: { employee: draft } });
    expect(next).toHaveLength(12);
    expect(next[11]).toEqual({ ...draft, id: 13 });
    expect(next.slice(0, 11)).toEqual(gap);
    expect(gap).toHaveLength(11);
    expect(draft).not.toHaveProperty("id");
    expect(employeesReducer([], { type: "ADD", payload: { employee: draft } })).toEqual([{ ...draft, id: 1 }]);
  });

  test("UPDATE chỉ ghi đè các trường trong changes, giữ nguyên id và nhân viên khác", () => {
    const next = employeesReducer(base, {
      type: "UPDATE",
      payload: { id: 2, changes: { salary: 16000000, status: "probation" } },
    });
    expect(next).toHaveLength(12);
    expect(next[1]).toEqual({ ...base[1], salary: 16000000, status: "probation" });
    expect(next.filter((_, index) => index !== 1)).toEqual(base.filter((_, index) => index !== 1));
    expect(base[1].salary).toBe(15000000);
  });

  test("REMOVE bỏ đúng nhân viên có id đó và giữ nguyên thứ tự những người còn lại", () => {
    const next = employeesReducer(base, { type: "REMOVE", payload: { id: 4 } });
    expect(next.map((employee) => employee.id)).toEqual([1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(base).toHaveLength(12);
  });

  test("UPDATE và REMOVE với id không tồn tại không làm đổi danh sách", () => {
    expect(
      employeesReducer(base, { type: "UPDATE", payload: { id: 999, changes: { salary: 1 } } })
    ).toEqual(base);
    expect(employeesReducer(base, { type: "REMOVE", payload: { id: 999 } })).toEqual(base);
  });

  test("action lạ trả đúng state cũ", () => {
    expect(employeesReducer(base, { type: "CLEAR" })).toBe(base);
    expect(employeesReducer(base, { type: "KHONG_CO" })).toBe(base);
  });
});

describe("EmployeeProvider và useEmployees", () => {
  test("hai component không truyền props cho nhau vẫn cùng thấy danh sách và cùng dispatch được", async () => {
    function Counter() {
      const { employees: list } = useEmployees();
      return <p>{`Có ${list.length} nhân viên`}</p>;
    }
    function AddOne() {
      const { dispatch } = useEmployees();
      return (
        <button onClick={() => dispatch({ type: "ADD", payload: { employee: draft } })}>Thêm thử</button>
      );
    }
    const user = userEvent.setup();
    render(
      <EmployeeProvider initialEmployees={employees}>
        <Counter />
        <AddOne />
      </EmployeeProvider>
    );
    expect(screen.getByText("Có 12 nhân viên")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Thêm thử" }));
    expect(screen.getByText("Có 13 nhân viên")).toBeInTheDocument();
  });

  test("useEmployees ném lỗi rõ ràng khi dùng ngoài EmployeeProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useEmployees())).toThrow(
      "useEmployees phải được dùng bên trong EmployeeProvider"
    );
    spy.mockRestore();
  });
});

describe("useDepartmentStats", () => {
  test("đếm người và cộng lương theo phòng ban, bỏ nhân viên đã nghỉ việc, đúng thứ tự phòng ban", () => {
    const { result } = renderHook(() => useDepartmentStats(), { wrapper: Wrapper });
    expect(result.current).toEqual([
      { department: "Kỹ thuật", count: 4, totalSalary: 84500000 },
      { department: "Nhân sự", count: 3, totalSalary: 57000000 },
      { department: "Kinh doanh", count: 2, totalSalary: 34000000 },
      { department: "Kế toán", count: 2, totalSalary: 22500000 },
    ]);
  });

  test("cập nhật khi danh sách đổi và bỏ phòng ban không còn ai đang làm", () => {
    const { result } = renderHook(
      () => ({ stats: useDepartmentStats(), dispatch: useEmployees().dispatch }),
      { wrapper: Wrapper }
    );
    act(() => {
      result.current.dispatch({ type: "UPDATE", payload: { id: 3, changes: { status: "resigned" } } });
      result.current.dispatch({ type: "UPDATE", payload: { id: 6, changes: { status: "resigned" } } });
    });
    expect(result.current.stats.map((item) => item.department)).toEqual(["Kỹ thuật", "Nhân sự", "Kế toán"]);
  });
});

describe("Hiển thị và thêm nhân viên", () => {
  test("trang ban đầu hiện 12 nhân viên, bảng phòng ban và form Thêm nhân viên, không có cảnh báo của React", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Quản lý nhân viên Rikkei" })).toBeInTheDocument();
    expect(screen.getByText("Danh sách nhân viên (12)")).toBeInTheDocument();
    expect(cardNames()).toHaveLength(12);
    expect(cardNames()[0]).toBe("Nguyễn Văn An");
    expect(screen.getByText("Kỹ thuật: 4 người, lương 84.500.000 đ")).toBeInTheDocument();
    expect(screen.getByText("Nhân sự: 3 người, lương 57.000.000 đ")).toBeInTheDocument();
    expect(screen.getByText("Kinh doanh: 2 người, lương 34.000.000 đ")).toBeInTheDocument();
    expect(screen.getByText("Kế toán: 2 người, lương 22.500.000 đ")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Thêm nhân viên" })).toBeInTheDocument();
    expect(screen.getByRole("status").textContent).toBe("");
    // Lớp Bootstrap của huy hiệu và thẻ nhân viên đã nghỉ việc (xem bảng "Lớp Bootstrap bắt buộc" trong đề)
    expect(within(cardOf("Nguyễn Văn An")).getByText("Đang làm việc")).toHaveClass("text-bg-success");
    expect(within(cardOf("Đỗ Mai Phương")).getByText("Đã nghỉ việc")).toHaveClass("text-bg-secondary");
    expect(cardOf("Đỗ Mai Phương")).toHaveClass("opacity-50");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test("thêm nhân viên hợp lệ: thẻ mới nằm cuối, có thông báo, bảng phòng ban đổi, form được xóa trắng", async () => {
    const user = userEvent.setup();
    renderManager();
    await fillForm(user, { ...validValues, department: "Nhân sự", city: "Huế", status: "probation", position: "Chuyên viên", salary: "20000000" });
    await user.click(screen.getByText("Thêm", { selector: "button" }));

    expect(screen.getByRole("status")).toHaveTextContent("Đã thêm nhân viên Phan Văn Test.");
    expect(screen.getByRole("status")).toHaveClass("alert", "alert-success");
    expect(screen.getByText("Danh sách nhân viên (13)")).toBeInTheDocument();
    expect(cardNames().at(-1)).toBe("Phan Văn Test");
    const card = within(cardOf("Phan Văn Test"));
    expect(card.getByText("Chuyên viên - Nhân sự")).toBeInTheDocument();
    expect(card.getByText("Lương: 20.000.000 đ")).toBeInTheDocument();
    expect(card.getByText("Vào làm: 06/11/2026")).toBeInTheDocument();
    expect(card.getByText("Thử việc")).toHaveClass("text-bg-warning");
    expect(screen.getByText("Nhân sự: 4 người, lương 77.000.000 đ")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Họ tên")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Lương")).toHaveValue("");
    expect(screen.getByLabelText("Phòng ban")).toHaveDisplayValue("Kỹ thuật");
  });

  test("họ tên và email được cắt khoảng trắng hai đầu, lương được lưu thành số", async () => {
    const user = userEvent.setup();
    renderManager();
    await fillForm(user, {
      name: "  Phan Văn Test  ",
      email: "  Test.Phan@Example.com ",
      position: "Thực tập sinh",
      salary: " 20000000 ",
    });
    await user.click(screen.getByText("Thêm", { selector: "button" }));

    expect(screen.getByRole("status").textContent).toBe("Đã thêm nhân viên Phan Văn Test.");
    expect(cardNames().at(-1)).toBe("Phan Văn Test");
    const lines = [...cardOf("Phan Văn Test").querySelectorAll("p")].map((line) => line.textContent);
    expect(lines).toContain("Test.Phan@Example.com");
    expect(lines).toContain("Lương: 20.000.000 đ");
  });
});

describe("Kiểm tra dữ liệu trong form", () => {
  test("họ tên rỗng hoặc toàn dấu cách bị chặn, các lỗi của form trống hiện cùng lúc", async () => {
    const user = userEvent.setup();
    renderManager();
    await user.click(screen.getByText("Thêm", { selector: "button" }));
    expect(screen.getByText("Vui lòng nhập họ tên.")).toBeInTheDocument();
    expect(screen.getByText("Email không hợp lệ.")).toHaveClass("invalid-feedback");
    expect(screen.getByLabelText("Email")).toHaveClass("is-invalid");
    expect(screen.getByText("Lương phải là số lớn hơn 0.")).toBeInTheDocument();

    await fillForm(user, { ...validValues, name: "   " });
    await user.click(screen.getByText("Thêm", { selector: "button" }));
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByText("Vui lòng nhập họ tên.")).toBeInTheDocument();
    expect(screen.getByText("Danh sách nhân viên (12)")).toBeInTheDocument();
    expect(screen.getByRole("status").textContent).toBe("");
  });

  test("email sai định dạng báo Email không hợp lệ. và không thêm nhân viên", async () => {
    const user = userEvent.setup();
    renderManager();
    await fillForm(user, { name: "Phan Văn Test", salary: "9000000" });
    for (const wrong of ["an", "an@", "@example.com", "an@example", "a n@example.com", "an@@example.com"]) {
      await typeInto(user, "Email", wrong);
      await user.click(screen.getByText("Thêm", { selector: "button" }));
      expect(screen.getByText("Email không hợp lệ.")).toBeInTheDocument();
      expect(screen.getByText("Danh sách nhân viên (12)")).toBeInTheDocument();
    }
    await typeInto(user, "Email", "test.phan@example.com");
    await user.click(screen.getByText("Thêm", { selector: "button" }));
    expect(screen.queryByText("Email không hợp lệ.")).not.toBeInTheDocument();
    expect(screen.getByText("Danh sách nhân viên (13)")).toBeInTheDocument();
  });

  test("email trùng nhân viên khác bị chặn, không phân biệt hoa thường và khoảng trắng hai đầu", async () => {
    const user = userEvent.setup();
    renderManager();
    await fillForm(user, { ...validValues, email: "AN.NGUYEN@EXAMPLE.COM" });
    await user.click(screen.getByText("Thêm", { selector: "button" }));
    expect(screen.getByText("Email này đã tồn tại.")).toBeInTheDocument();

    await typeInto(user, "Email", " binh.tran@example.com ");
    await user.click(screen.getByText("Thêm", { selector: "button" }));
    expect(screen.getByText("Email này đã tồn tại.")).toBeInTheDocument();
    expect(screen.getByText("Danh sách nhân viên (12)")).toBeInTheDocument();
    expect(screen.getByRole("status").textContent).toBe("");

    await typeInto(user, "Email", "moi@example.com");
    await user.click(screen.getByText("Thêm", { selector: "button" }));
    expect(screen.queryByText("Email này đã tồn tại.")).not.toBeInTheDocument();
    expect(screen.getByText("Danh sách nhân viên (13)")).toBeInTheDocument();
  });

  test("lương rỗng, chữ, bằng 0 hoặc âm bị chặn; lương hợp lệ được nhận", async () => {
    const user = userEvent.setup();
    renderManager();
    await fillForm(user, { ...validValues, salary: "" });
    for (const wrong of ["", "abc", "0", "-5", "18.000.000"]) {
      await typeInto(user, "Lương", wrong);
      await user.click(screen.getByText("Thêm", { selector: "button" }));
      expect(screen.getByText("Lương phải là số lớn hơn 0.")).toBeInTheDocument();
      expect(screen.getByText("Danh sách nhân viên (12)")).toBeInTheDocument();
    }
    await typeInto(user, "Lương", "1500000");
    await user.click(screen.getByText("Thêm", { selector: "button" }));
    expect(screen.queryByText("Lương phải là số lớn hơn 0.")).not.toBeInTheDocument();
    expect(within(cardOf("Phan Văn Test")).getByText("Lương: 1.500.000 đ")).toBeInTheDocument();
  });
});

describe("Sửa nhân viên", () => {
  test("bấm Sửa mở form với dữ liệu hiện có, có nút Lưu và Hủy thay cho nút Thêm", async () => {
    const user = userEvent.setup();
    renderManager();
    await user.click(screen.getByRole("button", { name: "Sửa Trần Thị Bình" }));

    expect(screen.getByRole("heading", { name: "Sửa nhân viên" })).toBeInTheDocument();
    expect(screen.getByLabelText("Họ tên")).toHaveValue("Trần Thị Bình");
    expect(screen.getByLabelText("Email")).toHaveValue("binh.tran@example.com");
    expect(screen.getByLabelText("Phòng ban")).toHaveDisplayValue("Nhân sự");
    expect(screen.getByLabelText("Vị trí")).toHaveValue("Chuyên viên tuyển dụng");
    expect(screen.getByLabelText("Lương")).toHaveValue("15000000");
    expect(screen.getByLabelText("Thành phố")).toHaveDisplayValue("Hà Nội");
    expect(screen.getByLabelText("Trạng thái")).toHaveDisplayValue("Đang làm việc");
    expect(screen.getByRole("button", { name: "Lưu" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hủy" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Thêm" })).not.toBeInTheDocument();
  });

  test("Lưu cập nhật đúng nhân viên tại chỗ, giữ ngày vào làm, báo thông báo và đưa form về chế độ thêm", async () => {
    const user = userEvent.setup();
    renderManager();
    await user.click(screen.getByRole("button", { name: "Sửa Trần Thị Bình" }));
    await fillForm(user, { name: "Trần Thị Bình An", salary: "16000000" });
    await user.click(screen.getByRole("button", { name: "Lưu" }));

    expect(screen.getByRole("status")).toHaveTextContent("Đã cập nhật nhân viên Trần Thị Bình An.");
    expect(cardNames()[1]).toBe("Trần Thị Bình An");
    expect(screen.queryByRole("heading", { level: 3, name: "Trần Thị Bình" })).not.toBeInTheDocument();
    const card = within(cardOf("Trần Thị Bình An"));
    expect(card.getByText("Lương: 16.000.000 đ")).toBeInTheDocument();
    expect(card.getByText("Vào làm: 01/07/2021")).toBeInTheDocument();
    expect(screen.getByText("Danh sách nhân viên (12)")).toBeInTheDocument();
    expect(screen.getByText("Nhân sự: 3 người, lương 58.000.000 đ")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Thêm nhân viên" })).toBeInTheDocument();
    expect(screen.getByLabelText("Họ tên")).toHaveValue("");
  });

  test("Hủy đóng form sửa và không đổi gì", async () => {
    const user = userEvent.setup();
    renderManager();
    await user.click(screen.getByRole("button", { name: "Sửa Nguyễn Văn An" }));
    await typeInto(user, "Họ tên", "Tên khác");
    await user.click(screen.getByRole("button", { name: "Hủy" }));

    expect(screen.getByRole("heading", { name: "Thêm nhân viên" })).toBeInTheDocument();
    expect(cardNames()[0]).toBe("Nguyễn Văn An");
    expect(screen.queryByText("Tên khác")).not.toBeInTheDocument();
    expect(screen.getByRole("status").textContent).toBe("");
  });

  test("khi sửa, giữ email của chính mình thì không báo trùng, đổi sang email người khác thì báo Email này đã tồn tại.", async () => {
    const user = userEvent.setup();
    renderManager();
    await user.click(screen.getByRole("button", { name: "Sửa Nguyễn Văn An" }));
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Đã cập nhật nhân viên Nguyễn Văn An.");

    await user.click(screen.getByRole("button", { name: "Sửa Trần Thị Bình" }));
    await typeInto(user, "Email", "AN.NGUYEN@example.com");
    await user.click(screen.getByRole("button", { name: "Lưu" }));
    expect(screen.getByText("Email này đã tồn tại.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sửa nhân viên" })).toBeInTheDocument();
    expect(within(cardOf("Trần Thị Bình")).getByText("binh.tran@example.com")).toBeInTheDocument();
  });

  test("bấm Sửa nhân viên khác ngay sau đó thì form hiện dữ liệu của người mới chọn", async () => {
    const user = userEvent.setup();
    renderManager();
    await user.click(screen.getByRole("button", { name: "Sửa Nguyễn Văn An" }));
    expect(screen.getByLabelText("Họ tên")).toHaveValue("Nguyễn Văn An");
    await user.click(screen.getByRole("button", { name: "Sửa Lê Hoàng Cường" }));
    expect(screen.getByLabelText("Họ tên")).toHaveValue("Lê Hoàng Cường");
    expect(screen.getByLabelText("Email")).toHaveValue("cuong.le@example.com");
    expect(screen.getByLabelText("Lương")).toHaveValue("22000000");
    expect(screen.getByLabelText("Phòng ban")).toHaveDisplayValue("Kinh doanh");
  });

  test("xóa chính nhân viên đang sửa thì form sửa đóng lại, thêm người mới sau đó vẫn ở chế độ thêm", async () => {
    const user = userEvent.setup();
    renderManager();
    await user.click(screen.getByRole("button", { name: "Sửa Trịnh Bảo Châu" }));
    await user.click(screen.getByRole("button", { name: "Xóa Trịnh Bảo Châu" }));

    expect(screen.getByRole("heading", { name: "Thêm nhân viên" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hủy" })).not.toBeInTheDocument();
    expect(screen.getByText("Danh sách nhân viên (11)")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Đã xóa nhân viên Trịnh Bảo Châu.");

    // Người mới nhận lại id 12 của người vừa xóa; form không được tự mở lại ở chế độ sửa.
    await fillForm(user, validValues);
    await user.click(screen.getByText("Thêm", { selector: "button" }));
    expect(screen.getByRole("status")).toHaveTextContent("Đã thêm nhân viên Phan Văn Test.");
    expect(screen.getByRole("heading", { name: "Thêm nhân viên" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hủy" })).not.toBeInTheDocument();
  });
});

describe("Xóa nhân viên", () => {
  test("bấm Xóa bỏ đúng nhân viên, báo thông báo và cập nhật số lượng, bảng phòng ban", async () => {
    const user = userEvent.setup();
    renderManager();
    await user.click(screen.getByRole("button", { name: "Xóa Trần Thị Bình" }));

    expect(screen.queryByRole("heading", { level: 3, name: "Trần Thị Bình" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Đã xóa nhân viên Trần Thị Bình.");
    expect(screen.getByText("Danh sách nhân viên (11)")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Nguyễn Văn An" })).toBeInTheDocument();
    expect(screen.getByText("Nhân sự: 2 người, lương 42.000.000 đ")).toBeInTheDocument();
  });

  test("xóa người cuối cùng thì hiện Chưa có nhân viên nào. và bảng phòng ban báo chưa có dữ liệu", async () => {
    const user = userEvent.setup();
    renderManager([employees[0]]);
    await user.click(screen.getByRole("button", { name: "Xóa Nguyễn Văn An" }));

    expect(screen.getByText("Chưa có nhân viên nào.")).toBeInTheDocument();
    expect(screen.getByText("Danh sách nhân viên (0)")).toBeInTheDocument();
    expect(screen.getByText("Chưa có dữ liệu phòng ban.")).toBeInTheDocument();
  });
});

describe("Tìm nhân viên", () => {
  test("lọc theo họ tên hoặc email, không phân biệt hoa thường; xóa từ khóa thì hiện lại đủ", async () => {
    const user = userEvent.setup();
    renderManager();
    const box = screen.getByLabelText("Tìm nhân viên");

    await user.type(box, "NGUYỄN");
    expect(cardNames()).toEqual(["Nguyễn Văn An"]);
    expect(screen.getByText("Danh sách nhân viên (1)")).toBeInTheDocument();

    await user.clear(box);
    await user.type(box, "CUONG.LE@");
    expect(cardNames()).toEqual(["Lê Hoàng Cường"]);

    await user.clear(box);
    expect(cardNames()).toHaveLength(12);
  });

  test("không khớp ai thì hiện Không có nhân viên phù hợp. và bảng phòng ban không bị lọc theo từ khóa", async () => {
    const user = userEvent.setup();
    renderManager();
    await user.type(screen.getByLabelText("Tìm nhân viên"), "zzz");

    expect(screen.getByText("Không có nhân viên phù hợp.")).toBeInTheDocument();
    expect(screen.getByText("Danh sách nhân viên (0)")).toBeInTheDocument();
    expect(screen.getByText("Kỹ thuật: 4 người, lương 84.500.000 đ")).toBeInTheDocument();
  });
});
