import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PaddedPieChart = ({ data }) => {
  const chartData = [
    { name: 'Accepted', value: data.accepted || 0, color: '#6366f1' },
    { name: 'Returned', value: data.returned || 0, color: '#10b981' },
    { name: 'Closed', value: data.closed || 0, color: '#ef4444' },
    { name: 'Rejected', value: data.rejected || 0, color: '#f59e0b' },
    { name: 'Reissued', value: data.reissued || 0, color: '#06b6d4' },
  ];

  return (
    <div className="w-full h-full rounded-xl shadow-lg bg-white p-4 sm:p-6 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height={340}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={135}
            paddingAngle={5}
            dataKey="value"
            cornerRadius={12}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) =>
              active && payload && payload.length ? (
                <div className="bg-white border border-gray-300 rounded-xl shadow-xl p-4 min-w-[140px]">
                  <p className="font-bold text-gray-900">{payload[0].name}</p>
                  <p className="text-base text-gray-700">Count: <span className="font-semibold">{payload[0].value}</span></p>
                </div>
              ) : null
            }
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Responsive Legend */}
      <div className="w-full flex flex-wrap justify-center gap-4 mt-6">
        {chartData.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center gap-2 min-w-[110px] px-2 py-1 rounded-lg bg-gray-50"
          >
            <span
              className="inline-block w-5 h-5 rounded-full border border-gray-200"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-semibold text-gray-800">{entry.name}</span>
            <span className="ml-1 px-2 py-0.5 rounded bg-gray-200 text-xs font-bold text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaddedPieChart;