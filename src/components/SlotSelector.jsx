// src/components/SlotSelector.jsx
import React from 'react';

const SlotSelector = ({ usage, maxUsage, baseUsage }) => {
  const safeMaxUsage = maxUsage || { close: 0, mid: 0, long: 0 };
  const safeUsage = usage || { close: 0, mid: 0, long: 0 };
  const safeBaseUsage = baseUsage || { close: 0, mid: 0, long: 0 };

  // 各スロット最大値
  const closeMax = safeMaxUsage.近スロット ?? safeMaxUsage.close ?? 0;
  const midMax = safeMaxUsage.中スロット ?? safeMaxUsage.mid ?? 0;
  const longMax = safeMaxUsage.遠スロット ?? safeMaxUsage.long ?? 0;

  // 各スロット現在値
  const closeCurrent = safeUsage.close ?? 0;
  const midCurrent = safeUsage.mid ?? 0;
  const longCurrent = safeUsage.long ?? 0;

  // 各スロット初期値（仮反映前の装着済み）
  const closeBase = safeBaseUsage.close ?? 0;
  const midBase = safeBaseUsage.mid ?? 0;
  const longBase = safeBaseUsage.long ?? 0;

  // スロットバー生成関数
  const renderSlotBar = (current, max, base) => {
    const cells = [];

    const displayMaxBars = Math.max(max, current);

    for (let i = 0; i < displayMaxBars; i++) {
      let cellClass = "w-2 h-4 mx-px";

      if (i < max) {
        if (i < current && i >= base) {
          // 仮反映部分 → グリーン＋点滅
          cellClass += " bg-green-500 animate-fast-pulse";
        } else if (i < current) {
          // 装着済みセル → 青
          cellClass += " bg-blue-500";
        } else {
          // 空きスロット → グレー
          cellClass += " bg-gray-700";
        }
      } else {
        // オーバーフロー → 赤＋点滅
        cellClass += " bg-red-500 animate-pulse";
      }

      cells.push(<div key={i} className={cellClass}></div>);
    }

    return (
      <div className="flex flex-wrap flex-grow">
        {cells}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 近距離スロット */}
      <div className="flex items-center text-sm font-medium">
        <span className="text-gray-300 mr-2 whitespace-nowrap">近距離スロット</span>
        <span
          className={`text-base font-bold w-[60px] flex-shrink-0 ${
            closeCurrent > closeMax ? 'text-red-500' : 'text-white'
          }`}
        >
          {closeCurrent} / {closeMax}
        </span>
        {renderSlotBar(closeCurrent, closeMax, closeBase)}
      </div>

      {/* 中距離スロット */}
      <div className="flex items-center text-sm font-medium">
        <span className="text-gray-300 mr-2 whitespace-nowrap">中距離スロット</span>
        <span
          className={`text-base font-bold w-[60px] flex-shrink-0 ${
            midCurrent > midMax ? 'text-red-500' : 'text-white'
          }`}
        >
          {midCurrent} / {midMax}
        </span>
        {renderSlotBar(midCurrent, midMax, midBase)}
      </div>

      {/* 遠距離スロット */}
      <div className="flex items-center text-sm font-medium">
        <span className="text-gray-300 mr-2 whitespace-nowrap">遠距離スロット</span>
        <span
          className={`text-base font-bold w-[60px] flex-shrink-0 ${
            longCurrent > longMax ? 'text-red-500' : 'text-white'
          }`}
        >
          {longCurrent} / {longMax}
        </span>
        {renderSlotBar(longCurrent, longMax, longBase)}
      </div>
    </div>
  );
};

export default SlotSelector;