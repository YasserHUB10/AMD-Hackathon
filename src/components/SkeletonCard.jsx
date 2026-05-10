import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse border border-gray-100 dark:border-gray-700">
      {/* Header skeleton */}
      <div className="bg-gray-200 dark:bg-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="h-5 w-28 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
          <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>
      {/* Body skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-4 w-full bg-gray-100 dark:bg-gray-700 rounded" />
        <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-700 rounded" />
        <div className="bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-lg p-3">
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
          <div className="h-3 w-48 bg-gray-200 dark:bg-gray-600 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-100 dark:bg-gray-700 rounded" />
          <div className="h-10 w-full bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-100 dark:border-gray-700" />
          <div className="h-10 w-full bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-100 dark:border-gray-700" />
        </div>
      </div>
    </div>
  );
}
