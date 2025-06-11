// src/components/SlotSelector.jsx

import React from 'react';
import SlotBar from './SlotBar'; // SlotBar コンポーネントをインポート

const SlotSelector = ({ usage, baseUsage, currentStats, hoveredOccupiedSlots }) => {
    // usage は usageWithPreview オブジェクト全体を指す
    // baseUsage は slotUsage オブジェクト全体を指す
    // currentStats は currentStats オブジェクト全体を指す
    // hoveredOccupiedSlots は hoveredOccupiedSlots オブジェクト全体を指す

    // 安全なデフォルト値を設定
    const safeUsage = usage || {};
    const safeBaseUsage = baseUsage || {};
    const safeHoveredOccupiedSlots = hoveredOccupiedSlots || {};


    // スロットの最大値は usageWithPreview (App.jsx -> useAppData -> calculateUsageWithPreview) から取得
    // または currentStats.msBaseSlots と fullStrengtheningEffects から計算することも可能だが、
    // usageWithPreview が既にこの値を計算しているため、それを利用するのがシンプル
    const closeMax = safeUsage.maxClose ?? 0;
    const midMax = safeUsage.maxMid ?? 0;
    const longMax = safeUsage.maxLong ?? 0;

    // 現在の確定使用量 (緑色のバーの終点) は baseUsage から取得
    const closeCurrent = safeBaseUsage.close ?? 0;
    const midCurrent = safeBaseUsage.mid ?? 0;
    const longCurrent = safeBaseUsage.long ?? 0;

    // baseUsageAmount (SlotBar の赤いバーの基準) は baseUsage から取得
    const closeBase = safeBaseUsage.close ?? 0;
    const midBase = safeBaseUsage.mid ?? 0;
    const longBase = safeBaseUsage.long ?? 0; // ここは前回修正済み

    // originalMax (SlotBar の濃い背景の基準) は baseUsage の max 値から取得
    const originalCloseMax = safeBaseUsage.maxClose ?? 0;
    const originalMidMax = safeBaseUsage.maxMid ?? 0; // ★ここを修正しました: safeBaseBase -> safeBaseUsage
    const originalLongMax = safeBaseUsage.maxLong ?? 0;

    return (
        <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
            <div className="space-y-3">
                {/* 近距離スロット */}
                <div className="flex items-center text-sm font-medium">
                    <span className="text-gray-300 mr-2 whitespace-nowrap">近距離スロット</span>
                    <span
                        className={`text-base font-bold w-[60px] flex-shrink-0 ${
                            (safeUsage.close ?? 0) > closeMax ? 'text-red-500' : 'text-white'
                        }`}
                    >
                        {safeUsage.close ?? 0} / {closeMax}
                    </span>
                    <SlotBar
                        slotType="Close"
                        currentConfirmedUsage={closeCurrent} // 緑色の確定使用量
                        totalMax={closeMax} // バー全体の最大値
                        baseUsageAmount={closeBase} // 赤いバーの基準 (現在の確定使用量)
                        originalMax={originalCloseMax} // 濃い背景の基準 (フル強化前の最大値)
                        hoveredOccupiedAmount={safeHoveredOccupiedSlots.close || 0} // ホバー中のパーツが占めるスロット量 (黄色のバー)
                        previewedUsageAmount={safeUsage.close || 0} // ホバー中のパーツを含めた合計使用量 (緑色のバーのプレビュー値)
                    />
                </div>

                {/* 中距離スロット */}
                <div className="flex items-center text-sm font-medium">
                    <span className="text-gray-300 mr-2 whitespace-nowrap">中距離スロット</span>
                    <span
                        className={`text-base font-bold w-[60px] flex-shrink-0 ${
                            (safeUsage.mid ?? 0) > midMax ? 'text-red-500' : 'text-white'
                        }`}
                    >
                        {safeUsage.mid ?? 0} / {midMax}
                    </span>
                    <SlotBar
                        slotType="Mid"
                        currentConfirmedUsage={midCurrent}
                        totalMax={midMax}
                        baseUsageAmount={midBase}
                        originalMax={originalMidMax}
                        hoveredOccupiedAmount={safeHoveredOccupiedSlots.mid || 0}
                        previewedUsageAmount={safeUsage.mid || 0}
                    />
                </div>

                {/* 遠距離スロット */}
                <div className="flex items-center text-sm font-medium">
                    <span className="text-gray-300 mr-2 whitespace-nowrap">遠距離スロット</span>
                    <span
                        className={`text-base font-bold w-[60px] flex-shrink-0 ${
                            (safeUsage.long ?? 0) > longMax ? 'text-red-500' : 'text-white'
                        }`}
                    >
                        {safeUsage.long ?? 0} / {longMax}
                    </span>
                    <SlotBar
                        slotType="Long"
                        currentConfirmedUsage={longCurrent}
                        totalMax={longMax}
                        baseUsageAmount={longBase}
                        originalMax={originalLongMax}
                        hoveredOccupiedAmount={safeHoveredOccupiedSlots.long || 0}
                        previewedUsageAmount={safeUsage.long || 0}
                    />
                </div>
            </div>
        </div>
    );
};

export default SlotSelector;