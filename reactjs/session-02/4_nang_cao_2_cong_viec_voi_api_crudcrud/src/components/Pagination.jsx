// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Thanh phân trang: nút Trước (vô hiệu ở trang 1), chữ "Trang P / T", nút Sau (vô hiệu ở trang cuối).
function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <nav className="d-flex align-items-center gap-3" aria-label="Phân trang">
      <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={onPrev}>
        Trước
      </button>
      <span>{`Trang ${page} / ${totalPages}`}</span>
      <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={onNext}>
        Sau
      </button>
    </nav>
  );
}

export default Pagination;
