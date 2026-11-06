// ===== BÀI LÀM: AuthProvider và useAuth (đăng nhập bằng email nhân viên) =====
import { createContext } from "react";

const AuthContext = createContext(null);

// TODO: AuthProvider({ children, initialUser = null }) giữ nhân viên đang đăng nhập (user) và cung cấp
// { user, login, logout } qua AuthContext.Provider. Gợi ý: useData().loadEmployees() trả danh sách nhân viên đã tải.
// Xem mục 2 của đề để biết login(email) phải làm gì.
function AuthProvider({ children }) {
  return children;
}

// TODO: trả về { user, login, logout } từ context; ném lỗi khi dùng ngoài AuthProvider.
function useAuth() {
  return { user: null, login: async () => null, logout: () => {} };
}

export { AuthContext, AuthProvider, useAuth };
