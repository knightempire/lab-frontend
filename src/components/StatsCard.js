'use client';

import React from "react";
import { Info } from "lucide-react";

const StatsCard = ({ title, value, tooltip, icon: Icon, color = "blue" }) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    gray: "bg-gray-100 text-gray-600",
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          {title}
          {tooltip && (
            <span className="group relative cursor-pointer">
              <Info className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
              <div className="absolute bottom-full left-1/2 z-10 mb-1 w-max max-w-xs -translate-x-1/2 rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-opacity">
                {tooltip}
              </div>
            </span>
          )}
        </div>
        <div className="mt-1 text-3xl font-bold text-gray-900">{value}</div>
      </div>
      {Icon && (
        <div className={`flex-shrink-0 rounded-full p-2 ${colorMap[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      )}
    </div>
  );
};

export default StatsCard;