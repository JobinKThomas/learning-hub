import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  hasNextPage = false,
  hasPrevPage = false,
  totalItems = 0,
  itemsPerPage = 10,
  itemName = 'items',
  colorScheme = 'indigo', // 'indigo' | 'purple'
}) {
  if (totalPages <= 1 && totalItems <= itemsPerPage) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with optional ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const isPurple = colorScheme === 'purple';
  const activeBtnClass = isPurple
    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
    : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-slate-100">
      {/* Range text */}
      <div className="text-xs text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-900">{startItem}</span> to{' '}
        <span className="font-bold text-slate-900">{endItem}</span> of{' '}
        <span className="font-bold text-slate-900">{totalItems}</span> {itemName}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 flex-wrap justify-center gap-y-2">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage && currentPage <= 1}
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition gap-1 min-h-[36px]"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-1.5 py-1 text-xs text-slate-400 select-none"
                >
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`min-w-[34px] h-[36px] px-2 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                  isCurrent
                    ? activeBtnClass
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage && currentPage >= totalPages}
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition gap-1 min-h-[36px]"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
