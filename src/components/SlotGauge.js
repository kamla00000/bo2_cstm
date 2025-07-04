// import React from 'react';
// // renderSlotBar はこのファイル内に定義されているため、import は不要

// const SlotSelector = ({ usage, maxUsage, baseUsage, currentStats, hoveredOccupiedSlots }) => {
//   const safeMaxUsage = maxUsage || {};
//   const safeUsage = usage || {};
//   const safeBaseUsage = baseUsage || {};

//   const fullStrengthenCloseBonus = currentStats?.fullStrengthenSlotBonus?.close || 0;
//   const fullStrengthenMediumBonus = currentStats?.fullStrengthenSlotBonus?.medium || 0;
//   const fullStrengthenLongBonus = currentStats?.fullStrengthenSlotBonus?.long || 0;

//   const closeMax = (safeMaxUsage.close ?? 0) + fullStrengthenCloseBonus;
//   const midMax = (safeMaxUsage.mid ?? 0) + fullStrengthenMediumBonus;
//   const longMax = (safeMaxUsage.long ?? 0) + fullStrengthenLongBonus;

//   const closeCurrent = safeUsage.close ?? 0;
//   const midCurrent = safeUsage.mid ?? 0;
//   const longCurrent = safeUsage.long ?? 0;

//   const closeBase = safeBaseUsage.close ?? 0;
//   const midBase = safeBaseUsage.mid ?? 0;
//   const longBase = safeBaseUsage.long ?? 0;

//   const originalCloseMax = safeMaxUsage.close ?? 0;
//   const originalMidMax = safeMaxUsage.mid ?? 0;
//   const originalLongMax = safeMaxUsage.long ?? 0;

//   const renderSlotBar = (current, totalMax, base, originalMax, slotName, hoveredOccupiedAmount = 0) => {
//     const cells = [];
//     const maxRenderLimit = 40;

//     const displayableSlots = Math.max(totalMax, current);
//     const actualDisplayBars = Math.min(displayableSlots, maxRenderLimit);

//     for (let i = 0; i < actualDisplayBars; i++) {
//       // 変更点: rounded-md を削除
//       let cellClass = `flex-none w-1 h-2.5 mr-0.5`;

//       const isCurrentlyUsed = (i + 1) <= current;
//       const isBaseUsed = (i + 1) <= base;
//       const isFullStrengthenedBonusSlot = (i + 1) > originalMax && (i + 1) <= totalMax;
//       const isOverflow = (i + 1) > totalMax && (i + 1) <= current;
//       const isHoveredOccupied = hoveredOccupiedAmount > 0 &&
//                                 (i + 1) > (current - hoveredOccupiedAmount) &&
//                                 (i + 1) <= current;

//       // 初期色設定
//       if (isCurrentlyUsed) {
//         if (isBaseUsed) {
//           cellClass += " bg-blue-500"; // MSの基本スロット（青）
//         } else {
//           cellClass += " bg-green-500 animate-fast-pulse"; // カスタムパーツ（緑点滅）
//         }
//       } else {
//         cellClass += " bg-gray-500"; // 未使用（グレー）
//       }

//       // フル強化スロットのボーダーを適用
//       if (isFullStrengthenedBonusSlot) {
//           cellClass += " border-2 border-lime-400";
//       }

//       // スロットオーバー分を赤で表示（最優先）
//       if (isOverflow) {
//           // 変更点: rounded-md を削除
//           cellClass = `flex-none w-1 h-2.5 mr-0.5 bg-red-500 animate-pulse border-2 border-red-500`;
//       }

//       // ホバー時に黄色点滅のクラスを最優先で適用
//       if (isHoveredOccupied) {
//           // 変更点: rounded-md を削除
//           cellClass = `flex-none w-1 h-2.5 mr-0.5 bg-yellow-400 border-yellow-300 animate-ping-once`;
//       }

//       cells.push(<div key={i} className={cellClass}></div>);
//     }

//     return (
//       <div className="flex flex-row overflow-x-auto overflow-y-hidden items-center">
//         {cells}
//       </div>
//     );
//   };

//   // これらの変数は、もし `currentStats` に追加スロットのプロパティがある場合にのみ使用されます。
//   // 現在の `App.js` の `currentStats` には含まれていないため、必要であれば追加してください。
//   const closeMaxWithBonus = closeMax; // currentStats?.additionalCloseSlots || 0;
//   const midMaxWithBonus = midMax;     // currentStats?.additionalMidSlots || 0;
//   const longMaxWithBonus = longMax;   // currentStats?.additionalLongSlots || 0;


//   return (
//     <div className="p-4 bg-gray-700 -md shadow-inner">
//       <div className="space-y-3">
//         {/* 近距離スロット */}
//         <div className="flex items-center text-sm font-medium">
//           <span className="text-gray-200 mr-2 whitespace-nowrap">近</span>
//           <span
//             className={`text-base w-[60px] flex-shrink-0 ${
//               closeCurrent > closeMaxWithBonus ? 'text-red-500' : 'text-gray-200'
//             }`}
//           >
//             {closeCurrent} / {closeMaxWithBonus}
//           </span>
//           {renderSlotBar(closeCurrent, closeMaxWithBonus, closeBase, originalCloseMax, 'Close', hoveredOccupiedSlots?.close || 0)}
//         </div>

//         {/* 中距離スロット */}
//         <div className="flex items-center text-sm font-medium">
//           <span className="text-gray-200 mr-2 whitespace-nowrap">中</span>
//           <span
//             className={`text-base w-[60px] flex-shrink-0 ${
//               midCurrent > midMaxWithBonus ? 'text-red-500' : 'text-gray-200'
//             }`}
//           >
//             {midCurrent} / {midMaxWithBonus}
//           </span>
//           {renderSlotBar(midCurrent, midMaxWithBonus, midBase, originalMidMax, 'Mid', hoveredOccupiedSlots?.mid || 0)}
//         </div>

//         {/* 遠距離スロット */}
//         <div className="flex items-center text-sm font-medium">
//           <span className="text-gray-200 mr-2 whitespace-nowrap">遠</span>
//           <span
//             className={`text-base w-[60px] flex-shrink-0 ${
//               longCurrent > longMaxWithBonus ? 'text-red-500' : 'text-gray-200'
//             }`}
//           >
//             {longCurrent} / {longMaxWithBonus}
//           </span>
//           {renderSlotBar(longCurrent, longMaxWithBonus, longBase, originalLongMax, 'Long', hoveredOccupiedSlots?.long || 0)}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SlotSelector;