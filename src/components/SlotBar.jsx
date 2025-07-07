// src/components/SlotBar.jsx (前回の修正で、classNameを受け取るように変更済みのもの)

import React from 'react';

const SlotBar = ({
    slotType,
    totalMax,
    currentConfirmedUsage,
    hoveredOccupiedAmount,
    previewedUsageAmount,
    baseUsageAmount,
    originalMax,
    className // ここに className prop を追加
}) => {
    const maxRenderLimit = 40; 
    const actualDisplayBars = Math.min(Math.max(totalMax, currentConfirmedUsage, previewedUsageAmount), maxRenderLimit);

    const singleBarWidth = 8; 
    const calculatedTotalWidth = actualDisplayBars * singleBarWidth;

    const bars = [];
    for (let i = 1; i <= actualDisplayBars; i++) {
        let barClass = 'flex-none w-1.5 h-5 mr-0.5'; 
        const slotIndex = i;

        const isOverflow = slotIndex > totalMax && slotIndex <= previewedUsageAmount;
        const isPreviewingUnselected = !isOverflow && slotIndex > currentConfirmedUsage && slotIndex <= previewedUsageAmount;
        const isHoveringOccupied = !isOverflow && !isPreviewingUnselected &&
                                   hoveredOccupiedAmount > 0 &&
                                   slotIndex > (currentConfirmedUsage - hoveredOccupiedAmount) &&
                                   slotIndex <= currentConfirmedUsage;
        
        const isFullStrengthenedBonusSlot = originalMax !== undefined && slotIndex > originalMax && slotIndex <= totalMax;

        let bgColorClass = "bg-gray-300";

        if (isOverflow) {
            bgColorClass = "bg-red-500 animate-pulse";
        } else if (isPreviewingUnselected) {
            bgColorClass = "bg-green-500 animate-fast-pulse";
        } else if (isHoveringOccupied) {
            bgColorClass = "bg-yellow-400 animate-ping-once";
        } else if (slotIndex <= currentConfirmedUsage) {
            bgColorClass = "bg-blue-500";
        }
        barClass += ` ${bgColorClass}`;

        let tempBorderClass = ''; 

        if (isHoveringOccupied && !isOverflow) {
            tempBorderClass = "border-2 border-yellow-300"; 
        }

        if (isFullStrengthenedBonusSlot && !isOverflow) {
             tempBorderClass = "border-t-2 border-b-2 border-orange-600"; 
        }
        barClass += ` ${tempBorderClass}`;

        bars.push(<div key={slotIndex} className={barClass}></div>);
    }

    return (
        <div 
            className={`flex flex-row overflow-x-auto overflow-y-hidden items-center ${className || ''}`} // className を適用
            style={{ width: `${calculatedTotalWidth}px`, minWidth: '0px' }}
        >
            {bars}
        </div>
    );
};

export default SlotBar;