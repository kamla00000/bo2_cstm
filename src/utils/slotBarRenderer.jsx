// src/utils/slotBarRenderer.jsx

import React from 'react';

export const renderSlotBar = (current, totalMax, base, originalMax, slotName, hoveredOccupiedAmount = 0) => {
  const cells = [];
  const maxRenderLimit = 40;

  const displayableSlots = Math.max(totalMax, current);
  const actualDisplayBars = Math.min(displayableSlots, maxRenderLimit);

  for (let i = 0; i < actualDisplayBars; i++) {
    // スロットバーの幅 (w-1) と高さ (h-2.5) をここで調整
    let cellClass = "flex-none w-1 h-2.5 mr-0.5";

    const isCurrentlyUsed = (i + 1) <= current;
    const isBaseUsed = (i + 1) <= base;
    const isFullStrengthenedBonusSlot = (i + 1) > originalMax && (i + 1) <= totalMax;
    const isOverflow = (i + 1) > totalMax && (i + 1) <= current;

    // ホバーされたパーツが占めるスロットの判定
    const isHoveredOccupied = hoveredOccupiedAmount > 0 &&
                              (i + 1) > (current - hoveredOccupiedAmount) &&
                              (i + 1) <= current;

    // 初期色設定
    if (isCurrentlyUsed) {
      if (isBaseUsed) {
        cellClass += " bg-blue-500"; // MSの基本スロット（青）
      } else {
        cellClass += " bg-green-500 animate-fast-pulse"; // カスタムパーツ（緑点滅）
      }
    } else {
      cellClass += " bg-gray-500"; // 未使用（グレー）
    }

    // フル強化スロットのボーダーを適用
    if (isFullStrengthenedBonusSlot) {
        cellClass += " border-2 border-orange-400";
    }

    // スロットオーバー分を赤で表示（最優先）
    if (isOverflow) {
        cellClass = `flex-none w-1 h-2.5 mr-0.5 bg-red-500 animate-pulse border-2 border-red-500`;
    }

    // ホバー時に黄色点滅のクラスを最優先で適用
    if (isHoveredOccupied) {
        cellClass = `flex-none w-1 h-2.5 mr-0.5 bg-yellow-400 border-yellow-300 animate-ping-once`;
    }

    cells.push(<div key={i} className={cellClass}></div>);
  }

  return (
    <div className="flex flex-row overflow-x-auto overflow-y-hidden items-center">
      {cells}
    </div>
  );
};