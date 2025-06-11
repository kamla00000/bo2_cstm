// src/components/SlotBar.jsx

import React from 'react';
// import PropTypes from 'prop-types'; // もし使っていないなら削除
// import '../styles/SlotBar.css'; // この行は削除されたまま

const SlotBar = ({
    slotType,
    totalMax, // フル強化後の最大スロット数 (例: 16)
    currentConfirmedUsage,
    hoveredOccupiedAmount,
    previewedUsageAmount,
    baseUsageAmount, // MSの初期スロット数 (例: 15)
    originalMax       // フル強化前の最大スロット数 (例: 15)
}) => {

    const maxRenderLimit = 40; // 最大表示バー数。適宜調整
    const actualDisplayBars = Math.min(Math.max(totalMax, currentConfirmedUsage, previewedUsageAmount), maxRenderLimit);

    const bars = [];
    for (let i = 1; i <= actualDisplayBars; i++) {
        let barClass = 'flex-none w-1.5 h-5 mr-0.5'; // 'rounded' を確実に削除済みであることを確認
        const slotIndex = i;

        // 状態判定
        const isOverflow = slotIndex > totalMax && slotIndex <= previewedUsageAmount;
        const isPreviewingUnselected = !isOverflow && slotIndex > currentConfirmedUsage && slotIndex <= previewedUsageAmount;
        const isHoveringOccupied = !isOverflow && !isPreviewingUnselected &&
                                   hoveredOccupiedAmount > 0 &&
                                   slotIndex > (currentConfirmedUsage - hoveredOccupiedAmount) &&
                                   slotIndex <= currentConfirmedUsage;
        
        // フル強化ボーナススロットの判定 (ボーダーの色とは独立した判定)
        const isFullStrengthenedBonusSlot = originalMax !== undefined && slotIndex > originalMax && slotIndex <= totalMax;


        // 色とボーダーの適用ロジック

        // 背景色を決定
        let bgColorClass = "bg-gray-500"; // デフォルト（未占有）

        if (isOverflow) {
            bgColorClass = "bg-red-500 animate-pulse";
        } else if (isPreviewingUnselected) {
            bgColorClass = "bg-green-500 animate-fast-pulse";
        } else if (isHoveringOccupied) {
            bgColorClass = "bg-yellow-400 animate-ping-once";
        } else if (slotIndex <= currentConfirmedUsage) {
            bgColorClass = "bg-blue-500"; // 確定済みスロットはすべて青色
        }
        // 背景色を barClass に結合
        barClass += ` ${bgColorClass}`;


        // ここからボーダーの適用ロジック
        // 緑色のボーダーを最優先にするため、他のボーダーより後に処理し、かつ上書きさせる
        let tempBorderClass = ''; // 一時的なボーダークラス用変数

        // ホバー中の装着済みパーツには黄色ボーダーを適用（ただし、オーバーフローと競合しない場合）
        // NOTE: isHoveringOccupied は hoverAmount が 0 より大きい場合にのみ true になる
        if (isHoveringOccupied && !isOverflow) {
            tempBorderClass = "border-2 border-yellow-300"; // 黄色ボーダー
        }

        // フル強化ボーナススロットに緑ボーダーを適用（最優先）
        // オーバーフローでない場合、他のボーダー設定を上書きして緑ボーダーを適用
        if (isFullStrengthenedBonusSlot && !isOverflow) {
             // ここで tempBorderClass を上書きすることで、緑ボーダーを最優先にする
             tempBorderClass = "border-t-2 border-b-2 border-green-400"; // 上下のみに緑ボーダーを上書き
        }
        // オーバーフローには赤ボーダー (これは背景色とセットで処理されているため、ここではボーダーの追加は不要)


        // 最終的に barClass にボーダークラスを結合
        barClass += ` ${tempBorderClass}`;

        bars.push(<div key={slotIndex} className={barClass}></div>);
    }

    return (
        <div className="flex flex-row overflow-x-auto overflow-y-hidden items-center">
            {bars}
        </div>
    );
};

// PropTypes が未使用の場合は、以下の行も削除できます。
// SlotBar.propTypes = {
//     slotType: PropTypes.string.isRequired,
//     totalMax: PropTypes.number.isRequired,
//     currentConfirmedUsage: PropTypes.number.isRequired,
//     hoveredOccupiedAmount: PropTypes.number,
//     previewedUsageAmount: PropTypes.number.isRequired,
//     baseUsageAmount: PropTypes.number.isRequired,
//     originalMax: PropTypes.number
// };

export default SlotBar;