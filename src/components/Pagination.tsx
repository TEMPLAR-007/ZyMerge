interface PaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  loading: boolean;
  onPageChange: (page: number | string) => void;
}

export function Pagination({ pagination, loading, onPageChange }: PaginationProps) {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];

    // Always show first page
    pages.push(1);

    // Calculate range of pages to show
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if we're near the beginning
    if (currentPage <= 3) {
      endPage = Math.min(totalPages - 1, 4);
    }

    // Adjust if we're near the end
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 3);
    }

    // Add ellipsis and middle pages
    if (startPage > 2) {
      pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    return pages.map((page, index) => (
      <button
        key={index}
        onClick={() => typeof page === 'number' ? onPageChange(page) : null}
        disabled={loading || typeof page !== 'number'}
        className={`px-3 py-2 rounded-md ${
          page === currentPage
            ? "bg-dark dark:bg-light text-light dark:text-dark"
            : typeof page === 'number'
            ? "bg-slate-200 dark:bg-slate-800 text-dark dark:text-light hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
            : "text-gray-500 dark:text-gray-400 cursor-default"
        }`}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage || loading}
        className="bg-dark dark:bg-light text-light dark:text-dark rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <div className="flex items-center gap-2">
        {renderPageNumbers()}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || loading}
        className="bg-dark dark:bg-light text-light dark:text-dark rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>

      {totalPages > 5 && (
        <button
          onClick={() => onPageChange('last')}
          disabled={currentPage === totalPages || loading}
          className="bg-dark dark:bg-light text-light dark:text-dark rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Last
        </button>
      )}
    </div>
  );
}