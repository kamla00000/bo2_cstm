// src/components/SlotSelector.jsx
import React from 'react';

const SlotSelector = ({ usage, maxUsage }) => {
  const closeMax = maxUsage?.["近スロット"] ?? 0;
  const midMax = maxUsage?.["中スロット"] ?? 0;
  const longMax = maxUsage?.["遠スロット"] ?? 0;

  return (
    <div className="space-y-4">
      {/* 近距離スロット */}
      <div>
        <div className="flex justify-between text-sm font-medium mb-1">
          <span>近距離スロット</span>
          <span>{usage.close} / {closeMax}</span>
        </div>
        <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden w-[300px]">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              usage.close > closeMax ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min((usage.close / closeMax) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* 中距離スロット */}
      <div>
        <div className="flex justify-between text-sm font-medium mb-1">
          <span>中距離スロット</span>
          <span>{usage.mid} / {midMax}</span>
        </div>
        <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden w-[300px]">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              usage.mid > midMax ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min((usage.mid / midMax) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* 遠距離スロット */}
      <div>
        <div className="flex justify-between text-sm font-medium mb-1">
          <span>遠距離スロット</span>
          <span>{usage.long} / {longMax}</span>
        </div>
        <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden w-[300px]">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              usage.long > longMax ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min((usage.long / longMax) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;