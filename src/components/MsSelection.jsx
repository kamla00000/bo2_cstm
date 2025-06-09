// src/components/MsSelection.jsx (修正点のみ)
import React from 'react';
import MSSelector from './MSSelector';
import StatusDisplay from './StatusDisplay';
import SlotSelector from './SlotSelector'; // ★ import
import SelectedPartDisplay from './SelectedPartDisplay';
import MsInfoDisplay from './MsInfoDisplay';

const MsSelection = ({
    msData,
    selectedMs,
    selectedParts,
    hoveredPart,
    isFullStrengthened,
    expansionType,
    expansionOptions,
    expansionDescriptions,
    currentStats, // ★ このプロップはSlotSelectorに渡されます
    slotUsage,
    usageWithPreview,
    setHoveredPart,
    setIsFullStrengthened,
    setExpansionType,
    handleMsSelect,
    handlePartRemove,
    handleClearAllParts,
    className // ★ className prop を追加
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
                            expansionOptions={expansionOptions}
                            expansionDescriptions={expansionDescriptions}
                            getTypeColor={getTypeColor}
                        />

                        <div>
                            <SlotSelector
                                usage={usageWithPreview}
                                // ★ ここを変更: maxUsageにcurrentStatsを渡すのではなく、
                                // ★ currentStatsからフル強化スロットボーナスをSlotSelector内部で加算するように変更
                                maxUsage={{ // このオブジェクト自体は現状維持でOK。SlotSelector内で使う。
                                  close: Number(selectedMs.近スロット ?? 0), // MSの基本スロット情報
                                  mid: Number(selectedMs.中スロット ?? 0),
                                  long: Number(selectedMs.遠スロット ?? 0),
                                }}
                                baseUsage={slotUsage}
                                // ★ currentStats を SlotSelector に渡す
                                currentStats={currentStats}
                            />
                        </div>

                        <div>
                            <SelectedPartDisplay
                                parts={selectedParts}
                                onRemove={handlePartRemove}
                                onClearAllParts={handleClearAllParts}
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