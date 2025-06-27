'use client';

import React, { useMemo, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';

const getYear = (monthLabel) => {
  return monthLabel.split(' ')[1];
};

const getMonth = (monthLabel) => {
  return monthLabel.split(' ')[0];
};

const monthOrder = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MonthlyRequestLineChart = ({ data }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Extract unique years from data
  const years = useMemo(
    () => Array.from(new Set(data.map(item => getYear(item.month)))),
    [data]
  );

  // Default to latest year
  const [selectedYear, setSelectedYear] = useState(years[years.length - 1]);

  // Filter and sort data for selected year
  const filteredData = useMemo(() => {
    return data
      .filter(item => getYear(item.month) === selectedYear)
      .sort((a, b) => monthOrder.indexOf(getMonth(a.month)) - monthOrder.indexOf(getMonth(b.month)));
  }, [data, selectedYear]);

  const months = filteredData.map(item => item.month.split(' ')[0]);
  const counts = filteredData.map(item => item.count);

  const totalRequests = filteredData.reduce((sum, item) => sum + item.count, 0);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const options = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#f9fafb',
      borderColor: '#e5e7eb',
      textStyle: {
        color: '#111827',
        fontSize: 13,
      },
      formatter: (params) => {
        const { name, data } = params[0];
        return `<strong>${name}</strong><br/>Requests: ${data}`;
      },
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: {
        lineStyle: { color: '#cbd5e1' },
      },
      axisLabel: {
        fontSize: 12,
        color: '#475569', 
      },
    },
    yAxis: {
      type: 'value',
      name: 'Requests',
      nameTextStyle: {
        fontSize: 12,
        color: '#475569',
        align: 'left',
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#e2e8f0',
        },
      },
      axisLabel: {
        fontSize: 12,
        color: '#475569',
      },
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '10%',
      containLabel: true,
    },
    series: [
      {
        name: 'Requests',
        type: 'line',
        smooth: true,
        data: counts,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#6366F1',
        },
        lineStyle: {
          color: '#6366F1',
          width: 3,
        },
        areaStyle: {
          color: 'rgba(99, 102, 241, 0.1)',
        },
      },
    ],
  };

  return (
    <div className="w-full mx-auto p-4 relative">
      {/* Fixed positioned dropdown container */}
      <div className="absolute right-6 top-6 z-50" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="border border-gray-300 rounded px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1 min-w-[80px] justify-between shadow-sm"
          >
            {selectedYear} <span className="text-xs">▼</span>
          </button>
          
          {/* Inline dropdown - no portal */}
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[100px]">
              <ul className="py-1 max-h-48 overflow-y-auto">
                {years.map((year) => (
                  <li
                    key={year}
                    className={`px-4 py-2 cursor-pointer transition-colors whitespace-nowrap text-sm
                    ${year === selectedYear
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                      : "text-gray-700"}
                    hover:bg-blue-50`}
                    onClick={() => {
                      setSelectedYear(year);
                      setDropdownOpen(false);
                    }}
                  >
                    {year}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-start gap-4 mb-2 mt-1 ml-2 pr-24">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          Monthly Requests Overview
        </h2>
        <span className="mt-1 text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
          Total: {totalRequests}
        </span>
      </div>
      
      <ReactECharts option={options} style={{ height: 400 }} />
    </div>
  );
};

export default MonthlyRequestLineChart;