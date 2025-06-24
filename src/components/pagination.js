'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export default function Pagination({ currentPage, totalPages, setCurrentPage }) {
  const [inputPage, setInputPage] = useState(currentPage);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const pageNum = Number(value);
      setInputPage(value);

      if (pageNum >= 1 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
        inputRef.current?.blur();
      } else if (value === '') {
        setInputPage('');
      } else {
        setInputPage(currentPage);
        inputRef.current?.blur();
      }
    }
  };

  const goToPrev = () => {
    const newPage = Math.max(currentPage - 1, 1);
    setCurrentPage(newPage);
    setInputPage(newPage);
    inputRef.current?.blur();
  };

  const goToNext = () => {
    const newPage = Math.min(currentPage + 1, totalPages);
    setCurrentPage(newPage);
    setInputPage(newPage);
    inputRef.current?.blur();
  };

  return (
    <div className="flex flex-wrap justify-between items-center gap-2 pt-2 sm:pt-3 text-xs sm:text-sm md:text-base text-gray-600 w-full">
      <div className="pl-2 sm:pl-4">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 pr-2 sm:pr-4">
        <button
          onClick={goToPrev}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg border disabled:opacity-40 hover:bg-gray-100 text-xs sm:text-sm"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Prev
        </button>

        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={inputPage}
            onChange={handleInputChange}
            className="w-10 sm:w-12 text-center px-1 sm:px-2 py-1 border rounded-lg text-xs sm:text-sm"
          />
        </div>

        <button
          onClick={goToNext}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg border disabled:opacity-40 hover:bg-gray-100 text-xs sm:text-sm"
        >
          Next
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
