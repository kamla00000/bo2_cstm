// src/components/SlotBar.jsx

import React from 'react';

const SlotBar = ({
    slotType,
    totalMax,
    currentConfirmedUsage,
    hoveredOccupiedAmount,
    previewedUsageAmount,
    baseUsageAmount,
    originalMax
}) => {

    const maxRenderLimit = 40;
    const actualDisplayBars = Math.min(Math.max(totalMax, currentConfirmedUsage, previewedUsageAmount), maxRenderLimit);

    // ★★★ デバッグログ群: ループの外で、関数が呼ばれるたびに一度だけ出力されるように配置 ★★★
    console.groupCollapsed(`Slot Bar Debug: ${slotType}`); // groupCollapsed に変更して初期状態で閉じる
    console.log('totalMax:', totalMax);
    console.log('currentConfirmedUsage:', currentConfirmedUsage);
    console.log('hoveredOccupiedAmount (for yellow):', hoveredOccupiedAmount);
    console.log('previewedUsageAmount (for green/red):', previewedUsageAmount);
    console.log('actualDisplayBars (total bars to render):', actualDisplayBars);
    console.groupEnd();

    const bars = [];
    for (let i = 1; i <= actualDisplayBars; i++) {
        let barClass = 'flex-none w-1.5 h-5 mr-0.5';
        const slotIndex = i;

        // ★★★ 優先順位に基づいた状態判定（ここを修正） ★★★
        // 1. スロットオーバー (最優先: 赤)
        const isOverflow = slotIndex > totalMax && slotIndex <= previewedUsageAmount;

        // 2. ホバー中の未装着パーツの仮反映 (次点: 緑)
        // isOverflowではない かつ 現在の確定量を超えており かつ プレビュー量以下である
        const isPreviewingUnselected = !isOverflow && slotIndex > currentConfirmedUsage && slotIndex <= previewedUsageAmount;

        // 3. ホバー中の装着済みパーツの占有 (次点: 黄色)
        // isOverflowでもisPreviewingUnselectedでもない かつ ホバー量が存在し、その範囲内である
        // hoveredOccupiedAmount は、hoveredPartがselectedPartsにあり、hoverSourceがselectedPartsの時にのみ設定されるはず
        const isHoveringOccupied = !isOverflow && !isPreviewingUnselected &&
                                   hoveredOccupiedAmount > 0 &&
                                   slotIndex > (currentConfirmedUsage - hoveredOccupiedAmount) &&
                                   slotIndex <= currentConfirmedUsage;

        // 4. フル強化ボーナススロット（境界を示すため）
        const isFullStrengthenedBonusSlot = originalMax !== undefined && slotIndex > originalMax && slotIndex <= totalMax; // originalMax のチェックを追加

        // ★★★ スロットごとの判定結果ログを詳細化 ★★★
        console.groupCollapsed(`[${slotType}] Slot ${slotIndex} State Checks`); // 各スロットのログもグループ化
        console.log(`isOverflow: ${isOverflow} (Conditions: ${slotIndex} > ${totalMax} && ${slotIndex} <= ${previewedUsageAmount})`);
        console.log(`isPreviewingUnselected: ${isPreviewingUnselected} (Conditions: !isOverflow && ${slotIndex} > ${currentConfirmedUsage} && ${slotIndex} <= ${previewedUsageAmount})`);
        console.log(`isHoveringOccupied: ${isHoveringOccupied} (Conditions: !isOverflow && !isPreviewingUnselected && ${hoveredOccupiedAmount} > 0 && ${slotIndex} > (${currentConfirmedUsage} - ${hoveredOccupiedAmount}) && ${slotIndex} <= ${currentConfirmedUsage})`);
        console.log(`isFullStrengthenedBonusSlot: ${isFullStrengthenedBonusSlot} (Conditions: ${originalMax} !== undefined && ${slotIndex} > ${originalMax} && ${slotIndex} <= ${totalMax})`);
        console.groupEnd();


        // ★★★ 色の適用ロジック（修正） ★★★
        // if-else if の順序で優先順位を保証する
        if (isOverflow) {
            barClass += " bg-red-500 animate-pulse border-2 border-red-500";
            // console.log(`[${slotType}] Slot ${slotIndex}: OVERFLOW (RED)!`); // 上のログで詳細化したのでこちらは不要
        } else if (isPreviewingUnselected) {
            barClass += " bg-green-500 animate-fast-pulse";
            // console.log(`[${slotType}] Slot ${slotIndex}: PREVIEWING UNSELECTED (GREEN)`); // 上のログで詳細化したのでこちらは不要
        } else if (isHoveringOccupied) {
            barClass += " bg-yellow-400 border-yellow-300 animate-ping-once";
            // console.log(`[${slotType}] Slot ${slotIndex}: HOVERED OCCUPIED (YELLOW)`); // 上のログで詳細化したのでこちらは不要
        } else if (slotIndex <= currentConfirmedUsage) {
            // 確定済みスロットの色分け
            // baseUsageAmountは基本スロットの数
            if (slotIndex <= baseUsageAmount) {
                barClass += " bg-blue-500"; // 基本スロットの確定済みは青
                // console.log(`[${slotType}] Slot ${slotIndex}: BASE CONFIRMED (BLUE)`); // 上のログで詳細化したのでこちらは不要
            } else {
                barClass += " bg-purple-500"; // 追加スロット（カスタムパーツによる）の確定済みは紫
                // console.log(`[${slotType}] Slot ${slotIndex}: CURRENT CONFIRMED (PURPLE)`); // 上のログで詳細化したのでこちらは不要
            }
        } else {
            // デフォルトの灰色 (未占有スロット)
            barClass += " bg-gray-500";
            // console.log(`[${slotType}] Slot ${slotIndex}: Default (Gray).`); // 上のログで詳細化したのでこちらは不要
        }

        // フル強化スロットのボーダーは、オーバーフローやプレビュー、ホバーで上書きされない限り適用
        // isFullStrengthenedBonusSlotは、totalMaxがoriginalMaxより大きい場合にのみ意味を持つ
        // currentConfirmedUsage, previewedUsageAmount, hoveredOccupiedAmount のいずれにも含まれない、
        // しかし totalMax の範囲内のスロットにボーダーを適用したい
        if (isFullStrengthenedBonusSlot &&
            slotIndex > currentConfirmedUsage && // 確定済みではない
            slotIndex > previewedUsageAmount && // プレビュー中ではない
            !(slotIndex > (currentConfirmedUsage - hoveredOccupiedAmount) && slotIndex <= currentConfirmedUsage) // ホバー中ではない
        ) {
            barClass += " border-2 border-lime-400";
        }


        bars.push(<div key={slotIndex} className={barClass}></div>);
    }

    return (
        <div className="flex flex-row overflow-x-auto overflow-y-hidden items-center">
            {bars}
        </div>
    );
};

export default SlotBar;