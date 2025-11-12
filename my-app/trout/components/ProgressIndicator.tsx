"use client";

interface ProgressIndicatorProps {
  completed: number;
  total: number;
  percentage: number;
}

export default function ProgressIndicator({
  completed,
  total,
  percentage,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progress: {completed} of {total} checks completed
        </span>
        <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

