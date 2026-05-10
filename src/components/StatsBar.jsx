import React from 'react';

export default function StatsBar({ stats }) {
  const items = [
    { label: 'Total Messages', value: stats.total, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-200 dark:border-blue-800' },
    { label: 'High Priority', value: stats.high, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-200 dark:border-red-800' },
    { label: 'Medium Priority', value: stats.medium, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/40', border: 'border-yellow-200 dark:border-yellow-800' },
    { label: 'Low Priority', value: stats.low, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-200 dark:border-gray-700' },
    { label: 'Scheduled', value: stats.scheduled, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40', border: 'border-purple-200 dark:border-purple-800' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`${item.bg} p-4 rounded-xl border ${item.border} transition-all duration-200 hover:scale-[1.02]`}
        >
          <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
