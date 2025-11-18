import { useFlick } from '../hooks/useFlick';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MSSelector from './MSSelector';
import StatusDisplay from './StatusDisplay';
import pickedMsStyles from './PickedMs.module.css';
import SlotSelector from './SlotSelector';
import SelectedPartDisplay from './SelectedPartDisplay';
import MsInfoDisplay from './MsInfoDisplay';
import PartPreview from './PartPreview';
import SaveLoadModal from './SaveLoadModal';
import { EXPANSION_OPTIONS, EXPANSION_DESCRIPTIONS } from '../constants/appConstants';
import styles from './PickedMs.module.css';

// ユーティリティのインポート
import {
    saveBuildToLocal,
    loadBuildsFromLocal,
    deleteBuildFromLocal,
    getAllBuildsCount,
    MAX_SAVED_BUILDS_PER_MS
} from '../utils/buildStorage';

import {
    restorePartsSequentially,
    cleanupRestoration,
    checkRestorationConditions,
    generateBuildData
} from '../utils/partRestoration';
const DEBUG_PARTS_LOADING = true; // デバッグフラグ

const PickedMs = React.forwardRef(({
    msData,
    selectedMs,
    selectedParts,
    hoveredPart,
    hoverSource,
    selectedPreviewPart,
    isFullStrengthened,
    expansionType,
    currentStats,
    previewStats,
    slotUsage,
    usageWithPreview,
    hoveredOccupiedSlots,
    setIsFullStrengthened,
    setFullStrengthenDirectly,
    setExpansionType,
    handleMsSelect,
    handlePartSelect,
    handlePartRemove,
    handleClearAllParts,
    allPartsCache,
    isDataLoaded,
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
    pendingRestoreParts,
    setPendingRestoreParts,
    setPartsRestored,
    urlBuildData,
    onUrlRestoreComplete,
    fullStrengtheningData,
}, ref) => {
    const navigate = useNavigate();

    // 右カラムの表示状態管理（767px以下のみ）
    const [showRightColumn, setShowRightColumn] = useState(false);
    const [isHiding, setIsHiding] = useState(false);

    // ステータスヒント表示状態を追加
    const [showStatusHint, setShowStatusHint] = useState(false);
    const [hasShownHintForCurrentMs, setHasShownHintForCurrentMs] = useState(false);

    // セーブ＆ロード機能
    const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
    const [savedBuilds, setSavedBuilds] = useState([]);
    const [saveError, setSaveError] = useState('');

    // 追加: ロード用フラグと一時保存
    const [pendingLoadParts, setPendingLoadParts] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(''); // ロード状況表示用
    
    // パーツ復元処理の重複実行防止用フラグ
    const [isRestoring, setIsRestoring] = useState(false);
    const restorationInProgressRef = useRef(false);

    // MSリストの絞り込み
    const filteredMsData = msData
        ? msData.filter(ms => {
            let typeMatch = !filterType || ms["属性"] === filterType;
            let costMatch = true;
            if (filterCost && filterCost !== '') {
                if (filterCost === 'low') {
                    costMatch = Number(ms["コスト"]) <= 400;
                } else {
                    costMatch = String(ms["コスト"]) === filterCost;
                }
            }
            let lvMatch = true;
            if (filterLv && filterLv !== '') {
                lvMatch = ms["MS名"].endsWith(`_LV${filterLv}`);
            }
            return typeMatch && costMatch && lvMatch;
        })
        : [];

    // アニメーション付きで右カラムを表示
    const showRightColumnWithAnimation = () => {
        setIsHiding(false);
        setShowRightColumn(true);
        setShowStatusHint(false);
    };

    // アニメーション付きで右カラムを非表示
    const hideRightColumnWithAnimation = () => {
        setIsHiding(true);
        setTimeout(() => {
            setShowRightColumn(false);
            setIsHiding(false);
        }, 100);
    };

    useEffect(() => {
        const handleResize = () => {
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

    // Pull-to-Refresh抑制（通常のスクロールは許可）
    useEffect(() => {
        // overscroll-behavior: noneをbodyに設定（これだけで多くのブラウザで機能する）
        document.body.style.overscrollBehavior = 'none';
        document.body.style.overscrollBehaviorY = 'none';
        
        // iOS Safariなど、overscroll-behaviorが効かない場合の追加対応
        let lastTouchY = 0;
        
        const handleTouchStart = (e) => {
            if (e.touches && e.touches[0]) {
                lastTouchY = e.touches[0].clientY;
            }
        };
        
        const handleTouchMove = (e) => {
            if (!e.touches || !e.touches[0]) return;
            
            const touchY = e.touches[0].clientY;
            const touchDeltaY = touchY - lastTouchY;
            
            // 本当にページ最上部で、プルダウンしようとしている場合のみブロック
            // かつ、まだスクロール位置が変わっていない（overscrollの兆候）
            const isAtTop = window.scrollY <= 0;
            const isPullingDown = touchDeltaY > 0;
            
            if (isAtTop && isPullingDown) {
                // ドキュメント全体のスクロールを止めるが、内部要素のスクロールは許可
                const target = e.target;
                let scrollableParent = null;
                let element = target;
                
                // スクロール可能な親要素を探す
                while (element && element !== document.documentElement) {
                    const computed = window.getComputedStyle(element);
                    if ((computed.overflowY === 'auto' || computed.overflowY === 'scroll') && 
                        element.scrollHeight > element.clientHeight) {
                        scrollableParent = element;
                        break;
                    }
                    element = element.parentElement;
                }
                
                // スクロール可能な親要素がない、またはその要素も最上部にいる場合のみブロック
                if (!scrollableParent || scrollableParent.scrollTop <= 0) {
                    e.preventDefault();
                }
            }
            
            lastTouchY = touchY;
        };
        
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        
        return () => {
            document.body.style.overscrollBehavior = '';
            document.body.style.overscrollBehaviorY = '';
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

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

    // セーブ/ロードボタン
    const handleShowSaveLoadModal = () => {
        if (selectedMs) {
            // 現在のMSのビルドのみを読み込み
            setSavedBuilds(loadBuildsFromLocal(selectedMs["MS名"]));
            setShowSaveLoadModal(true);
            setSaveError('');
            
            // デバッグ用：全MS別ビルド数を表示
            getAllBuildsCount();
        }
    };

    // セーブ処理（名前なし）
    const handleSaveBuild = () => {
        if (!selectedMs) {
            setSaveError('MSが選択されていません');
            return false;
        }

        // MS別の最大保存数をチェック
        if (savedBuilds.length >= MAX_SAVED_BUILDS_PER_MS) {
            setSaveError(`このMSのビルド保存上限（${MAX_SAVED_BUILDS_PER_MS}個）に達しています`);
            return false;
        }

        try {
            const build = generateBuildData(selectedMs, selectedParts, isFullStrengthened, expansionType);
            
            const success = saveBuildToLocal(build, selectedMs["MS名"]);
            if (success) {
                setSavedBuilds(loadBuildsFromLocal(selectedMs["MS名"]));
                setSaveError('');
                return true;
            } else {
                setSaveError('保存に失敗しました');
                return false;
            }
        } catch (error) {
            console.error('[handleSaveBuild] 保存エラー:', error);
            setSaveError('保存に失敗しました');
            return false;
        }
    };

    // ロード処理
    const handleLoadBuild = (build) => {
        setLoadingStatus('MSを検索中...');
        
        // 1. MSを検索
        const foundMs = msData.find(ms => ms["MS名"] === build.msName);
        if (!foundMs) {
            alert(`MSが見つかりません: ${build.msName}`);
            console.error('[handleLoadBuild] MSが見つかりません:', build.msName);
            setLoadingStatus('');
            return;
        }

        setLoadingStatus('現在のパーツをクリア中...');

        // 2. 現在のパーツを全てクリア
        handleClearAllParts();

        // 3. MSを選択
        setTimeout(() => {
            setLoadingStatus('MSを選択中...');
            handleMsSelect(foundMs);

            // 4. フル強化状態を設定（警告なし）
            setTimeout(() => {
                setLoadingStatus('設定を復元中...');
                // セーブデータ呼び出し時は警告を表示せずに直接設定
                const loadedFullStrength = typeof build.isFullStrengthened === 'number' ? build.isFullStrengthened : (build.isFullStrengthened ? 6 : 0);
                if (setFullStrengthenDirectly) {
                    setFullStrengthenDirectly(loadedFullStrength);
                } else {
                    setIsFullStrengthened(loadedFullStrength);
                }

                // 5. 拡張タイプを設定
                setTimeout(() => {
                    setExpansionType(build.expansionType || 'なし');

                    // 6. パーツ復元処理
                    setTimeout(() => {
                        const partsToRestore = build.parts || [];
                        
                        // パーツが空の場合は復元処理をスキップして完了
                        if (partsToRestore.length === 0) {
                            setLoadingStatus('');
                            if (typeof setPartsRestored === 'function') {
                                setPartsRestored(true);
                            }
                            return;
                        }
                        
                        // パーツがある場合のみ復元処理を実行
                        setLoadingStatus('パーツを復元中...');
                        setPendingLoadParts(partsToRestore);
                        
                        // App側のpendingRestorePartsにもセット
                        if (typeof setPendingRestoreParts === 'function') {
                            setPendingRestoreParts(partsToRestore);
                        }
                        if (typeof setPartsRestored === 'function') {
                            setPartsRestored(false);
                        }
                    }, 200);
                }, 200);
            }, 200);
        }, 200);

        setShowSaveLoadModal(false);
    };

    // パーツ復元処理のラッパー関数
    const handlePartsRestoration = async (partsToRestore, source = 'unknown') => {
        // 空配列または無効な値の場合は即座に完了
        if (!partsToRestore || !Array.isArray(partsToRestore) || partsToRestore.length === 0) {
            cleanupRestoration(
                restorationInProgressRef,
                setIsRestoring,
                setPendingLoadParts,
                setPendingRestoreParts,
                setPartsRestored,
                onUrlRestoreComplete,
                setLoadingStatus
            );
            return;
        }

        try {
            await restorePartsSequentially(
                partsToRestore,
                source,
                allPartsCache,
                handlePartSelect,
                setLoadingStatus,
                restorationInProgressRef,
                setIsRestoring
            );
        } catch (error) {
            console.error('[handlePartsRestoration] エラー:', error);
        } finally {
            cleanupRestoration(
                restorationInProgressRef,
                setIsRestoring,
                setPendingLoadParts,
                setPendingRestoreParts,
                setPartsRestored,
                onUrlRestoreComplete,
                setLoadingStatus
            );
        }
    };

    // 統一された復元処理のuseEffect
    useEffect(() => {
        // データ読み込み完了を待つ
        if (!isDataLoaded) {
            return;
        }
        
        // 復元条件をチェック
        if (!checkRestorationConditions(selectedMs, allPartsCache, handlePartSelect, restorationInProgressRef)) {
            return;
        }

        // URL復元を優先
        if (urlBuildData && urlBuildData.length > 0) {
            handlePartsRestoration(urlBuildData, 'URL');
            return;
        }

        // 次にApp側のpendingRestorePartsをチェック
        if (pendingRestoreParts && pendingRestoreParts.length > 0) {
            handlePartsRestoration(pendingRestoreParts, 'App');
            return;
        }

        // 最後にローカルのpendingLoadPartsをチェック
        if (pendingLoadParts && pendingLoadParts.length > 0) {
            handlePartsRestoration(pendingLoadParts, 'Local');
            return;
        }

        // パーツが空配列の場合の処理（pendingLoadPartsが[]の場合）
        if (pendingLoadParts && Array.isArray(pendingLoadParts) && pendingLoadParts.length === 0) {
            cleanupRestoration(
                restorationInProgressRef,
                setIsRestoring,
                setPendingLoadParts,
                setPendingRestoreParts,
                setPartsRestored,
                onUrlRestoreComplete,
                setLoadingStatus
            );
        }

    }, [
        isDataLoaded,
        urlBuildData, 
        pendingRestoreParts, 
        pendingLoadParts, 
        selectedMs, 
        allPartsCache, 
        handlePartSelect
    ]);

    // 削除処理
    const handleDeleteBuild = (index) => {
        if (!selectedMs) return;
        
        const success = deleteBuildFromLocal(selectedMs["MS名"], index);
        if (success) {
            // 削除後にリロード
            setSavedBuilds(loadBuildsFromLocal(selectedMs["MS名"]));
        }
    };



    const leftColClass = `${styles.leftColCustom} space-y-4 flex flex-col flex-shrink-0 ${showSelector ? 'w-full' : ''}`;
    const leftColStyle = showSelector
        ? {}
        : { width: '60%', minWidth: 320, maxWidth: 900 };

    // アイコンSVG（コピーアイコンと同じシリーズ）
    const SaveLoadIcon = (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="5" y="5" rx="2" ry="2"/>
            <path d="M12 9v6M9 12h6"/>
        </svg>
    );

    return (
        <div
            ref={ref}
            className={
                [
                    styles.pickedmsMainContainer,
                    "pickedms-main-container flex flex-row gap-2 items-start min-w-0 relative z-10 w-full max-w-screen-xl",
                    className,
                    showSelector ? "" : styles.pickedmsMainContainerActive
                ].join(" ")
            }
        >
            {/* ロード状況表示 */}
            {loadingStatus && (
                <section className={styles.loadingOverlay}>
                    <span className={styles.loadingSpinner}></span>
                    <p>{loadingStatus}</p>
                </section>
            )}
            
            {/* 左側のカラム */}
            <div className={leftColClass} style={leftColStyle}>
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

                {selectedMs && !showSelector && (
                    <>
                        <div className={pickedMsStyles.msreselect + " w-full flex justify-center"}>
                            <div className="flex items-center" style={{ maxWidth: '1280px', width: '100%' }}>
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
                                    <span className={"relative z-10 font-extrabold text-white text-4xl ml-4 " + styles.headingTextMobile}
                                        style={{ textShadow: '2px 2px 8px #000, 0 0 4px #000' }}
                                    >
                                        M　S　再　選　択
                                    </span>
                                </button>
                                {/* セーブ/ロードボタン（アイコンのみ） */}
                                <button onClick={handleShowSaveLoadModal} className="w-16 h-14 flex items-center justify-center bg-gray-800 hover:bg-gray-600 shadow transition" style={{ zIndex: 2, borderRadius: 0 }} title="セーブ/ロード">
                                    {SaveLoadIcon}
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
                        <div className={pickedMsStyles.slotPartsWrapper + " flex flex-row gap-6 items-end w-full"}>
                            <div className={pickedMsStyles['slotparts-leftcol']}>
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
                                <SelectedPartDisplay
                                    parts={selectedParts}
                                    onRemove={handlePartRemove}
                                    onClearAllParts={handleClearAllParts}
                                    onHoverPart={onSelectedPartDisplayHover}
                                    onLeavePart={onSelectedPartDisplayLeave}
                                    hoveredPart={hoveredPart}
                                    hoverSource={hoverSource}
                                />
                                <div className={styles.partPreviewArea}>
                                    <PartPreview part={hoveredPart || selectedPreviewPart} />
                                </div>
                            </div>
                            <div className={`${pickedMsStyles['slotparts-rightcol']} ${
                                showRightColumn && !isHiding ? pickedMsStyles.showRightColumn : ''
                            } ${isHiding ? pickedMsStyles.isHiding : ''}`}>
                                <div className={pickedMsStyles['slotparts-status-mobile']}>
                                    <StatusDisplay
                                        stats={currentStats}
                                        previewStats={previewStats}
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
            {selectedMs && !showSelector && (
                <div className={pickedMsStyles.statusListWrapper + " space-y-4 flex flex-col flex-grow w-full h-full justify-end items-end"}>
                    <StatusDisplay
                        stats={currentStats}
                        previewStats={previewStats}
                        selectedMs={selectedMs}
                        hoveredPart={hoveredPart}
                        isFullStrengthened={isFullStrengthened}
                        isModified={currentStats.isModified}
                    />
                </div>
            )}
            {showStatusHint && (
                <div className={pickedMsStyles.statusSwipeHint}>
                    <div className={pickedMsStyles.statusSwipeHintIcon}></div>
                    <div className={pickedMsStyles.statusSwipeHintTxt}>ステータス一覧を表示</div>
                </div>
            )}
            {/* セーブ/ロードモーダル */}
            <SaveLoadModal
                open={showSaveLoadModal}
                selectedMs={selectedMs}
                savedBuilds={savedBuilds}
                saveError={saveError}
                onClose={() => setShowSaveLoadModal(false)}
                onSave={handleSaveBuild}
                onSaveComplete={() => {
                    if (selectedMs) {
                        const updatedBuilds = loadBuildsFromLocal(selectedMs["MS名"]);
                        setSavedBuilds(updatedBuilds);
                    }
                }}
                onLoad={handleLoadBuild}
                onDelete={handleDeleteBuild}
                msData={msData}
                partsData={allPartsCache}
                fullStrengtheningData={fullStrengtheningData}
                currentParts={selectedParts}
                isCurrentFullStrengthened={isFullStrengthened}
                currentExpansionType={expansionType}
            />
        </div>
    );
});

export default PickedMs;