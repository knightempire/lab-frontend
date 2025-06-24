import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PaddedPieChart = ({ data }) => {
  // Transform the passed data prop into recharts-friendly format
  const chartData = [
    { name: 'Accepted', value: data.accepted || 0, color: '#6366f1' },
    { name: 'Returned', value: data.returned || 0, color: '#10b981' },
    { name: 'Closed', value: data.closed || 0, color: '#ef4444' },
    { name: 'Rejected', value: data.rejected || 0, color: '#f59e0b' },
    { name: 'Reissued', value: data.reissued || 0, color: '#06b6d4' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">Count: {data.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full rounded-xl shadow-lg">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={140}
            paddingAngle={4}
            dataKey="value"
            cornerRadius={8}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaddedPieChart;
