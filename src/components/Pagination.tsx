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
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage || loading}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center gap-1">
        {renderPageNumbers()}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || loading}
        className="flex items-center gap-2"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>

      {totalPages > 5 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange('last')}
          disabled={currentPage === totalPages || loading}
        >
          Last
        </Button>
      )}
    </div>
  );
}