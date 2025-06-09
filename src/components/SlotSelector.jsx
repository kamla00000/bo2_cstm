import React from 'react';

const SlotSelector = ({ usage, maxUsage, baseUsage, currentStats }) => {
  const safeMaxUsage = maxUsage || {};
  const safeUsage = usage || {};
  const safeBaseUsage = baseUsage || {};

  const fullStrengthenCloseBonus = currentStats?.fullStrengthenSlotBonus?.close || 0;
  const fullStrengthenMediumBonus = currentStats?.fullStrengthenSlotBonus?.medium || 0;
  const fullStrengthenLongBonus = currentStats?.fullStrengthenSlotBonus?.long || 0;

  // ここで最終的な最大スロット数を計算しています
  const closeMax = (safeMaxUsage.close ?? 0) + fullStrengthenCloseBonus;
  const midMax = (safeMaxUsage.mid ?? 0) + fullStrengthenMediumBonus;
  const longMax = (safeMaxUsage.long ?? 0) + fullStrengthenLongBonus;

  const closeCurrent = safeUsage.close ?? 0;
  const midCurrent = safeUsage.mid ?? 0;
  const longCurrent = safeUsage.long ?? 0;

  const closeBase = safeBaseUsage.close ?? 0;
  const midBase = safeBaseUsage.mid ?? 0;
  const longBase = safeBaseUsage.long ?? 0;

  const originalCloseMax = safeMaxUsage.close ?? 0;
  const originalMidMax = safeMaxUsage.mid ?? 0;
  const originalLongMax = safeMaxUsage.long ?? 0;

  const renderSlotBar = (current, totalMax, base, originalMax, slotName) => {
    const cells = [];
    // totalMax を考慮して、displayMaxBars を計算
    const displayMaxBars = Math.max(totalMax, current);
    const maxRenderLimit = 40; // 表示されるバーの最大数
    const actualDisplayBars = Math.min(displayMaxBars, maxRenderLimit);

    console.log(`--- ${slotName} Slot Bar Render Data ---`);
    console.log(`Current: ${current}, TotalMax: ${totalMax}, Base: ${base}, OriginalMax: ${originalMax}`);
    console.log(`DisplayMaxBars: ${displayMaxBars}, ActualDisplayBars: ${actualDisplayBars}`);

    for (let i = 0; i < actualDisplayBars; i++) {
      let cellClass = "flex-none w-3 h-5 mr-0.5";

      const isFullStrengthenedSlot = i >= originalMax && i < totalMax;

      if (i < totalMax) {
        if (i < current && i >= base) {
          cellClass += " bg-green-500 animate-fast-pulse";
        } else if (i < current) {
          cellClass += " bg-blue-500";
        } else {
          cellClass += " bg-gray-500";
        }
        
        if (isFullStrengthenedSlot) {
            cellClass += " border-2 border-lime-400";
        }

      } else {
        cellClass += " bg-red-500 animate-pulse border-2 border-red-500";
      }
      
      cells.push(<div key={i} className={cellClass}></div>);
    }

    return (
      <div className="flex flex-row overflow-x-auto items-center">
        {cells}
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
      <h3 className="text-xl font-semibold mb-3 text-gray-200">スロット状況</h3>
      <div className="space-y-3">
        {/* 近距離スロット */}
        <div className="flex items-center text-sm font-medium">
          <span className="text-gray-300 mr-2 whitespace-nowrap">近距離スロット</span>
          <span
            className={`text-base font-bold w-[60px] flex-shrink-0 ${
              closeCurrent > closeMax ? 'text-red-500' : 'text-white'
            }`}
          >
            {/* ★ 修正: ここを closeMax に変更 */}
            {closeCurrent} / {closeMax} 
          </span>
          {renderSlotBar(closeCurrent, closeMax, closeBase, originalCloseMax, 'Close')}
        </div>

        {/* 中距離スロット */}
        <div className="flex items-center text-sm font-medium">
          <span className="text-gray-300 mr-2 whitespace-nowrap">中距離スロット</span>
          <span
            className={`text-base font-bold w-[60px] flex-shrink-0 ${
              midCurrent > midMax ? 'text-red-500' : 'text-white'
            }`}
          >
            {/* ★ 修正: ここを midMax に変更 */}
            {midCurrent} / {midMax}
          </span>
          {renderSlotBar(midCurrent, midMax, midBase, originalMidMax, 'Mid')}
        </div>

        {/* 遠距離スロット */}
        <div className="flex items-center text-sm font-medium">
          <span className="text-gray-300 mr-2 whitespace-nowrap">遠距離スロット</span>
          <span
            className={`text-base font-bold w-[60px] flex-shrink-0 ${
              longCurrent > longMax ? 'text-red-500' : 'text-white'
            }`}
          >
            {/* ★ 修正: ここを longMax に変更 */}
            {longCurrent} / {longMax}
          </span>
          {renderSlotBar(longCurrent, longMax, longBase, originalLongMax, 'Long')}
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;