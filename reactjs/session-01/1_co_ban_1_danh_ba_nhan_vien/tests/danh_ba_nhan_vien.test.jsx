import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../src/App.jsx";
import EmployeeCard from "../src/components/EmployeeCard.jsx";
import EmployeeList from "../src/components/EmployeeList.jsx";
import EmployeeSummary from "../src/components/EmployeeSummary.jsx";
import StatusBadge from "../src/components/StatusBadge.jsx";
import employees from "../src/data/employees.js";

// Ba nhân viên mẫu lấy từ dữ liệu: An (đang làm việc), Đức (thử việc, vào làm 2026), Phương (đã nghỉ việc).
const an = employees[0];
const duc = employees[4];
const phuong = employees[9];

describe("StatusBadge", () => {
  it("trạng thái active hiện Đang làm việc với lớp màu xanh (text-bg-success)", () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText("Đang làm việc")).toHaveClass("badge", "text-bg-success");
  });

  it("trạng thái probation hiện Thử việc với lớp màu vàng (text-bg-warning)", () => {
    render(<StatusBadge status="probation" />);
    expect(screen.getByText("Thử việc")).toHaveClass("badge", "text-bg-warning");
  });

  it("trạng thái resigned hiện Đã nghỉ việc với lớp màu xám (text-bg-secondary)", () => {
    render(<StatusBadge status="resigned" />);
    expect(screen.getByText("Đã nghỉ việc")).toHaveClass("badge", "text-bg-secondary");
  });

  it("giá trị lạ hoặc thiếu hiện Không rõ", () => {
    const { rerender } = render(<StatusBadge status="terminated" />);
    expect(screen.getByText("Không rõ")).toHaveClass("text-bg-secondary");
    rerender(<StatusBadge />);
    expect(screen.getByText("Không rõ")).toHaveClass("text-bg-secondary");
  });
});

describe("EmployeeCard", () => {
  it("hiện họ tên ở h3, vị trí - phòng ban và email", () => {
    render(<EmployeeCard employee={an} />);
    expect(screen.getByRole("heading", { level: 3, name: "Nguyễn Văn An" })).toBeInTheDocument();
    expect(screen.getByText("Lập trình viên - Kỹ thuật")).toBeInTheDocument();
    expect(screen.getByText("Email: an.nguyen@example.com")).toBeInTheDocument();
  });

  it("hiện lương, thành phố và ngày vào làm đã định dạng", () => {
    render(<EmployeeCard employee={an} />);
    expect(screen.getByText("Lương: 18.000.000 đ")).toBeInTheDocument();
    expect(screen.getByText("Thành phố: Hà Nội")).toBeInTheDocument();
    expect(screen.getByText("Vào làm: 14/03/2022")).toBeInTheDocument();
  });

  it("hiện nhãn trạng thái đúng với nhân viên", () => {
    render(<EmployeeCard employee={duc} />);
    expect(screen.getByText("Thử việc")).toHaveClass("text-bg-warning");
    expect(screen.queryByText("Đang làm việc")).toBeNull();
  });

  it("nhân viên vào làm năm 2026 có nhãn Nhân viên mới", () => {
    render(<EmployeeCard employee={duc} />);
    expect(screen.getByText("Nhân viên mới")).toBeInTheDocument();
  });

  it("nhân viên vào làm đúng ngày 2026-01-01 vẫn là Nhân viên mới", () => {
    render(<EmployeeCard employee={{ ...an, joinedAt: "2026-01-01" }} />);
    expect(screen.getByText("Nhân viên mới")).toBeInTheDocument();
  });

  it("nhân viên vào làm ngày 2025-12-31 không có nhãn Nhân viên mới", () => {
    render(<EmployeeCard employee={{ ...an, joinedAt: "2025-12-31" }} />);
    expect(screen.getByText("Vào làm: 31/12/2025")).toBeInTheDocument();
    expect(screen.queryByText("Nhân viên mới")).toBeNull();
  });

  it("thẻ nhân viên đã nghỉ việc bị làm mờ, thẻ còn lại thì không", () => {
    const { container, unmount } = render(<EmployeeCard employee={phuong} />);
    expect(container.querySelector("article")).toHaveClass("opacity-50");
    unmount();
    const other = render(<EmployeeCard employee={an} />);
    expect(other.container.querySelector("article")).not.toHaveClass("opacity-50");
  });

  it("nhân viên đã nghỉ việc không hiện lương", () => {
    render(<EmployeeCard employee={phuong} />);
    expect(screen.getByRole("heading", { level: 3, name: "Đỗ Mai Phương" })).toBeInTheDocument();
    expect(screen.getByText("Đã nghỉ việc")).toBeInTheDocument();
    expect(screen.queryByText(/Lương/)).toBeNull();
    expect(screen.queryByText(/13\.500\.000/)).toBeNull();
  });

  it("nhân viên đã nghỉ việc không có nhãn Nhân viên mới dù vào làm năm 2026", () => {
    render(<EmployeeCard employee={{ ...phuong, joinedAt: "2026-03-01" }} />);
    expect(screen.getByText("Vào làm: 01/03/2026")).toBeInTheDocument();
    expect(screen.queryByText("Nhân viên mới")).toBeNull();
  });
});

describe("EmployeeList", () => {
  it("tiêu đề ghi số nhân viên: Danh sách nhân viên (12)", () => {
    render(<EmployeeList employees={employees} />);
    expect(screen.getByRole("heading", { level: 2, name: "Danh sách nhân viên (12)" })).toBeInTheDocument();
  });

  it("mỗi nhân viên một thẻ, đúng thứ tự dữ liệu", () => {
    render(<EmployeeList employees={employees} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(12);
    const names = screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent);
    expect(names).toEqual(employees.map((employee) => employee.name));
  });

  it("danh sách rỗng hiện Chưa có nhân viên nào. và tiêu đề (0)", () => {
    render(<EmployeeList employees={[]} />);
    expect(screen.getByText("Chưa có nhân viên nào.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Danh sách nhân viên (0)" })).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("danh sách có dữ liệu thì không hiện dòng Chưa có nhân viên nào.", () => {
    render(<EmployeeList employees={employees.slice(0, 2)} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    expect(screen.queryByText("Chưa có nhân viên nào.")).toBeNull();
  });

  it("bỏ nhân viên đầu danh sách thì thẻ của những người còn lại được giữ nguyên (key theo id)", () => {
    const { rerender } = render(<EmployeeList employees={employees.slice(0, 4)} />);
    const binhBefore = screen.getByRole("heading", { name: "Trần Thị Bình" }).closest("article");
    rerender(<EmployeeList employees={employees.slice(1, 4)} />);
    expect(screen.getByRole("heading", { level: 2, name: "Danh sách nhân viên (3)" })).toBeInTheDocument();
    const binhAfter = screen.getByRole("heading", { name: "Trần Thị Bình" }).closest("article");
    expect(binhAfter).toBe(binhBefore);
  });
});

describe("EmployeeSummary", () => {
  it("dữ liệu mẫu hiện Đang làm việc: 9 | Thử việc: 2 | Đã nghỉ việc: 1 và Tổng: 12", () => {
    render(<EmployeeSummary employees={employees} />);
    expect(screen.getByText("Đang làm việc: 9 | Thử việc: 2 | Đã nghỉ việc: 1")).toBeInTheDocument();
    expect(screen.getByText("Tổng: 12")).toBeInTheDocument();
  });

  it("đổi dữ liệu thì số liệu đổi theo ngay, không giữ số cũ", () => {
    const { rerender } = render(<EmployeeSummary employees={employees} />);
    rerender(<EmployeeSummary employees={[an, duc, phuong, employees[1]]} />);
    expect(screen.getByText("Đang làm việc: 2 | Thử việc: 1 | Đã nghỉ việc: 1")).toBeInTheDocument();
    expect(screen.getByText("Tổng: 4")).toBeInTheDocument();
  });

  it("danh sách rỗng hiện toàn số 0", () => {
    render(<EmployeeSummary employees={[]} />);
    expect(screen.getByText("Đang làm việc: 0 | Thử việc: 0 | Đã nghỉ việc: 0")).toBeInTheDocument();
    expect(screen.getByText("Tổng: 0")).toBeInTheDocument();
  });
});

describe("App", () => {
  it("tiêu đề trang là Danh bạ nhân viên Rikkei", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Danh bạ nhân viên Rikkei" })).toBeInTheDocument();
  });

  it("vùng tóm tắt và vùng danh sách cùng hiện đủ dữ liệu của 12 nhân viên", () => {
    render(<App />);
    const summary = within(screen.getByRole("region", { name: "Tóm tắt nhân viên" }));
    expect(summary.getByText("Tổng: 12")).toBeInTheDocument();
    const list = within(screen.getByRole("region", { name: "Danh sách nhân viên" }));
    expect(list.getByRole("heading", { level: 2, name: "Danh sách nhân viên (12)" })).toBeInTheDocument();
    expect(list.getAllByRole("heading", { level: 3 })).toHaveLength(12);
  });

  it("trên dữ liệu mẫu có đúng 2 nhãn Nhân viên mới và 11 dòng lương", () => {
    render(<App />);
    expect(screen.getAllByText("Nhân viên mới")).toHaveLength(2);
    expect(screen.getAllByText(/^Lương: /)).toHaveLength(11);
  });
});
