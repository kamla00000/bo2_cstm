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
    filterLv, // 追加
    setFilterLv, // 追加（必要なら）
}) => {
    console.log('🔥 PICKEDMS COMPONENT RENDERED:', {
        selectedMs: selectedMs ? selectedMs["MS名"] : 'none',
        showSelector,
        windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'undefined'
    });
    
    // 右カラムの表示状態管理（767px以下のみ）
    const [showRightColumn, setShowRightColumn] = useState(false);
    const [isHiding, setIsHiding] = useState(false);
    
    // ステータスヒント表示状態を追加
    const [showStatusHint, setShowStatusHint] = useState(false);
    const [hasShownHintForCurrentMs, setHasShownHintForCurrentMs] = useState(false);

    // MSリストの絞り込み（filterLv対応: MS名の末尾 _LVx で判定）
    const filteredMsData = msData
        ? msData.filter(ms => {
            let typeMatch = !filterType || ms["属性"] === filterType;
            let costMatch = !filterCost || String(ms["コスト"]) === filterCost;
            let lvMatch = true;
            if (filterLv) {
                // MS名の末尾が _LV{filterLv} かどうか
                lvMatch = ms["MS名"].endsWith(`_LV${filterLv}`);
            }
            return typeMatch && costMatch && lvMatch;
        })
        : [];

    // アニメーション付きで右カラムを表示
    const showRightColumnWithAnimation = () => {
        console.log('🎯 showRightColumnWithAnimation called');
        setIsHiding(false);
        setShowRightColumn(true);
        setShowStatusHint(false);
    };

    // アニメーション付きで右カラムを非表示
    const hideRightColumnWithAnimation = () => {
        console.log('🎯 hideRightColumnWithAnimation called');
        setIsHiding(true);
        setTimeout(() => {
            setShowRightColumn(false);
            setIsHiding(false);
        }, 100);
    };

    useEffect(() => {
        const handleResize = () => {
            console.log('🎯 Resize detected, width:', window.innerWidth);
            if (window.innerWidth > 767) {
                setShowRightColumn(false);
                setIsHiding(false);
                setShowStatusHint(false);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedMs, showSelector, showRightColumn]);

    useEffect(() => {
        console.log('🔥 HINT USEEFFECT TRIGGERED:', {
            selectedMs: selectedMs ? selectedMs["MS名"] : 'none',
            showSelector,
            hasShownHint: hasShownHintForCurrentMs,
            showRightColumn,
            width: window.innerWidth
        });
        if (selectedMs && !showSelector && window.innerWidth <= 767 && !hasShownHintForCurrentMs) {
            setShowStatusHint(true);
            setHasShownHintForCurrentMs(true);
            const fadeTimer = setTimeout(() => {
                setShowStatusHint(false);
            }, 1000);
            return () => clearTimeout(fadeTimer);
        } else {
            setShowStatusHint(false);
        }
    }, [selectedMs, showSelector]);
    
    useEffect(() => {
        if (selectedMs) {
            setHasShownHintForCurrentMs(false);
        }
    }, [selectedMs]);

    useFlick(
        () => { 
            if (window.innerWidth <= 767 && !showSelector && selectedMs) {
                showRightColumnWithAnimation();
            }
        },
        () => { 
            if (window.innerWidth <= 767 && !showSelector && selectedMs) {
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

    const handleOpenSelector = () => {
        setShowSelector(true);
        if (typeof window !== "undefined" && window.history && window.location) {
            if (typeof navigate === "function") {
                navigate('/');
            } else {
                window.history.pushState({}, '', '/');
            }
        }
    };

    const handleSelectMs = (ms) => {
        handleMsSelect(ms);
        setShowSelector(false);
    };

    const leftColClass = `space-y-4 flex flex-col flex-shrink-0 ${showSelector ? 'w-full' : ''}`;
    const leftColStyle = showSelector
        ? {}
        : { width: '60%', minWidth: 320, maxWidth: 900 };

    return (
        <div
            className={`${styles.pickedmsMainContainer} pickedms-main-container flex flex-row gap-2 items-start min-w-0 relative z-10 w-full max-w-screen-xl ${className}`}
        >
            {/* 左側のカラム（幅を動的に切り替え） */}
            <div className={leftColClass} style={leftColStyle}>
                {/* MSSelectorのみ表示 */}
                {showSelector && (
                    <MSSelector
                        msData={filteredMsData} // ここで絞り込み済みデータを渡す
                        onSelect={handleSelectMs}
                        selectedMs={selectedMs}
                        filterType={filterType}
                        setFilterType={setFilterType}
                        filterCost={filterCost}
                        setFilterCost={setFilterCost}
                        filterLv={filterLv} // 必要ならMSSelectorにも渡す
                        setFilterLv={setFilterLv}
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
            
            {/* ステータスヒント表示 */}
            {showStatusHint && (
                <div className={pickedMsStyles.statusSwipeHint}>
                    <div className={pickedMsStyles.statusSwipeHintIcon}></div>
                    <div className={pickedMsStyles.statusSwipeHintTxt}>ステータス一覧を表示</div>
                </div>
            )}
        </div>
    );
};

export default PickedMs;