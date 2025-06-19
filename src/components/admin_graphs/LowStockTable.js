'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Pagination Component
function Pagination({ currentPage, totalPages, setCurrentPage }) {
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
    <div className="flex justify-between items-center pt-3 text-sm text-gray-600">
      <div className="pl-4">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2 pr-4">
        <button
          onClick={goToPrev}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1 rounded-lg border disabled:opacity-40 hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>

        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={inputPage}
            onChange={handleInputChange}
            className="w-12 text-center px-2 py-1 border rounded-lg"
          />
        </div>

        <button
          onClick={goToNext}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1 rounded-lg border disabled:opacity-40 hover:bg-gray-100"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Table Component
function Table({ columns, rows, currentPage, itemsPerPage, renderCell, renderHeaderCell }) {
  return (
    <div className="mt-4 overflow-x-auto bg-white shadow rounded-lg">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-6 py-3 text-center w-12">S.No</th>
            {columns.map(col => (
              <th key={col.key} className="px-6 py-4 text-center">
                {renderHeaderCell ? renderHeaderCell(col) : col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50">
              <td className="px-6 py-4 text-center font-medium w-12">
                {((currentPage - 1) * itemsPerPage) + idx + 1}
              </td>
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-center font-medium">
                  {renderCell ? renderCell(col.key, row, idx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Low Stock Items Table Component
export default function LowStockItemsTable({ data = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Define table columns
  const columns = [
    { key: 'product_name', label: 'Component Name' },
    { key: 'total_items', label: 'Total Items' },
    { key: 'in_stock', label: 'Available Count' }
  ];

  // Custom cell renderer for styling low stock counts
  const renderCell = (key, row, idx) => {
    if (key === 'count') {
      const count = row[key];
      const colorClass = count <= 2 ? 'text-red-600 font-bold' : 
                        count <= 4 ? 'text-yellow-600 font-semibold' : 
                        'text-gray-700';
      return <span className={colorClass}>{count}</span>;
    }
    return row[key];
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Low Stock Items</h2>
      </div>
      
      <Table
        columns={columns}
        rows={currentData}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        renderCell={renderCell}
      />
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}