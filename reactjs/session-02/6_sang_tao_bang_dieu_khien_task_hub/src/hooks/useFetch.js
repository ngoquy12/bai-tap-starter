// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { useEffect, useState } from "react";
import axios from "axios";
import { getErrorMessage } from "../api/http.js";

// Gọi fetcher(signal) mỗi khi deps đổi; hủy yêu cầu cũ khi deps đổi hoặc khi gỡ component.
// Trả { data, loading, error } với error là chuỗi thông báo ("" khi không lỗi).
function useFetch(fetcher, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: "" });
    fetcher(controller.signal)
      .then((data) => setState({ data, loading: false, error: "" }))
      .catch((error) => {
        if (axios.isCancel(error)) return;
        setState({ data: null, loading: false, error: getErrorMessage(error) });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export default useFetch;
