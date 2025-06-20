'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const RequestStatusChart = ({ data, title = "", chartType = "pie" }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const chartData = data;

  // Color mapping for different statuses
  const colorMap = {
    accepted: '#10B981', // Green
    closed: '#3B82F6',   // Blue
    reissued: '#F59E0B', // Orange
    rejected: '#EF4444'  // Red
  };

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current);

    // Prepare data for ECharts
    const pieData = Object.entries(chartData).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value,
      itemStyle: {
        color: colorMap[key.toLowerCase()]
      }
    }));

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          const percentage = params.percent;
          const value = params.value;
          const name = params.name;
          return `<strong>${name}</strong><br/>Count: ${value}<br/>Percentage: ${percentage}%`;
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff'
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 35,
        left: 'center',
        itemGap: 20,
        textStyle: {
          fontSize: 12,
          color: '#6B7280'
        },
        icon: 'circle'
      },
      series: [
        {
          name: 'Request Status',
          type: chartType === 'doughnut' ? 'pie' : 'pie',
          radius: chartType === 'doughnut' ? ['40%', '70%'] : '60%',
          center: ['50%', '45%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {c}',
            fontSize: 11,
            color: '#374151'
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10
          }
        }
      ],
      responsive: true
    };

    chartInstance.current.setOption(option);

    // Handle resize
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, [chartData, title, chartType]);

  return (
    <div className="w-full relative">
      <div 
        ref={chartRef} 
        style={{ 
          width: '100%', 
          height: '450px',
          minHeight: '400px'
        }}
        className="bg-white rounded-lg"
      />
    </div>
  );
};

export default RequestStatusChart;