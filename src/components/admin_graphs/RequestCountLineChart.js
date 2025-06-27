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

  // Close dropdown on scroll or resize
  React.useEffect(() => {
    const handleScrollOrResize = () => {
      setDropdownOpen(false);
    };

    window.addEventListener('scroll', handleScrollOrResize);
    window.addEventListener('resize', handleScrollOrResize);
    
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
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
        // Rotate labels on small screens
        rotate: window.innerWidth < 640 ? 45 : 0,
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
      left: window.innerWidth < 640 ? '15%' : '8%',
      right: '4%',
      bottom: window.innerWidth < 640 ? '20%' : '10%',
      top: '10%',
      containLabel: true,
    },
    series: [
      {
        name: 'Requests',
        type: 'line',
        smooth: true,
        data: counts,
        symbol: 'circle',
        symbolSize: window.innerWidth < 640 ? 4 : 6,
        itemStyle: {
          color: '#6366F1',
        },
        lineStyle: {
          color: '#6366F1',
          width: window.innerWidth < 640 ? 2 : 3,
        },
        areaStyle: {
          color: 'rgba(99, 102, 241, 0.1)',
        },
      },
    ],
  };

  return (
    <div className="w-full mx-auto p-2 sm:p-4 relative">
      {/* Header with responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
        {/* Title and total - stack on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
            Monthly Requests Overview
          </h2>
          <span className="inline-block text-xs sm:text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg w-fit">
            Total: {totalRequests.toLocaleString()}
          </span>
        </div>
        
        {/* Year dropdown */}
        <div className="relative w-fit" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="border border-gray-300 rounded px-3 py-1.5 sm:py-1 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1 min-w-[70px] sm:min-w-[80px] justify-between shadow-sm hover:bg-gray-50 transition-colors"
          >
            {selectedYear} <span className="text-xs">▼</span>
          </button>
          
          {/* Dropdown with same width as button */}
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 w-full">
              <ul className="py-1 max-h-48 overflow-y-auto">
                {years.map((year) => (
                  <li
                    key={year}
                    className={`px-3 py-2 cursor-pointer transition-colors text-xs sm:text-sm
                    ${year === selectedYear
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-blue-50"}`}
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
      
      {/* Chart with responsive height */}
      <div className="w-full">
        <ReactECharts 
          option={options} 
          style={{ 
            height: window.innerWidth < 640 ? 250 : window.innerWidth < 1024 ? 280 : 320,
            width: '100%'
          }}
          opts={{
            renderer: 'canvas'
          }}
        />
      </div>
    </div>
  );
};

export default MonthlyRequestLineChart;