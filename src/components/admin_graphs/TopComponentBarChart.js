'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';

const TopComponentsBarChart = ({ data }) => {
  // Ensure we only take top 10 based on count
  const topComponents = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const componentNames = topComponents.map(item => item.component);
  const requestCounts = topComponents.map(item => item.count);

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
        return `<strong>${name}</strong><br/>Requests: ${value}`;
      },
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: componentNames,
      axisLabel: {
        interval: 0,
        rotate: 30,
        color: '#475569',
        fontSize: 12,
        formatter: (value) => value.length > 12 ? value.slice(0, 12) + '…' : value,
      },
      axisLine: {
        lineStyle: { color: '#cbd5e1' },
      },
    },
    yAxis: {
      type: 'value',
      name: 'Requests',
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
        data: requestCounts,
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
        barWidth: 28,
      },
    ],
  };

  return (
    <div className="w-full mx-auto p-2">
      <ReactECharts option={option} style={{ height: 420 }} />
    </div>
  );
};

export default TopComponentsBarChart;
