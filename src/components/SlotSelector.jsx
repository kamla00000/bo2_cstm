// src/components/SlotSelector.jsx
import React from 'react';

const SlotSelector = ({ usage, maxUsage }) => {
  const closeMax = maxUsage?.["近スロット"] ?? 0;
  const midMax = maxUsage?.["中スロット"] ?? 0;
  const longMax = maxUsage?.["遠スロット"] ?? 0;

  // 各スロットのバー生成関数
  const renderSlotBar = (current, max) => {
    const cells = [];
    for (let i = 0; i < max; i++) {
      cells.push(
        <div
          key={i}
          className={`w-4 h-8 mx-px ${
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
            {usage.close} / {closeMax}
          </span>
          <div className="flex flex-wrap">
            {renderSlotBar(usage.close, closeMax)}
          </div>
        </div>
      </div>

      {/* 中距離スロット */}
      <div className="flex flex-col space-y-2 text-sm font-medium">
        <span className="text-gray-300">中距離スロット</span>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-white w-[60px]">
            {usage.mid} / {midMax}
          </span>
          <div className="flex flex-wrap">
            {renderSlotBar(usage.mid, midMax)}
          </div>
        </div>
      </div>

      {/* 遠距離スロット */}
      <div className="flex flex-col space-y-2 text-sm font-medium">
        <span className="text-gray-300">遠距離スロット</span>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-white w-[60px]">
            {usage.long} / {longMax}
          </span>
          <div className="flex flex-wrap">
            {renderSlotBar(usage.long, longMax)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;