// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { Route, Routes } from "react-router-dom";
import { EmployeesProvider } from "./context/EmployeesContext.jsx";
import MainLayout from "./components/MainLayout.jsx";
import EmployeeCreatePage from "./pages/EmployeeCreatePage.jsx";
import EmployeeDetailPage from "./pages/EmployeeDetailPage.jsx";
import EmployeeEditPage from "./pages/EmployeeEditPage.jsx";
import EmployeesPage from "./pages/EmployeesPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Bảng tuyến của ứng dụng, bọc trong EmployeesProvider để mọi trang dùng chung một danh sách đã tải. Router (BrowserRouter) được bọc ở main.jsx; test bọc MemoryRouter.
function App() {
  return (
    <EmployeesProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<EmployeesPage />} />
          <Route path="employees/new" element={<EmployeeCreatePage />} />
          <Route path="employees/:id" element={<EmployeeDetailPage />} />
          <Route path="employees/:id/edit" element={<EmployeeEditPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </EmployeesProvider>
  );
}

export default App;
