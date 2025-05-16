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
      <div className="space-y-1">
        <div className="flex items-center text-sm font-medium">
          <span>近距離スロット</span>
          <span className="ml-auto">{usage.close} / {closeMax}</span>
        </div>
        <div className="flex flex-wrap">
          {renderSlotBar(usage.close, closeMax)}
        </div>
      </div>

      {/* 中距離スロット */}
      <div className="space-y-1">
        <div className="flex items-center text-sm font-medium">
          <span>中距離スロット</span>
          <span className="ml-auto">{usage.mid} / {midMax}</span>
        </div>
        <div className="flex flex-wrap">
          {renderSlotBar(usage.mid, midMax)}
        </div>
      </div>

      {/* 遠距離スロット */}
      <div className="space-y-1">
        <div className="flex items-center text-sm font-medium">
          <span>遠距離スロット</span>
          <span className="ml-auto">{usage.long} / {longMax}</span>
        </div>
        <div className="flex flex-wrap">
          {renderSlotBar(usage.long, longMax)}
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;