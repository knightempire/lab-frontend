'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';

const InventoryRadarChart = ({ data }) => {
  const maxValue = Math.max(data.in_stock, data.on_hold, data.yet_to_return) + 50;

  const chartOptions = {
    backgroundColor: 'transparent',
    title: {
      text: 'Product Inventory Distribution',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 18,
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        color: '#1f2937', 
      },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#e0e7ef',
      textStyle: {
        color: '#334155',
        fontWeight: 500,
      },
      extraCssText: 'box-shadow: 0 2px 10px rgba(0,0,0,0.08);',
      formatter: function(params) {
        return `
          <div style="font-weight:600; color:#1e293b; margin-bottom:4px;">${params.name}</div>
          <div style="line-height:1.7">
            <span style="color:#6366f1;">●</span> In Stock: <b>${data.in_stock}</b><br/>
            <span style="color:#f59e42;">●</span> On Hold: <b>${data.on_hold}</b><br/>
            <span style="color:#f43f5e;">●</span> Yet to Return: <b>${data.yet_to_return}</b>
          </div>
        `;
      }
    },
    legend: {
      bottom: 10,
      data: ['Inventory'],
      textStyle: {
        color: '#374151', 
        fontSize: 14,
        fontWeight: 500,
      },
      icon: 'circle',
    },
    radar: {
      shape: 'circle',
      radius: '65%',
      center: ['50%', '55%'],
      splitNumber: 5,
      indicator: [
        { name: 'In Stock', max: maxValue },
        { name: 'On Hold', max: maxValue },
        { name: 'Yet to Return', max: maxValue },
      ],
      name: {
        textStyle: {
          color: '#334155', 
          fontSize: 14,
          fontWeight: 500,
        },
      },
      splitLine: {
        lineStyle: {
          type: 'dotted',
          color: '#cbd5e1',
        },
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb', 
        },
      },
      splitArea: {
        areaStyle: {
          color: ['#ffffff', '#f8fafc'], 
        },
      },
    },
    series: [
      {
        name: 'Inventory',
        type: 'radar',
        data: [
          {
            value: [data.in_stock, data.on_hold, data.yet_to_return],
            name: 'Inventory',
            areaStyle: {
              opacity: 0.3,
              color: '#6366F1',
            },
            lineStyle: {
              width: 3,
              color: '#6366F1',
            },
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#6366F1',
              borderColor: '#ffffff',
              borderWidth: 2,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 6,
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full">
      <ReactECharts
        option={chartOptions}
        style={{ height: 440 }}
        className="radar-chart"
      />
    </div>
  );
};

export default InventoryRadarChart;
