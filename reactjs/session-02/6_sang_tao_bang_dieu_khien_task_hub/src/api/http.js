// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import axios from "axios";
import { API_BASE } from "../config.js";

// Một instance axios dùng chung cho endpoint crudcrud của bạn (API_BASE trong src/config.js).
const http = axios.create({ baseURL: API_BASE });

// Đổi lỗi axios thành câu thông báo tiếng Việt để hiện cho người dùng.
// Lưu ý: khi endpoint hết 100 yêu cầu, crudcrud thật trả 400 nhưng không kèm CORS, nên trình duyệt chỉ báo mất kết nối.
export function getErrorMessage(error) {
  if (!axios.isAxiosError(error)) return error.message || "Có lỗi xảy ra, hãy thử lại.";
  if (!error.response) return "Không kết nối được máy chủ.";
  if (error.response.status === 404) return "Không tìm thấy dữ liệu.";
  if (error.response.status >= 500) return "Máy chủ đang gặp sự cố, hãy thử lại sau.";
  if (error.response.status === 400 && String(error.response.data).includes("exceeded allowed number of requests")) {
    return "Endpoint đã hết hạn mức 100 yêu cầu, hãy lấy endpoint mới ở crudcrud.com.";
  }
  return "Có lỗi xảy ra, hãy thử lại.";
}

export default http;
