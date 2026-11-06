// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import { useEffect, useState } from "react";
import axios from "axios";
import { getErrorMessage } from "../api/http.js";

// Gọi fetcher(signal) mỗi khi deps đổi; trả { data, loading, error } (error là chuỗi, rỗng khi không lỗi).
// Yêu cầu cũ bị hủy khi deps đổi hoặc component bị gỡ.
function useFetch(fetcher, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: "" }));
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
