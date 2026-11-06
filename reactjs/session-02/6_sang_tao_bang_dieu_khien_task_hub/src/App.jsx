// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import MainLayout from "./components/MainLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import TaskDetailPage from "./pages/TaskDetailPage.jsx";
import EmployeesPage from "./pages/EmployeesPage.jsx";
import EmployeeProfilePage from "./pages/EmployeeProfilePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Chặn người chưa đăng nhập: đưa về /login.
function RequireAuth(props) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return props.children;
}

// Bảng tuyến của Task Hub. BrowserRouter nằm ở main.jsx (trong test là MemoryRouter).
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employees/:id" element={<EmployeeProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
