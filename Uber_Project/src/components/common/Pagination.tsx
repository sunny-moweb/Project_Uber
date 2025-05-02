import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPaginationRange = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (left > 1) {
      range.unshift(1);
      if (left > 2) range.splice(1, 0, "...");
    }

    if (right < totalPages) {
      range.push(totalPages);
      if (right < totalPages - 1) range.splice(range.length - 1, 0, "...");
    }
    return range;
  };

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>

      {getPaginationRange().map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            className={`px-3 py-1 border rounded ${
              currentPage === page ? "bg-gray-300 font-bold" : ""
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-3 py-1">
            {page}
          </span>
        )
      )}

      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
