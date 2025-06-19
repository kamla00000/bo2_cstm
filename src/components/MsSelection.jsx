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

    // MS選択ボタン押下時
    const handleOpenSelector = () => setShowSelector(true);

    // MSSelectorでMSを選択した時
    const handleSelectMs = (ms) => {
        handleMsSelect(ms);
        setShowSelector(false);
    };

    // MS再選択ボタン
    const renderMsSelectButton = () => (
        <button
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700 transition"
            onClick={handleOpenSelector}
        >
            MS選択
        </button>
    );

    // 左カラムの幅をshowSelectorで切り替え
    const leftColClass = `space-y-4 flex flex-col flex-shrink-0 ${showSelector ? 'w-full' : ''}`;
    // 左カラム全体の最大幅を調整。StatusDisplayの幅と合わせて調整が必要です。
    const leftColStyle = showSelector
        ? {}
        : { width: '60%', minWidth: 320, maxWidth: 900 }; // 左カラムの幅を少し狭める (70% -> 60%)

    return (
        <div
            className={`flex flex-row gap-6 items-start min-w-0
                bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700 relative z-10 w-full max-w-screen-xl ${className}`}
        >
            {/* 左側のカラム（幅を動的に切り替え） */}
            <div className={leftColClass} style={leftColStyle}>
                {/* MSSelector or MS選択ボタン */}
                {showSelector ? (
                    <MSSelector
                        msData={msData}
                        onSelect={handleSelectMs}
                        selectedMs={selectedMs}
                    />
                ) : (
                    renderMsSelectButton()
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
                        />

                        {/* スロットバー、装着済みパーツ一覧、装備選択を配置するメインの横並びコンテナ */}
                        <div className="flex flex-row gap-6 items-start w-full">
                            {/* 左サブカラム: スロットバーと装着済みパーツ一覧 (縦並び) */}
                            {/* flex-grow を残しつつ、このコンテナの最大幅も考慮 */}
                            <div className="flex flex-col gap-6 flex-grow" style={{ maxWidth: '400px' }}> {/* ここに maxWidth を追加して、左サブカラムの最大幅を制限 */}
                                {/* スロットバー */}
                                <div className="flex flex-col gap-2">
                                    <div className="p-4 bg-gray-700 rounded-lg shadow-inner w-fit">
                                        <SlotSelector
                                            usage={usageWithPreview}
                                            baseUsage={slotUsage}
                                            currentStats={currentStats}
                                            hoveredOccupiedSlots={hoveredOccupiedSlots}
                                        />
                                    </div>
                                </div>

                                {/* 装着済みパーツ一覧 */}
                                <div className="flex flex-col gap-2 w-full"> {/* w-full を追加して親のmaxWidthを使うようにする */}
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
                            <div className="flex flex-col gap-2 flex-shrink-0" style={{ width: '220px' }}> {/* PartPreviewの幅を少し広げた例 */}
                                <PartPreview part={hoveredPart || selectedPreviewPart} />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* 右側のカラム: ステータス一覧（MS詳細時のみ表示、幅を広く使う） */}
            {selectedMs && !showSelector && (
                <div className="space-y-4 flex flex-col flex-grow w-full"
                    style={{ width: '40%' }}> {/* 右カラムの幅を広げる (30% -> 40%) */}
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