export default function AdminPagination({
  page = 0,
  totalPages = 0,
  totalElements = 0,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return totalElements > 0 ? (
      <div className="text-center text-muted small mt-3">
        총 {totalElements.toLocaleString()}건
      </div>
    ) : null;
  }

  const currentPage = Math.min(Math.max(page, 0), totalPages - 1);
  const maxVisiblePages = 5;
  let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(0, endPage - maxVisiblePages + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );

  const moveTo = (nextPage) => {
    if (nextPage < 0 || nextPage >= totalPages || nextPage === currentPage) return;
    onPageChange(nextPage);
  };

  return (
    <div className="d-flex flex-column align-items-center gap-2 mt-3 mb-4">
      <nav aria-label="페이지 선택">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => moveTo(0)}
              disabled={currentPage === 0}
              aria-label="첫 페이지"
            >
              «
            </button>
          </li>
          <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => moveTo(currentPage - 1)}
              disabled={currentPage === 0}
              aria-label="이전 페이지"
            >
              ‹
            </button>
          </li>

          {pages.map((pageNumber) => (
            <li
              key={pageNumber}
              className={`page-item ${pageNumber === currentPage ? "active" : ""}`}
            >
              <button
                type="button"
                className="page-link"
                onClick={() => moveTo(pageNumber)}
                aria-current={pageNumber === currentPage ? "page" : undefined}
              >
                {pageNumber + 1}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}
          >
            <button
              type="button"
              className="page-link"
              onClick={() => moveTo(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              aria-label="다음 페이지"
            >
              ›
            </button>
          </li>
          <li
            className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}
          >
            <button
              type="button"
              className="page-link"
              onClick={() => moveTo(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
              aria-label="마지막 페이지"
            >
              »
            </button>
          </li>
        </ul>
      </nav>
      <div className="text-muted small">
        {currentPage + 1} / {totalPages}페이지 · 총 {totalElements.toLocaleString()}건
      </div>
    </div>
  );
}
