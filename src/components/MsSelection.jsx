import React from 'react';
import MSSelector from './MSSelector';
import StatusDisplay from './StatusDisplay';
import SlotSelector from './SlotSelector';
import SelectedPartDisplay from './SelectedPartDisplay';
import MsInfoDisplay from './MsInfoDisplay';
import PartPreview from './PartPreview';
import { EXPANSION_OPTIONS, EXPANSION_DESCRIPTIONS } from '../constants/appConstants';

const MsSelection = ({
    msData,
    selectedMs,
    selectedParts,
    hoveredPart,
    selectedPreviewPart, // 追加
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
        <div className={`flex flex-col md:flex-row gap-4 items-start min-w-0
             bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700 relative z-10 ${className}`}>
            {/* 左側のカラム */}
            <div className="space-y-2 flex flex-col flex-shrink-0 w-full md:w-3/5">
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

                        {/* スロットセレクターとプレビューを横並びに */}
                        <div className="flex flex-row gap-4 items-start">
                            <div className="p-4 bg-gray-700 rounded-lg shadow-inner w-fit">
                                <div className="space-y-3">
                                    <SlotSelector
                                        usage={usageWithPreview}
                                        baseUsage={slotUsage}
                                        currentStats={currentStats}
                                        hoveredOccupiedSlots={hoveredOccupiedSlots}
                                    />
                                </div>
                            </div>
                            <div className="w-80">
                                <PartPreview part={hoveredPart || selectedPreviewPart} />
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

            {/* 右側のカラム: ステータス一覧（プレビューは表示しない） */}
            {selectedMs && (
                <div className="space-y-4 flex flex-col flex-grow w-full md:w-2/5">
                    <StatusDisplay
                        stats={currentStats}
                        selectedMs={selectedMs}
                        hoveredPart={hoveredPart}
                        isFullStrengthened={isFullStrengthened}
                        isModified={currentStats.isModified}
                    />
                </div>
            )}
        </div>
    );
};

export default MsSelection;