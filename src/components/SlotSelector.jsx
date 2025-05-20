// src/components/SlotSelector.jsx
import React from 'react';

const SlotSelector = ({ usage, maxUsage, baseUsage }) => {
  // 安全な参照を確保
  const safeMaxUsage = maxUsage || { close: 0, mid: 0, long: 0 };
  const safeUsage = usage || { close: 0, mid: 0, long: 0 };
  const safeBaseUsage = baseUsage || { close: 0, mid: 0, long: 0 };

  // 各スロット最大値
  const closeMax = safeMaxUsage.近スロット ?? safeMaxUsage.close ?? 0;
  const midMax = safeMaxUsage.中スロット ?? safeMaxUsage.mid ?? 0;
  const longMax = safeMaxUsage.遠スロット ?? safeMaxUsage.long ?? 0;

  // 各スロット現在値（プレビューを含む）
  const closeCurrent = safeUsage.close ?? 0;
  const midCurrent = safeUsage.mid ?? 0;
  const longCurrent = safeUsage.long ?? 0;

  // 各スロット初期値（ホバー前）
  const closeBase = safeBaseUsage.close ?? 0;
  const midBase = safeBaseUsage.mid ?? 0;
  const longBase = safeBaseUsage.long ?? 0;

  const renderSlotBar = (current, max, base) => {
    const cells = [];
    const overflow = Math.max(0, current - max); // オーバーした数

    for (let i = 0; i < Math.max(max, current); i++) {
      let cellClass = "w-2 h-4 mx-px";

      if (i < max) {
        // 通常のスロット範囲
        if (i < current && i >= base) {
          cellClass += " bg-green-500 animate-fast-pulse"; // 仮反映
        } else if (i < current) {
          cellClass += " bg-blue-500"; // 装着済み
        } else {
          cellClass += " bg-gray-700"; // 空き
        }
      } else {
        // オーバーフローしたスロット
        cellClass += " bg-red-500 animate-pulse"; // 赤点滅
      }

      cells.push(<div key={i} className={cellClass}></div>);
    }

    return (
      <div className="flex flex-wrap">
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
          <span
            className={`text-lg font-bold w-[60px] ${
              closeCurrent > closeMax ? 'text-red-500' : 'text-white'
            }`}
          >
            {closeCurrent} / {closeMax}
          </span>
          {renderSlotBar(closeCurrent, closeMax, closeBase)}
        </div>
      </div>

      {/* 中距離スロット */}
      <div className="flex flex-col space-y-2 text-sm font-medium">
        <span className="text-gray-300">中距離スロット</span>
        <div className="flex items-center space-x-2">
          <span
            className={`text-lg font-bold w-[60px] ${
              midCurrent > midMax ? 'text-red-500' : 'text-white'
            }`}
          >
            {midCurrent} / {midMax}
          </span>
          {renderSlotBar(midCurrent, midMax, midBase)}
        </div>
      </div>

      {/* 遠距離スロット */}
      <div className="flex flex-col space-y-2 text-sm font-medium">
        <span className="text-gray-300">遠距離スロット</span>
        <div className="flex items-center space-x-2">
          <span
            className={`text-lg font-bold w-[60px] ${
              longCurrent > longMax ? 'text-red-500' : 'text-white'
            }`}
          >
            {longCurrent} / {longMax}
          </span>
          {renderSlotBar(longCurrent, longMax, longBase)}
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;