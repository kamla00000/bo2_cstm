// src/components/SlotSelector.jsx
import React from 'react';

const SlotSelector = ({ usage, maxUsage }) => {
  const renderSlotBar = (current, max) => {
    const cells = [];
    for (let i = 0; i < max; i++) {
      cells.push(
        <div
          key={i}
          className={`w-4 h-4 mx-px ${
            i < current ? 'bg-blue-500' : 'bg-gray-700'
          }`}
        ></div>
      );
    }
    return (
      <div className="flex">
        {cells}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 近距離スロット */}
      <div className="flex flex-col space-y-2 text-sm font-medium">
        <span className="text-gray-300">近距離スロット</span>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-white w-[60px]">
            {usage.close} / {maxUsage.close}
          </span>
          <div className="flex flex-wrap">
            {renderSlotBar(usage.close, maxUsage.close)}
          </div>
        </div>
      </div>

      {/* 中距離スロット */}
      <div className="flex flex-col space-y-2 text-sm font-medium">
        <span className="text-gray-300">中距離スロット</span>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-white w-[60px]">
            {usage.mid} / {maxUsage.mid}
          </span>
          <div className="flex flex-wrap">
            {renderSlotBar(usage.mid, maxUsage.mid)}
          </div>
        </div>
      </div>

      {/* 遠距離スロット */}
      <div className="flex flex-col space-y-2 text-sm font-medium">
        <span className="text-gray-300">遠距離スロット</span>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-white w-[60px]">
            {usage.long} / {maxUsage.long}
          </span>
          <div className="flex flex-wrap">
            {renderSlotBar(usage.long, maxUsage.long)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;