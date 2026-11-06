// ===== BÀI LÀM: instance axios và hàm đổi lỗi thành thông báo =====
import axios from "axios";

// TODO: tạo instance bằng axios.create với baseURL là API_BASE trong src/config.js (xem đề bài, mục 2).
const http = axios.create({});

// TODO: đổi lỗi axios thành thông báo tiếng Việt theo status (xem bảng ở đề bài).
export function getErrorMessage(error) {
  return "";
}

export default http;
