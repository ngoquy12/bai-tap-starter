// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import EmployeeSummary from "./components/EmployeeSummary.jsx";
import EmployeeList from "./components/EmployeeList.jsx";
import employees from "./data/employees.js";

// Trang chính của danh bạ: tiêu đề, vùng tóm tắt và vùng danh sách nhân viên.
function App() {
  return (
    <main className="container py-4">
      <h1 className="h2 mb-4">Danh bạ nhân viên Rikkei</h1>
      <section aria-label="Tóm tắt nhân viên" className="mb-4">
        <EmployeeSummary employees={employees} />
      </section>
      <section aria-label="Danh sách nhân viên">
        <EmployeeList employees={employees} />
      </section>
    </main>
  );
}

export default App;
