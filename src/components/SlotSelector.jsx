// src/components/SlotSelector.jsx
import React from 'react';

const SlotSelector = ({ usage, maxUsage }) => {
  // 安全な参照を確保
  const safeMaxUsage = maxUsage || { close: 0, mid: 0, long: 0 };
  const safeUsage = usage || { close: 0, mid: 0, long: 0 };

  // 各スロット最大値
  const closeMax = safeMaxUsage.近スロット ?? safeMaxUsage.close ?? 0;
  const midMax = safeMaxUsage.中スロット ?? safeMaxUsage.mid ?? 0;
  const longMax = safeMaxUsage.遠スロット ?? safeMaxUsage.long ?? 0;

  // 各スロット現在値
  const closeCurrent = safeUsage.close ?? 0;
  const midCurrent = safeUsage.mid ?? 0;
  const longCurrent = safeUsage.long ?? 0;

  // スロットバー生成関数（isPreview フラグ付き）
  const renderSlotBar = (current, max) => {
    const cells = [];

    for (let i = 0; i < max; i++) {
      let cellClass = "w-2 h-4 mx-px";

      if (i < current) {
        if (i >= max) {
          // オーバー部分 → 赤＋点滅
          cellClass += " bg-red-500 animate-pulse";
        } else {
          // 装着済みセル → 青
          cellClass += " bg-blue-500";
        }
      } else {
        // 仮反映中のセル → グリーン＋点滅
        if (i === current - 1 && current > (max)) {
          // オーバー時は無視
        } else if (i < current) {
          // 装着済みと同じ（再チェック）
          cellClass += " bg-blue-500";
        } else if (i < max) {
          // 空きスロット → グレー
          cellClass += " bg-gray-700";
        }
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
          <div className="flex flex-wrap">
            {renderSlotBar(closeCurrent, closeMax)}
          </div>
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
          <div className="flex flex-wrap">
            {renderSlotBar(midCurrent, midMax)}
          </div>
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
          <div className="flex flex-wrap">
            {renderSlotBar(longCurrent, longMax)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;