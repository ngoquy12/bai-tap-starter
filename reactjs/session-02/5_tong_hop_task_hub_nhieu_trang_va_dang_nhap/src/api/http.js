// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import axios from "axios";
import { API_BASE } from "../config.js";

// Một instance axios dùng chung: mọi yêu cầu gửi tới endpoint crudcrud trong src/config.js.
export const http = axios.create({ baseURL: API_BASE });

// Đổi lỗi của axios thành câu tiếng Việt để hiện cho người dùng.
// Mất mạng và hết hạn mức 100 yêu cầu của crudcrud trông giống nhau trên trình duyệt: không có phản hồi (Network Error),
// nên dùng chung một câu. Bản giả trong test trả 400 kèm chữ "exceeded allowed number of requests" cho ca hết hạn mức.
export function getErrorMessage(error) {
  const quotaExceeded =
    error?.response?.status === 400 && /exceeded allowed number of requests/.test(String(error.response.data));
  if (!error || !error.response || quotaExceeded) {
    return "Không kết nối được máy chủ. Hãy kiểm tra mạng; nếu vẫn lỗi, endpoint crudcrud có thể đã hết hạn mức hoặc hết hạn.";
  }
  const status = error.response.status;
  if (status === 404) return "Không tìm thấy dữ liệu (404).";
  if (status >= 500) return "Máy chủ đang gặp sự cố, hãy thử lại sau.";
  return "Yêu cầu không hợp lệ.";
}
