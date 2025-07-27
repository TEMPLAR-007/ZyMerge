import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

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

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      endPage = Math.min(totalPages - 1, 4);
    }

    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 3);
    }
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
      <Button
        key={index}
        variant={page === currentPage ? "default" : "outline"}
        size="sm"
        onClick={() => typeof page === 'number' ? onPageChange(page) : null}
        disabled={loading || typeof page !== 'number'}
        className={typeof page !== 'number' ? "cursor-default" : ""}
      >
        {page === '...' ? <MoreHorizontal className="h-4 w-4" /> : page}
      </Button>
    ));
  };

  return (
    <div className="flex justify-center items-center gap-1 sm:gap-2 mt-4 sm:mt-8 px-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage || loading}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </Button>

      <div className="flex items-center gap-1 overflow-x-auto max-w-[60vw] sm:max-w-none">
        {renderPageNumbers()}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || loading}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>

      {totalPages > 5 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange('last')}
          disabled={currentPage === totalPages || loading}
          className="hidden sm:flex px-2 sm:px-3"
        >
          Last
        </Button>
      )}
    </div>
  );
}