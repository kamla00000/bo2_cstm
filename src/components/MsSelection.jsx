// src/components/MsSelection.jsx

import React from 'react';
import MSSelector from './MSSelector';
import StatusDisplay from './StatusDisplay';
import SlotSelector from './SlotSelector'; // SlotBar ではなく SlotSelector が使われていますね
import SelectedPartDisplay from './SelectedPartDisplay';
import MsInfoDisplay from './MsInfoDisplay';
import { EXPANSION_OPTIONS, EXPANSION_DESCRIPTIONS } from '../constants/appConstants';

const MsSelection = ({
    msData,
    selectedMs,
    selectedParts,
    hoveredPart,
    isFullStrengthened,
    expansionType,
    currentStats,
    slotUsage,
    usageWithPreview, // useAppDataから渡された usageWithPreview を受け取る
    hoveredOccupiedSlots,
    // setHoveredPart, // App.jsxでhandlePartHoverに集約されたので不要
    setIsFullStrengthened,
    setExpansionType,
    handleMsSelect,
    handlePartRemove,
    handleClearAllParts,
    className,
    onSelectedPartDisplayHover, // App.js から渡されるホバーイベントハンドラ
    onSelectedPartDisplayLeave, // App.js から渡されるホバーイベントハンドラ
}) => {
    const baseName = selectedMs
        ? selectedMs["MS名"]
            .replace(/_LV\d+$/, '')
            .trim()
        : 'default';

    const getTypeColor = (type) => {
        switch (type) {
            case '強襲':
                return 'bg-red-500 text-white';
            case '汎用':
            case '汎用（変形）':
                return 'bg-blue-500 text-white';
            case '支援':
            case '支援攻撃':
                return 'bg-yellow-500 text-black';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 w-full items-start
             bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700 relative z-10 ${className}`}>

            <div className="space-y-2 md:col-span-3 flex flex-col">
                <MSSelector
                    msData={msData}
                    onSelect={handleMsSelect}
                    selectedMs={selectedMs}
                />

                {selectedMs && (
                    <>
                        <MsInfoDisplay
                            selectedMs={selectedMs}
                            baseName={baseName}
                            isFullStrengthened={isFullStrengthened}
                            setIsFullStrengthened={setIsFullStrengthened}
                            expansionType={expansionType}
                            setExpansionType={setExpansionType}
                            expansionOptions={EXPANSION_OPTIONS}
                            expansionDescriptions={EXPANSION_DESCRIPTIONS}
                            getTypeColor={getTypeColor}
                        />

                        {/* MSステータス下のメインスロットゲージ (赤オーバーフロー、黄色点滅用) */}
                        <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
                            <div className="space-y-3">
                                <SlotSelector
                                    usage={usageWithPreview} // ★★★ ここを修正！ usageWithPreview を直接渡す ★★★
                                    // maxUsage は usageWithPreview に含まれているため不要
                                    baseUsage={slotUsage} // 赤オーバーフローの基準
                                    currentStats={currentStats}
                                    hoveredOccupiedSlots={hoveredOccupiedSlots} // ★★★ ここも追加！ ★★★
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-xl font-bold text-white mb-2">装着済みパーツ一覧</h3>
                            <SelectedPartDisplay
                                parts={selectedParts}
                                onRemove={handlePartRemove}
                                onClearAllParts={handleClearAllParts}
                                // ★★★ 新しく追加するプロップをSelectedPartDisplayに渡す ★★★
                                onHoverPart={onSelectedPartDisplayHover}
                                onLeavePart={onSelectedPartDisplayLeave}
                            />
                        </div>
                    </>
                )}
            </div>

            {selectedMs && (
                <div className="space-y-4 md:col-span-2 flex flex-col">
                    <StatusDisplay
                        stats={currentStats}
                        selectedMs={selectedMs}
                        hoveredPart={hoveredPart}
                        isFullStrengthened={isFullStrengthened}
                    />
                </div>
            )}
        </div>
    );
};

export default MsSelection;