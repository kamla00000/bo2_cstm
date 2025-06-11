// src/components/MsSelection.jsx

import React from 'react';
import MSSelector from './MSSelector';
import StatusDisplay from './StatusDisplay';
import SlotSelector from './SlotSelector';
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
    usageWithPreview,
    hoveredOccupiedSlots,
    setIsFullStrengthened,
    setExpansionType,
    handleMsSelect,
    handlePartRemove,
    handleClearAllParts,
    className,
    onSelectedPartDisplayHover,
    onSelectedPartDisplayLeave,
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
                                    usage={usageWithPreview}
                                    baseUsage={slotUsage}
                                    currentStats={currentStats}
                                    hoveredOccupiedSlots={hoveredOccupiedSlots}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-xl font-bold text-white mb-2">装着済みパーツ一覧</h3>
                            <SelectedPartDisplay
                                parts={selectedParts}
                                onRemove={handlePartRemove}
                                onClearAllParts={handleClearAllParts}
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
                        // ★★★ ここを追加！ currentStats.isModified を StatusDisplay に渡す ★★★
                        isModifiedStats={currentStats.isModified}
                    />
                </div>
            )}
        </div>
    );
};

export default MsSelection;