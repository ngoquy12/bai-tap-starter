// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { createContext, useContext, useState } from "react";

// Ngữ cảnh đăng nhập. user là đối tượng nhân viên (id, name, email, city, ...) hoặc null.
// Không mật khẩu, không token: chỉ giữ nhân viên đang đăng nhập trong state.
export const AuthContext = createContext({ user: null, login() {}, logout() {} });

export function AuthProvider(props) {
  const [user, setUser] = useState(null);
  const value = { user, login: (employee) => setUser(employee), logout: () => setUser(null) };
  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

// Hook lấy { user, login, logout }.
export function useAuth() {
  return useContext(AuthContext);
}
