// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import axios from "axios";
import { API_BASE } from "../config.js";

// Mọi yêu cầu đi tới endpoint crudcrud.com của bạn (API_BASE trong src/config.js).
export const http = axios.create({ baseURL: API_BASE });

// Đổi lỗi của axios thành một câu tiếng Việt để hiện cho người dùng.
// Mất kết nối và hết hạn mức 100 yêu cầu của crudcrud (trình duyệt chỉ thấy Network Error) dùng chung một câu.
export function getErrorMessage(error) {
  const quotaExceeded = error.response && error.response.status === 400 && String(error.response.data).includes("exceeded");
  if (!error.response || quotaExceeded) {
    return "Không kết nối được máy chủ API. Hãy kiểm tra mạng; nếu endpoint đã dùng quá 100 yêu cầu hoặc quá 24 giờ, hãy lấy endpoint mới ở crudcrud.com.";
  }
  const status = error.response.status;
  if (status === 404) return "Không tìm thấy dữ liệu.";
  if (status >= 500) return "Máy chủ đang gặp sự cố, hãy thử lại sau.";
  return `Yêu cầu không hợp lệ (mã ${status}).`;
}

export default http;
