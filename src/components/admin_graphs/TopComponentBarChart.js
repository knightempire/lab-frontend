'use client';

import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';

const TopComponentsBarChart = ({ data }) => {
  const [displayBy, setDisplayBy] = useState('totalRequested');

  const topComponents = [...data]
    .sort((a, b) => b[displayBy] - a[displayBy])
    .slice(0, 10);

  const componentNames = topComponents.map(item => item.productName);
  const values = topComponents.map(item => item[displayBy]);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#f9fafb',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#111827',
        fontSize: 13,
      },
      formatter: (params) => {
        const { name, value } = params[0];
        return `<strong>${name}</strong><br/>${displayBy === 'totalRequested' ? 'Component Requested' : 'Request Count'}: ${value}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: componentNames,
      axisLabel: {
        interval: 0,
        rotate: 45,
        color: '#475569',
        fontSize: 12,
        overflow: 'truncate',
        formatter: (value) => value.length > 14 ? value.slice(0, 14) + '…' : value,
      },
      axisLine: {
        lineStyle: { color: '#cbd5e1' },
      },
    },
    yAxis: {
      type: 'value',
      // name: displayBy === 'totalRequested' ? 'Component Requested' : 'Request Count',
      nameTextStyle: {
        fontSize: 12,
        color: '#475569',
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#e2e8f0',
        },
      },
      axisLabel: {
        color: '#475569',
        fontSize: 12,
      },
    },
    series: [
      {
        data: values,
        type: 'bar',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#6366F1' },
              { offset: 1, color: '#A5B4FC' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '60%',
      },
    ],
  };

  return (
    <div className="w-full px-2 py-4 sm:px-4">
      {/* Toggle Buttons */}
      <div className="flex flex-wrap justify-center sm:justify-end mb-4 gap-2 px-2">
        <button
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            displayBy === 'totalRequested'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
          }`}
          onClick={() => setDisplayBy('totalRequested')}
        >
          Component Requested
        </button>
        <button
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            displayBy === 'requestCount'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
          }`}
          onClick={() => setDisplayBy('requestCount')}
        >
          Request Count
        </button>
      </div>

      {/* Chart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] md:min-w-0">
          <ReactECharts
            option={option}
            style={{ height: '420px', width: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TopComponentsBarChart;
