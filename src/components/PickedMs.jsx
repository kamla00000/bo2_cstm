import { useFlick } from '../hooks/useFlick';
import React, { useState, useEffect } from 'react';
import MSSelector from './MSSelector';
import StatusDisplay from './StatusDisplay';
import pickedMsStyles from './PickedMs.module.css';
import SlotSelector from './SlotSelector';
import SelectedPartDisplay from './SelectedPartDisplay';
import MsInfoDisplay from './MsInfoDisplay';
import PartPreview from './PartPreview';
import { EXPANSION_OPTIONS, EXPANSION_DESCRIPTIONS } from '../constants/appConstants';
import styles from './PickedMs.module.css';

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
    // 右カラムの表示状態管理（767px以下のみ）
    const [showRightColumn, setShowRightColumn] = useState(false);
    const [isHiding, setIsHiding] = useState(false);

    // アニメーション付きで右カラムを表示
    const showRightColumnWithAnimation = () => {
        setIsHiding(false);
        setShowRightColumn(true);
    };

    // アニメーション付きで右カラムを非表示
    const hideRightColumnWithAnimation = () => {
        setIsHiding(true);
        // 0.1秒後（アニメーション完了後）に実際に非表示にする
        setTimeout(() => {
            setShowRightColumn(false);
            setIsHiding(false);
        }, 100); // 0.1秒 = 100ms
    };

    // 画面サイズの監視
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 767) {
                // 768px以上：モバイルステータスを非表示
                setShowRightColumn(false);
                setIsHiding(false);
            }
            // 767px以下に戻った時は、状態はそのまま（左フリックで再度表示可能）
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 767px以下での左フリック機能
    useFlick(
        () => { 
            // 左フリック：767px以下でのみ右カラムを表示
            if (window.innerWidth <= 767) {
                showRightColumnWithAnimation();
            }
        },
        () => { 
            // 右フリック：767px以下でのみ右カラムを非表示
            if (window.innerWidth <= 767) {
                hideRightColumnWithAnimation();
            }
        }
    );
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
        const leftColClass = `${pickedMsStyles.flexRowPadded} space-y-4 flex flex-col flex-shrink-0 ${showSelector ? 'w-full' : ''}`;
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
            className={`${styles.pickedmsMainContainer} pickedms-main-container flex flex-row gap-6 items-start min-w-0 relative z-10 w-full max-w-screen-xl ${className}`}
        >
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
                                                <div className={pickedMsStyles.msInfoWrapper}>
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
                                                </div>

                        {/* スロットバー、装着済みパーツ一覧、装備選択を配置するメインの横並びコンテナ */}
                        <div className={pickedMsStyles.slotPartsWrapper + " flex flex-row gap-6 items-end w-full"}>
                            {/* 左サブカラム: スロットバー・装着済みパーツ・装備プレビュー（縦並び） */}
                            <div className={pickedMsStyles['slotparts-leftcol']}>
                                {/* スロットバー */}
                                <div className={styles.slotBarSection}>
                                    <div className={styles.slotBarWrapper}>
                                        <SlotSelector
                                            usage={usageWithPreview}
                                            baseUsage={slotUsage}
                                            currentStats={currentStats}
                                            hoveredOccupiedSlots={hoveredOccupiedSlots}
                                        />
                                    </div>
                                </div>

                                {/* 装着済みパーツ一覧 */}
                                <SelectedPartDisplay
                                    parts={selectedParts}
                                    onRemove={handlePartRemove}
                                    onClearAllParts={handleClearAllParts}
                                    onHoverPart={onSelectedPartDisplayHover}
                                    onLeavePart={onSelectedPartDisplayLeave}
                                />

                                {/* 装備プレビュー */}
                                <div className={styles.partPreviewArea}>
                                    <PartPreview part={hoveredPart || selectedPreviewPart} />
                                </div>
                            </div>

                            {/* 右サブカラム: ステータス一覧（1279px以下のみ） */}
                             <div className={`${pickedMsStyles['slotparts-rightcol']} ${
                                 showRightColumn && !isHiding ? pickedMsStyles.showRightColumn : ''
                             } ${isHiding ? pickedMsStyles.isHiding : ''}`}>
                                 <div className={pickedMsStyles['slotparts-status-mobile']}>
                                     <StatusDisplay
                                         stats={currentStats}
                                         selectedMs={selectedMs}
                                         hoveredPart={hoveredPart}
                                         isFullStrengthened={isFullStrengthened}
                                         isModified={currentStats.isModified}
                                         isMobile={true}
                                         onClose={hideRightColumnWithAnimation}
                                     />
                                 </div>
                             </div>
                        </div>
                    </>
                )}
            </div>

            {/* 右側のカラム: ステータス一覧（MS詳細時のみ表示、幅を広く使う） */}
            {selectedMs && !showSelector && (
                <div className={pickedMsStyles.statusListWrapper + " space-y-4 flex flex-col flex-grow w-full h-full justify-end items-end"}>
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