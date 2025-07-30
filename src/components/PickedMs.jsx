import React from 'react';
import MSSelector from './MSSelector';
import StatusDisplay from './StatusDisplay';
import SlotSelector from './SlotSelector';
import SelectedPartDisplay from './SelectedPartDisplay';
import MsInfoDisplay from './MsInfoDisplay';
import PartPreview from './PartPreview';
import { EXPANSION_OPTIONS, EXPANSION_DESCRIPTIONS } from '../constants/appConstants';

const PickedMs = ({
    msData,
    selectedMs,
    selectedParts,
    hoveredPart,
    selectedPreviewPart,
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
    showSelector,
    setShowSelector,
    filterType,
    setFilterType,
    filterCost,
    setFilterCost,
}) => {
    const baseName = selectedMs
        ? selectedMs["MS名"]
            .replace(/_LV\d+$/, '')
            .trim()
        : 'default';

    const getTypeColor = (type) => {
        switch (type) {
            case '強襲':
                return 'bg-red-500 text-gray-200';
            case '汎用':
            case '汎用（変形）':
                return 'bg-blue-500 text-gray-200';
            case '支援':
            case '支援攻撃':
                return 'bg-yellow-500 text-black';
            default:
                return 'bg-gray-500 text-gray-200';
        }
    };

    // MS選択ボタン押下時
    const handleOpenSelector = () => {
        setShowSelector(true);
        if (typeof window !== "undefined" && window.history && window.location) {
            // React Routerのnavigateをpropsで受け取っていればそれを使う
            if (typeof navigate === "function") {
                navigate('/');
            } else {
                // fallback: window.history.pushStateでURLだけ変更
                window.history.pushState({}, '', '/');
            }
        }
    };

    // MSSelectorでMSを選択した時
    const handleSelectMs = (ms) => {
        handleMsSelect(ms);
        setShowSelector(false);
    };

    // 左カラムの幅をshowSelectorで切り替え
    const leftColClass = `space-y-4 flex flex-col flex-shrink-0 ${showSelector ? 'w-full' : ''}`;
    const leftColStyle = showSelector
        ? {}
        : { width: '60%', minWidth: 320, maxWidth: 900 };

    return (
        <div
            className={`flex flex-row gap-6 items-start min-w-0 relative z-10 w-full max-w-screen-xl ${className}`}
        >
            <style>{`
              .pickedms-card {
                background: rgba(0,0,0,0.5);
                border: none;
                box-shadow: none;
                border-radius: 0;
                /* 右上の角を45度でカット（小さめ） */
                clip-path: polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%);
                transition: background 0.18s, box-shadow 0.18s, border-color 0.18s, transform 0.18s;
              }
            `}</style>
            {/* 左側のカラム（幅を動的に切り替え） */}
            <div className={leftColClass} style={leftColStyle}>
                {/* MSSelectorのみ表示 */}
                {showSelector && (
                    <MSSelector
                        msData={msData}
                        onSelect={handleSelectMs}
                        selectedMs={selectedMs}
                        filterType={filterType}
                        setFilterType={setFilterType}
                        filterCost={filterCost}
                        setFilterCost={setFilterCost}
                    />
                )}

                {/* MS詳細表示・パーツ一覧などは「selectedMs && !showSelector」の時だけ表示 */}
                {selectedMs && !showSelector && (
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
                            onMsImageClick={handleOpenSelector}
                            msData={msData}
                            handleMsSelect={handleMsSelect}
                        />

                        {/* スロットバー、装着済みパーツ一覧、装備選択を配置するメインの横並びコンテナ */}
                        <div className="flex flex-row gap-6 items-end w-full">
                            {/* 左サブカラム: スロットバーと装着済みパーツ一覧 (縦並び) */}
                            <div className="flex flex-col gap-6 flex-grow" style={{ maxWidth: '400px' }}>
                                {/* スロットバー */}
                                <div className="flex flex-col gap-2">
                                    <div className="w-fit">
                                        <SlotSelector
                                            usage={usageWithPreview}
                                            baseUsage={slotUsage}
                                            currentStats={currentStats}
                                            hoveredOccupiedSlots={hoveredOccupiedSlots}
                                        />
                                    </div>
                                </div>

                                {/* 装着済みパーツ一覧 */}
                                <div className="flex flex-col gap-2 w-full">
                                    <SelectedPartDisplay
                                        parts={selectedParts}
                                        onRemove={handlePartRemove}
                                        onClearAllParts={handleClearAllParts}
                                        onHoverPart={onSelectedPartDisplayHover}
                                        onLeavePart={onSelectedPartDisplayLeave}
                                    />
                                </div>
                            </div>

                            {/* 右サブカラム: 装備選択 (PartPreview) */}
                            <div className="flex flex-col gap-2 flex-shrink-0" style={{ width: '220px' }}>
                                <PartPreview part={hoveredPart || selectedPreviewPart} />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* 右側のカラム: ステータス一覧（MS詳細時のみ表示、幅を広く使う） */}
            {selectedMs && !showSelector && (
                <div className="space-y-4 flex flex-col flex-grow w-full h-full justify-end items-end" style={{ width: '40%', display: 'flex' }}>
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

export default PickedMs;