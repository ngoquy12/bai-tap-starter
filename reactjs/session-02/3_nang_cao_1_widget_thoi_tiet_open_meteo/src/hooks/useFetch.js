// ===== BÀI LÀM: hook tải dữ liệu có hủy yêu cầu =====

// TODO: gọi fetcher(signal) trong useEffect mỗi khi `deps` đổi, trả { data, loading, error }.
function useFetch(fetcher, deps) {
  return { data: null, loading: false, error: null };
}

export default useFetch;
