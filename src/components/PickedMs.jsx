import { useFlick } from '../hooks/useFlick';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MSSelector from './MSSelector';
import StatusDisplay from './StatusDisplay';
import pickedMsStyles from './PickedMs.module.css';
import SlotSelector from './SlotSelector';
import SelectedPartDisplay from './SelectedPartDisplay';
import MsInfoDisplay from './MsInfoDisplay';
import PartPreview from './PartPreview';
import { EXPANSION_OPTIONS, EXPANSION_DESCRIPTIONS } from '../constants/appConstants';
import styles from './PickedMs.module.css';

const PickedMs = React.forwardRef(({
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
    filterLv,
    setFilterLv,
    bgVideo,
    videoRef,
    handleBuildShare,
}, ref) => {
    console.log('🔥 PICKEDMS COMPONENT RENDERED:', {
        selectedMs: selectedMs ? selectedMs["MS名"] : 'none',
        showSelector,
        windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'undefined'
    });

    const navigate = useNavigate();

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
                return 'bg-yellow-500 text-black';
            default:
                return 'bg-gray-500 text-gray-200';
        }
    };

    // MSSelectorに戻る際にURLをクリアする関数
    const handleOpenSelector = () => {
        setShowSelector(true);
        navigate('/');
    };

    const handleSelectMs = (ms) => {
        handleMsSelect(ms);
        setShowSelector(false);
    };

    const leftColClass = `${styles.leftColCustom} space-y-4 flex flex-col flex-shrink-0 ${showSelector ? 'w-full' : ''}`;
    const leftColStyle = showSelector
        ? {}
        : { width: '60%', minWidth: 320, maxWidth: 900 };

    return (
        <div
            ref={ref}
            className={`${styles.pickedmsMainContainer} pickedms-main-container flex flex-row gap-2 items-start min-w-0 relative z-10 w-full max-w-screen-xl ${className}`}
        >
            {/* 左側のカラム（幅を動的に切り替え） */}
            <div className={leftColClass} style={leftColStyle}>
                {/* MSSelectorのみ表示 */}
                {showSelector && (
                    <MSSelector
                        msData={filteredMsData}
                        onSelect={handleSelectMs}
                        selectedMs={selectedMs}
                        filterType={filterType}
                        setFilterType={setFilterType}
                        filterCost={filterCost}
                        setFilterCost={setFilterCost}
                        filterLv={filterLv}
                        setFilterLv={setFilterLv}
                    />
                )}

                {/* MS詳細表示・パーツ一覧などは「selectedMs && !showSelector」の時だけ表示 */}
                {selectedMs && !showSelector && (
                    <>
                        {/* msreselectバーをmsInfoWrapperのすぐ上に配置 */}
                        <div className={pickedMsStyles.msreselect + " w-full flex justify-center"}>
                            <div
                                className="flex items-center"
                                style={{ maxWidth: '1280px', width: '100%' }}
                            >
                                {/* MS再選択ボタン */}
                                <button
                                    className="h-14 flex-1 rounded-none text-4xl text-gray-200 bg-transparent relative overflow-visible flex items-center group pl-8 pr-8"
                                    style={{
                                        borderRadius: 0,
                                        marginBottom: 0,
                                        zIndex: 1,
                                        padding: 0,
                                        minWidth: 0,
                                        textDecoration: 'none',
                                    }}
                                    onClick={handleOpenSelector}
                                >
                                    {/* ストライプ背景 */}
                                    <svg
                                        className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 group-hover:opacity-0"
                                        viewBox="0 0 100 56"
                                        preserveAspectRatio="none"
                                        aria-hidden="true"
                                        style={{ zIndex: 0 }}
                                    >
                                        <defs>
                                            <pattern
                                                id="stripe-bg"
                                                patternUnits="userSpaceOnUse"
                                                width="6"
                                                height="16"
                                                patternTransform="rotate(4)"
                                            >
                                                <animateTransform
                                                    attributeName="patternTransform"
                                                    type="translate"
                                                    from="0,0"
                                                    to="-6,0"
                                                    dur="3s"
                                                    repeatCount="indefinite"
                                                    additive="sum"
                                                />
                                                <rect x="0" y="0" width="4" height="16" fill="#ff9100" />
                                                <rect x="4" y="0" width="2" height="16" fill="transparent" />
                                            </pattern>
                                        </defs>
                                        <rect x="0" y="0" width="100" height="56" fill="url(#stripe-bg)" />
                                    </svg>
                                    {/* ホバー時：空間を進む演出（動画＋ズーム、枠内のみ） */}
                                    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                                        <video
                                            ref={typeof videoRef !== 'undefined' ? videoRef : null}
                                            className="w-full h-full object-cover opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-700"
                                            src={bgVideo}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            preload="auto"
                                            style={{
                                                pointerEvents: 'none',
                                            }}
                                        />
                                    </div>
                                    {/* テキスト */}
                                    <span className={"relative z-10 font-extrabold text-white text-4xl ml-4 " + styles.headingTextMobile}
                                        style={{ textShadow: '2px 2px 8px #000, 0 0 4px #000' }}
                                    >
                                        M　S　再　選　択
                                    </span>
                                </button>

                                {/* ビルド共有ボタン */}
                                {selectedMs && (
                                    <button
                                        className="w-16 h-14 flex items-center justify-center bg-gray-800 hover:bg-gray-600 shadow transition"
                                        style={{ zIndex: 2, borderRadius: 0 }}
                                        onClick={typeof handleBuildShare === 'function' ? handleBuildShare : undefined}
                                        title="ビルドのURLをコピー"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                        </svg>
                                    </button>
                                )}

                                {/* X（旧Twitter）アイコン */}
                                <a
                                    href="https://x.com/GBO2CSTM"
                                    className={styles.xIcon + " w-16 h-14 flex items-center justify-center bg-gray-800 hover:bg-gray-600 shadow transition"}
                                    style={{ zIndex: 2, borderRadius: 0 }}
                                    aria-label="Xでシェア" target="_blank"
                                >
                                    <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
                                        <rect width="64" height="64" rx="12" fill="black"/>
                                        <path d="M44.7 16H51.5L36.7 32.1L54 52H41.6L30.8 39.1L18.8 52H12L27.8 35.9L11 16H23.7L33.4 27.7L44.7 16ZM42.5 48.5H46.1L22.7 19.2H18.8L42.5 48.5Z" fill="white"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
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
});

export default PickedMs;