import React from 'react';

const SlotSelector = ({ usage, maxUsage, baseUsage, currentStats, hoveredOccupiedSlots }) => {
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

  // src/components/SlotSelector.jsx の renderSlotBar 関数内

// src/components/SlotSelector.jsx の renderSlotBar 関数内

// src/components/SlotSelector.jsx の renderSlotBar 関数内

// src/components/SlotSelector.jsx の renderSlotBar 関数内

// src/components/SlotSelector.jsx の renderSlotBar 関数内

// src/components/SlotSelector.jsx の renderSlotBar 関数内

// src/components/SlotSelector.jsx の renderSlotBar 関数内

const renderSlotBar = (current, totalMax, base, originalMax, slotName, hoveredOccupiedAmount) => {
  const cells = [];
  const maxRenderLimit = 40;

  // 表示されるバーの総数。
  // totalMax と current の大きい方を基準にし、maxRenderLimit を超えないようにする。
  const displayableSlots = Math.max(totalMax, current); 
  const actualDisplayBars = Math.min(displayableSlots, maxRenderLimit); 
  
  // 比率計算は使わず、直接インデックスを決定するアプローチに変更
  // current, base, originalMax, totalMax はそのままスロット数として扱う

  // ★★★ デバッグ用ログは一旦削除するか、必要なら維持 ★★★
  // console.log(`--- ${slotName} Slot Debug ---`);
  // console.log(`current: ${current}, totalMax: ${totalMax}`);
  // console.log(`base: ${base}, originalMax: ${originalMax}`);
  // console.log(`displayableSlots: ${displayableSlots}, actualDisplayBars: ${actualDisplayBars}`);
  // console.log(`-----------------------------`);


  for (let i = 0; i < actualDisplayBars; i++) {
    let cellClass = "flex-none w-3 h-5 mr-0.5 rounded-sm"; 

    // 各バーの状態を判定するフラグ
    // i は 0 から始まるインデックス、スロット数は 1 から始まるため、i+1 で比較する
    const isCurrentlyUsed = (i + 1) <= current; // i番目のバーが current の範囲内にあるか
    const isBaseUsed = (i + 1) <= base;         // i番目のバーが base の範囲内にあるか
    
    // フル強化スロットのボーダーを適用する条件:
    // バーのインデックスが originalMax を超えて totalMax までの間
    const isFullStrengthenedBonusSlot = (i + 1) > originalMax && (i + 1) <= totalMax;
    
    // ★★★ オーバーフローの判定ロジックを再々々修正 ★★★
    // このバーが totalMax のスロット数を超えていて、かつ current の範囲内であればオーバーフロー
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
        cellClass += " border-2 border-lime-400";
    }
    
    // スロットオーバー分を赤で表示（最優先）
    if (isOverflow) {
        cellClass = `flex-none w-3 h-5 mr-0.5 rounded-sm bg-red-500 animate-pulse border-2 border-red-500`;
    }

    // ホバー時に黄色点滅のクラスを最優先で適用
    if (isHoveredOccupied) {
        cellClass = `flex-none w-3 h-5 mr-0.5 rounded-sm bg-yellow-400 border-yellow-300 animate-ping-once`;
    }
    
    cells.push(<div key={i} className={cellClass}></div>);
  }

  return (
    <div className="flex flex-row overflow-x-auto overflow-y-hidden items-center"> 
      {cells}
    </div>
  );
};

  return (
    <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
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
          {renderSlotBar(closeCurrent, closeMax, closeBase, originalCloseMax, 'Close', hoveredOccupiedSlots?.close || 0)}
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
          {renderSlotBar(midCurrent, midMax, midBase, originalMidMax, 'Mid', hoveredOccupiedSlots?.mid || 0)}
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
          {renderSlotBar(longCurrent, longMax, longBase, originalLongMax, 'Long', hoveredOccupiedSlots?.long || 0)}
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;