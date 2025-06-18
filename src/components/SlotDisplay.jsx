// import React from 'react';
// import './SlotDisplay.css';
// import SlotSelector from './SlotSelector'; // これが正しいパスか確認してください

// const SlotDisplay = ({ 
//     selectedMs, 
//     slotUsage, 
//     usageWithPreview, // useAppData から getUsageWithPreview() の結果が渡される
//     hoveredOccupiedSlots, // useAppData から hoveredOccupiedSlots が渡される
//     isFullStrengthened,
//     setIsFullStrengthened,
//     expansionType,
//     setExpansionType,
//     expansionOptions,
//     expansionDescriptions
// }) => {

//     if (!selectedMs) {
//         return null;
//     }

//     // 各スロットタイプごとに SlotSelector をレンダリング
//     return (
//         <div className="slot-display-container card">
//             <h2>スロット容量</h2>
//             <div className="slot-grid">
//                 {/* 近距離スロット */}
//                 <div className="slot-item">
//                     <h3>近距離: {slotUsage.close}/{slotUsage.maxClose}</h3>
//                     <SlotSelector
//                         slotType="Close"
//                         totalMax={slotUsage.maxClose}
//                         currentConfirmedUsage={slotUsage.close}
//                         hoveredOccupiedAmount={hoveredOccupiedSlots.close} // 装着済みパーツのホバー用
//                         previewedUsageAmount={usageWithPreview.close} // ★修正点: ?.close || 0 を削除
//                         baseUsageAmount={selectedMs.base_slots?.close || 0} // baseUsageAmount を追加
//                         originalMax={selectedMs.slots?.close || 0} // originalMax を追加
//                     />
//                 </div>

//                 {/* 中距離スロット */}
//                 <div className="slot-item">
//                     <h3>中距離: {slotUsage.mid}/{slotUsage.maxMid}</h3>
//                     <SlotSelector
//                         slotType="Mid"
//                         totalMax={slotUsage.maxMid}
//                         currentConfirmedUsage={slotUsage.mid}
//                         hoveredOccupiedAmount={hoveredOccupiedSlots.mid}
//                         previewedUsageAmount={usageWithPreview.mid} // ★修正点
//                         baseUsageAmount={selectedMs.base_slots?.mid || 0} // baseUsageAmount を追加
//                         originalMax={selectedMs.slots?.mid || 0} // originalMax を追加
//                     />
//                 </div>

//                 {/* 遠距離スロット */}
//                 <div className="slot-item">
//                     <h3>遠距離: {slotUsage.long}/{slotUsage.maxLong}</h3>
//                     <SlotSelector
//                         slotType="Long"
//                         totalMax={slotUsage.maxLong}
//                         currentConfirmedUsage={slotUsage.long}
//                         hoveredOccupiedAmount={hoveredOccupiedSlots.long}
//                         previewedUsageAmount={usageWithPreview.long} // ★修正点
//                         baseUsageAmount={selectedMs.base_slots?.long || 0} // baseUsageAmount を追加
//                         originalMax={selectedMs.slots?.long || 0} // originalMax を追加
//                     />
//                 </div>
//             </div>

//             {/* フル強化オプションと拡張スロットタイプ */}
//             <div className="slot-options">
//                 <label className="checkbox-container">
//                     <input
//                         type="checkbox"
//                         checked={isFullStrengthened}
//                         onChange={(e) => setIsFullStrengthened(e.target.checked)}
//                     />
//                     <span className="checkmark"></span>
//                     フル強化 (全カスタムパーツ解除)
//                 </label>

//                 <div className="expansion-type-select">
//                     <label htmlFor="expansionType">拡張スロットタイプ:</label>
//                     <select
//                         id="expansionType"
//                         value={expansionType}
//                         onChange={(e) => setExpansionType(e.target.value)}
//                     >
//                         {EXPANSION_OPTIONS.map(option => (
//                             <option key={option.value} value={option.value}>
//                                 {option.label}
//                             </option>
//                         ))}
//                     </select>
//                     {expansionType !== '無し' && (
//                         <p className="expansion-description">{EXPANSION_DESCRIPTIONS[expansionType]}</p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SlotDisplay;