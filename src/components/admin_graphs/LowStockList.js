'use client';

import { Package, AlertTriangle, CheckCircle } from "lucide-react";

export default function StockAlertsList({ data = [] }) {
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
    <div className="w-full h-full max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 flex flex-col gap-3 py-2">
      {data.map((item, idx) => {
        let color =
          item.in_stock <= 2
            ? "bg-red-50 border-red-200 text-red-700"
            : item.in_stock <= 4
            ? "bg-yellow-50 border-yellow-200 text-yellow-800"
            : "bg-blue-50 border-blue-200 text-blue-800";
        let icon =
          item.in_stock <= 2 ? (
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          ) : item.in_stock <= 4 ? (
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
          ) : (
            <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
          );
        return (
          <div
            key={idx}
            className={`border rounded-xl shadow-sm transition flex items-center justify-between px-5 py-3 ${color}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {icon}
              <span className="font-semibold truncate">{item.product_name}</span>
            </div>
            <span className="ml-4 text-xs font-bold bg-white/80 px-3 py-1 rounded-full border border-gray-200">
              {item.in_stock} in stock
            </span>
          </div>
        );
      })}
    </div>
  );
}