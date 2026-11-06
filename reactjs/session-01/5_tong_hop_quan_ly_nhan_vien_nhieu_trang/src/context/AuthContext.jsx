// ===== BÀI LÀM: AuthProvider và useAuth (người đăng nhập dùng chung) =====
// TODO: AuthProvider giữ user (null hoặc một nhân viên), login, logout; useAuth ném lỗi khi thiếu Provider (chức năng 6).
function AuthProvider({ children, initialUser = null }) {
  return children;
}

function useAuth() {
  return { user: null, login() {}, logout() {} };
}

export { AuthProvider, useAuth };
