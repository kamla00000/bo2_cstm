// src/components/MsSelection.jsx
import React from 'react';
import MSSelector from './MSSelector';
import StatusDisplay from './StatusDisplay';
import SlotSelector from './SlotSelector';
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
    currentStats,
    slotUsage,
    usageWithPreview,
    hoveredOccupiedSlots, // ★★★ ここで hoveredOccupiedSlots を受け取る ★★★
    setHoveredPart,
    setIsFullStrengthened,
    setExpansionType,
    handleMsSelect,
    handlePartRemove,
    handleClearAllParts,
    className
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
                                maxUsage={{
                                    close: Number(selectedMs.近スロット ?? 0),
                                    mid: Number(selectedMs.中スロット ?? 0),
                                    long: Number(selectedMs.遠スロット ?? 0),
                                }}
                                baseUsage={slotUsage} // useAppDataから取得したslotUsageをそのまま渡す
                                currentStats={currentStats}
                                hoveredOccupiedSlots={hoveredOccupiedSlots} // ★★★ ここで SlotSelector に渡す ★★★
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