import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { useAppData } from './hooks/useAppData';
import { CATEGORY_NAMES, ALL_CATEGORY_NAME } from './constants/appConstants';
import PartSelectionSection from './components/PartSelectionSection';
import PickedMs from './components/PickedMs';
import FullStrengthenWarningModal from './components/FullStrengthenWarningModal';
import InfoModal from './components/InfoModal';
import styles from './components/PickedMs.module.css';

// 背景動画のパターン
const BG_VIDEOS = [
    "/images/zekunova.mp4",
    "/images/zekunova2.mp4",
];

// LV絞り込み用
const LV_FILTERS = [
    { label: '全LV', value: '' },
    { label: 'LV1', value: '1' },
    { label: 'LV2', value: '2' },
    { label: 'LV3', value: '3' },
    { label: 'LV4', value: '4' },
    { label: 'LV5', value: '5' },
    { label: 'LV6', value: '6' },
];

// ビルドURL生成
const generateBuildUrl = (ms, selectedParts, isFullStrengthened, expansionType) => {
    if (!ms) return '';
    // encodeURIComponentのみで統一
    const encodedMsName = encodeURIComponent(ms["MS名"]);
    const baseUrl = `${window.location.origin}/${encodedMsName}`;
    const params = new URLSearchParams();
    if (isFullStrengthened) params.set('fullst', '1');
    if (expansionType && expansionType !== 'なし') params.set('expansion', expansionType);
    if (selectedParts && selectedParts.length > 0) {
        const partIds = selectedParts.map(part => encodeURIComponent(part.name)).join(',');
        params.set('parts', partIds);
    }
    const queryString = params.toString();
    const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    return finalUrl;
};

const parseBuildFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        fullst: urlParams.get('fullst') === '1',
        expansion: urlParams.get('expansion') || 'なし',
        parts: urlParams.get('parts')
            ? urlParams.get('parts').split(',').map(name => decodeURIComponent(name))
            : []
    };
};

function AppContent() {
    const {
        msData,
        partData,
        selectedMs,
        selectedParts,
        hoveredPart,
        selectedPreviewPart,
        hoveredOccupiedSlots,
        filterCategory,
        setFilterCategory,
        isFullStrengthened,
        expansionType,
        expansionOptions,
        expansionDescriptions,
        currentStats,
        slotUsage,
        usageWithPreview,
        handlePartHover,
        handlePartPreviewSelect,
        setIsFullStrengthened,
        setExpansionType,
        handleMsSelect,
        handlePartRemove,
        handlePartSelect,
        handleClearAllParts,
        isPartDisabled,
        allPartsCache,
    } = useAppData();

    const navigate = useNavigate();
    const { msName } = useParams();

    // 属性・コスト・LV絞り込みをAppで管理
    const [filterType, setFilterType] = useState('');
    const [filterCost, setFilterCost] = useState('');
    const [filterLv, setFilterLv] = useState('');
    const [showSelector, setShowSelector] = useState(!selectedMs);
    const PickedMsRef = useRef(null);
    const [PickedMsHeight, setPickedMsHeight] = useState(0);

    const videoRef = useRef(null);
    const [bgVideo, setBgVideo] = useState(BG_VIDEOS[0]);
    const [showFullStrengthenWarning, setShowFullStrengthenWarning] = useState(false);
    const [pendingFullStrengthen, setPendingFullStrengthen] = useState(null);
    const [showBuildShareModal, setShowBuildShareModal] = useState(false);
    const [urlConfigLoaded, setUrlConfigLoaded] = useState(false);
    const [partsRestored, setPartsRestored] = useState(false);
    const [pendingRestoreParts, setPendingRestoreParts] = useState(null);

    // MSピック時にランダム動画を選択
    const handleMsSelectWithVideo = (ms) => {
        setBgVideo(BG_VIDEOS[Math.floor(Math.random() * BG_VIDEOS.length)]);
        handleMsSelect(ms);
        setShowSelector(false);
        setUrlConfigLoaded(false);
        setPartsRestored(false);
        setPendingRestoreParts(null);
        if (ms && ms["MS名"]) {
            navigate(`/${encodeURIComponent(ms["MS名"])}`);
        }
    };

    // MS名復元処理
    useEffect(() => {
        if (!msData || !Array.isArray(msData) || msData.length === 0) return;
        if (msName && !urlConfigLoaded) {
            const decodedName = decodeURIComponent(msName);
            const foundMs = msData.find(ms => ms["MS名"] === decodedName);
            if (foundMs && (!selectedMs || selectedMs["MS名"] !== foundMs["MS名"])) {
                handleMsSelect(foundMs);
                setShowSelector(false);
                const buildConfig = parseBuildFromUrl();
                if (buildConfig.fullst) {
                    setIsFullStrengthened(true); // ← ここを修正
                }
                if (buildConfig.expansion && buildConfig.expansion !== 'なし') setExpansionType(buildConfig.expansion);
                setUrlConfigLoaded(true);
            }
        }
    }, [msName, msData, urlConfigLoaded, handleMsSelect, setIsFullStrengthened, setExpansionType, selectedMs]);
    // パーツ復元処理（2段階）
    useEffect(() => {
        if (!selectedMs || !msName || !urlConfigLoaded || partsRestored) return;
        if (!allPartsCache || Object.keys(allPartsCache).length === 0) return;
        const buildConfig = parseBuildFromUrl();
        if (buildConfig.parts && buildConfig.parts.length > 0) {
            setPendingRestoreParts(buildConfig.parts);
            handleClearAllParts();
        } else {
            setPartsRestored(true);
        }
    }, [selectedMs, urlConfigLoaded, allPartsCache, partsRestored, handleClearAllParts, msName]);

    useEffect(() => {
        if (!pendingRestoreParts || partsRestored) return;
        if (!selectedMs || !allPartsCache) return;
        if (selectedParts.length > 0) return;
        const allParts = [];
        for (const categoryName of Object.keys(allPartsCache)) {
            if (allPartsCache[categoryName]) {
                allParts.push(...allPartsCache[categoryName]);
            }
        }
        pendingRestoreParts.forEach(partName => {
            if (!partName || partName.trim() === '') return;
            const foundPart = allParts.find(part => part.name === partName);
            if (foundPart) {
                handlePartSelect(foundPart);
            }
        });
        setPartsRestored(true);
        setPendingRestoreParts(null);
    }, [selectedParts, pendingRestoreParts, partsRestored, selectedMs, allPartsCache, handlePartSelect]);

    useEffect(() => {
        if (!selectedMs) setShowSelector(true);
    }, [selectedMs]);

    useEffect(() => {
        const updateHeight = () => {
            if (PickedMsRef.current) {
                setPickedMsHeight(PickedMsRef.current.offsetHeight);
            }
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, [selectedMs, showSelector, PickedMsRef]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 2.0;
        }
    }, []);

    // 警告モーダル付きフル強化切り替え
    const handleFullStrengthenToggle = (next) => {
        if (isFullStrengthened && !next) {
            if (selectedParts && selectedParts.length > 0) {
                setPendingFullStrengthen(next);
                setShowFullStrengthenWarning(true);
            } else {
                setIsFullStrengthened(next);
            }
        } else {
            setIsFullStrengthened(next);
        }
    };

    const handleFullStrengthenWarningOk = () => {
        setShowFullStrengthenWarning(false);
        setIsFullStrengthened(pendingFullStrengthen);
        setPendingFullStrengthen(null);
        handleClearAllParts();
    };

    const handleFullStrengthenWarningCancel = () => {
        setShowFullStrengthenWarning(false);
        setPendingFullStrengthen(null);
    };

    const handleBuildShare = async () => {
        if (!selectedMs) return;
        const buildUrl = generateBuildUrl(selectedMs, selectedParts, isFullStrengthened, expansionType);
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(buildUrl);
                setShowBuildShareModal(true);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = buildUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    setShowBuildShareModal(true);
                } else {
                    prompt('以下のURLをコピーしてください:', buildUrl);
                }
            }
        } catch (err) {
            console.error('クリップボードへのコピーに失敗しました:', err);
            try {
                const textArea = document.createElement('textarea');
                textArea.value = buildUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    setShowBuildShareModal(true);
                } else {
                    prompt('以下のURLをコピーしてください:', buildUrl);
                }
            } catch (fallbackErr) {
                console.error('フォールバックも失敗:', fallbackErr);
                prompt('以下のURLをコピーしてください:', buildUrl);
            }
        }
    };

    const handleBuildShareModalClose = () => {
        setShowBuildShareModal(false);
    };

    if (!msData || msData.length === 0) {
        return (
            <div className="min-h-screen bg-gray-700 text-gray-100 p-4 flex flex-col items-center justify-center">
                <p className="text-xl">データを読み込み中...</p>
                {msName && (
                    <div className="mt-4 flex items-center gap-3">
                        <div className="flex gap-1">
                            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                        <span className="text-gray-200">MS「{decodeURIComponent(msName)}」を準備中</span>
                    </div>
                )}
            </div>
        );
    }

    const mainUI = (
        <div className={`min-h-screen bg-transparent flex flex-col items-center max-w-[1280px] w-full mx-auto appMainRoot ${selectedMs && !showSelector ? 'pickedms-active' : ''}`}>
            {/* フル強化解除警告モーダル */}
            <FullStrengthenWarningModal
                open={showFullStrengthenWarning}
                onOk={handleFullStrengthenWarningOk}
                onCancel={handleFullStrengthenWarningCancel}
            />

            {/* ビルド共有完了モーダル */}
            <InfoModal
                open={showBuildShareModal}
                title="生　成　完　了"
                message="ビルドの専用URLを&#13;&#10;クリップボードにコピーしました。"
                onOk={handleBuildShareModalClose}
                okButtonText="OK"
            />

            {showSelector && (
                <h1 className="text-5xl font-extrabold tracking-wide text-gray-200 drop-shadow-lg">GBO2-CSTM</h1>
            )}
            {/* MS再選択バー */}
            {!showSelector && (
                <div className={`w-full flex justify-center ${styles.msreselect}`}>
                    <div
                        className="flex items-center"
                        style={{ maxWidth: '1280px', width: '100%' }}
                    >
                        {/* MS再選択ボタン */}
                        <Link
                            to="/"
                            className="h-14 flex-1 rounded-none text-4xl text-gray-200 bg-transparent relative overflow-visible flex items-center group pl-8 pr-8"
                            style={{
                                borderRadius: 0,
                                marginBottom: 0,
                                zIndex: 1,
                                padding: 0,
                                minWidth: 0,
                                textDecoration: 'none',
                            }}
                            onClick={() => {
                                setShowSelector(true);
                            }}
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
                                    ref={videoRef}
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
                        </Link>

                        {/* ビルド共有ボタン */}
                        {selectedMs && (
                            <button
                                className="w-16 h-14 flex items-center justify-center bg-gray-800 hover:bg-gray-600 shadow transition"
                                style={{ zIndex: 2, borderRadius: 0 }}
                                onClick={handleBuildShare}
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
            )}
            {/* 下のコンテンツ */}
            <div id="share-target" className="flex flex-col max-w-screen-xl w-full items-start sticky top-0 z-20 bg-transparent">
                <div className="flex-shrink-0 w-full">
                    <PickedMs
                        ref={PickedMsRef}
                        msData={msData}
                        selectedMs={selectedMs}
                        selectedParts={selectedParts}
                        hoveredPart={hoveredPart}
                        selectedPreviewPart={selectedPreviewPart}
                        isFullStrengthened={isFullStrengthened}
                        expansionType={expansionType}
                        expansionOptions={expansionOptions}
                        expansionDescriptions={expansionDescriptions}
                        currentStats={currentStats}
                        slotUsage={slotUsage}
                        usageWithPreview={usageWithPreview}
                        hoveredOccupiedSlots={hoveredOccupiedSlots}
                        setIsFullStrengthened={handleFullStrengthenToggle}
                        setExpansionType={setExpansionType}
                        handleMsSelect={handleMsSelectWithVideo}
                        handlePartRemove={handlePartRemove}
                        handleClearAllParts={handleClearAllParts}
                        onSelectedPartDisplayHover={(part) => handlePartHover(part, 'selectedParts')}
                        onSelectedPartDisplayLeave={() => handlePartHover(null, null)}
                        showSelector={showSelector}
                        setShowSelector={setShowSelector}
                        filterType={filterType}
                        setFilterType={setFilterType}
                        filterCost={filterCost}
                        setFilterCost={setFilterCost}
                        filterLv={filterLv}
                        setFilterLv={setFilterLv}
                    />
                </div>
                {selectedMs && !showSelector && (
                    <div className="flex-grow w-full">
                        <PartSelectionSection
                            partData={partData}
                            selectedParts={selectedParts}
                            onSelectPart={handlePartSelect}
                            onRemovePart={handlePartRemove}
                            onHoverPart={(part) => handlePartHover(part, 'partList')}
                            selectedMs={selectedMs}
                            currentSlotUsage={slotUsage}
                            usageWithPreview={usageWithPreview}
                            filterCategory={filterCategory}
                            setFilterCategory={setFilterCategory}
                            categories={CATEGORY_NAMES}
                            allCategoryName={ALL_CATEGORY_NAME}
                            onPreviewSelect={handlePartPreviewSelect}
                            hoveredPart={hoveredPart}
                            isPartDisabled={isPartDisabled} 
                        />
                    </div>
                )}
            </div>
            <div style={{ height: PickedMsHeight }}></div>
        </div>
    );

    return mainUI;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/:msName" element={<AppContent />} />
                <Route path="/" element={<AppContent />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;