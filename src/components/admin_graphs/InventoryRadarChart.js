'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';

const InventoryRadarChart = ({ data }) => {
  const maxValue = Math.max(data.in_stock, data.on_hold, data.damaged, data.yet_to_return) + 50;

  const chartOptions = {
    backgroundColor: 'transparent',
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
            <span style="color:#22c55e;">●</span> On Hold: <b>${data.on_hold}</b><br/>      
            <span style="color:#f59e42;">●</span> Damaged: <b>${data.damaged}</b><br/>
            <span style="color:#f43f5e;">●</span> Yet to Return: <b>${data.yet_to_return}</b>
          </div>
        `;
      },  
    },
    radar: {
      shape: 'polygon',
      radius: '70%',
      center: ['50%', '55%'],
      splitNumber: 5,
      indicator: [
        { name: 'In Stock', max: maxValue },
        { name: 'On Hold', max: maxValue },
        { name: 'Damaged', max: maxValue },
        { name: 'Yet to Return', max: maxValue },
      ],
      name: {
        textStyle: {
          color: '#334155', 
          fontSize: 14,
          fontWeight: 500,
          backgroundColor: '#f1f5f9', 
          padding: [6, 14],           
          borderRadius: 6,     
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
            value: [data.in_stock, data.on_hold, data.damaged, data.yet_to_return],
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
