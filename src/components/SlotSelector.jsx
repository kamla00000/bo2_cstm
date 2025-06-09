import React from 'react';

const SlotSelector = ({ usage, maxUsage, baseUsage, currentStats }) => {
  const safeMaxUsage = maxUsage || {};
  const safeUsage = usage || {};
  const safeBaseUsage = baseUsage || {};

  const fullStrengthenCloseBonus = currentStats?.fullStrengthenSlotBonus?.close || 0;
  const fullStrengthenMediumBonus = currentStats?.fullStrengthenSlotBonus?.medium || 0;
  const fullStrengthenLongBonus = currentStats?.fullStrengthenSlotBonus?.long || 0;

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
    const displayMaxBars = Math.max(totalMax, current);
    const maxRenderLimit = 40;
    const actualDisplayBars = Math.min(displayMaxBars, maxRenderLimit);

    // デバッグ用: これらの値がどうなっているか確認
    // ★ここを残します
    console.log(`--- ${slotName} Slot Bar Render Data ---`);
    console.log(`Current: ${current}, TotalMax: ${totalMax}, Base: ${base}, OriginalMax: ${originalMax}`);
    console.log(`DisplayMaxBars: ${displayMaxBars}, ActualDisplayBars: ${actualDisplayBars}`);


    for (let i = 0; i < actualDisplayBars; i++) {
      // 共通のスタイル: 幅を w-3 (12px) に広げる。高さも少し大きくする。マージンも調整。
      let cellClass = "flex-none w-3 h-5 mr-0.5"; // 幅: 12px, 高さ: 20px, 右マージン: 2px

      // フル強化で増加したスロットかどうかの判定
      const isFullStrengthenedSlot = i >= originalMax && i < totalMax;

      if (i < totalMax) { // MSの（フル強化後の）合計スロット数内
        if (i < current && i >= base) {
          // 仮反映部分 → グリーン＋点滅
          cellClass += " bg-green-500 animate-fast-pulse";
        } else if (i < current) {
          // 装着済みセル → 青
          cellClass += " bg-blue-500";
        } else {
          // 空きスロット → グレー
          cellClass += " bg-gray-500";
        }
        
        // フル強化で増加したスロットに緑色のボーダーを適用
        if (isFullStrengthenedSlot) {
            cellClass += " border-2 border-lime-400"; // ボーダーの太さを border-2 (2px) に増やす
        }

      } else { // MSの合計スロット上限（フル強化後）を超過した部分
        // オーバーフロー → 赤＋点滅
        cellClass += " bg-red-500 animate-pulse border-2 border-red-500"; // オーバーフローも太く
      }
      
      // デバッグ用: 各バーのクラスを確認 (これは今回は削除します)
      // console.log(`  ${slotName} Index: ${i}, Class: ${cellClass}`);

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
            {longCurrent} / {longMax}
          </span>
          {renderSlotBar(longCurrent, longMax, longBase, originalLongMax, 'Long')}
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;