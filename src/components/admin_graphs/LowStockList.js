'use client';

import { useState } from "react";
import { Package } from "lucide-react";
import Pagination from "../pagination";

export default function StockAlertsList({ data = [] }) {
  const itemsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIdx, startIdx + itemsPerPage);

  if (!data.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[320px] py-10 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl border border-blue-100 shadow-inner">
        <Package className="w-16 h-16 mb-4 text-blue-200" />
        <div className="text-2xl font-bold text-blue-900 mb-2">All Stocked Up!</div>
        <div className="text-base text-blue-700 mb-1">No components are running low.</div>
        <div className="text-sm text-blue-400">Check back later for low stock alerts.</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col py-2">
      <ol className="flex-1 flex flex-col">
        {currentData.map((item, idx) => (
          <li
            key={startIdx + idx}
            className={`
              group flex items-center gap-3 px-6 py-4 border-b last:border-b-0
              bg-gray-50 hover:bg-blue-50 transition cursor-pointer
            `}
            style={{ position: "relative" }}
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full font-bold text-base mr-2 bg-gray-200 text-gray-500 group-hover:bg-blue-200 group-hover:text-blue-700 transition">
              {startIdx + idx + 1}
            </span>
            <span className="flex-1 truncate font-medium text-gray-800 group-hover:text-blue-800 transition">
              {item.product_name}
            </span>
            <span className="ml-4 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 bg-white/80 text-gray-700 group-hover:border-blue-200 group-hover:text-blue-700 transition">
              {item.inStock} in stock
            </span>
          </li>
        ))}
      </ol>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}