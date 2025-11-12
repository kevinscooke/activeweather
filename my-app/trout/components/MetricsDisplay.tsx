"use client";

interface MetricsDisplayProps {
  metrics: {
    totalChecks: number;
    completedChecks: number;
    failedChecks: number;
    completionTime: number | null;
  };
}

export default function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Metrics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{metrics.completedChecks}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Failed</p>
          <p className="text-2xl font-bold text-red-600">{metrics.failedChecks}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500">Completion Time</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatTime(metrics.completionTime)}
          </p>
        </div>
      </div>
    </div>
  );
}

