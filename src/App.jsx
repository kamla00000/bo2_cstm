import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from './hooks/useAppData';
import { CATEGORY_NAMES, ALL_CATEGORY_NAME } from './constants/appConstants';
import PartSelectionSection from './components/PartSelectionSection';
import PickedMs from './components/PickedMs';
import FullStrengthenWarningModal from './components/FullStrengthenWarningModal';
import InfoModal from './components/InfoModal';
import styles from './components/PickedMs.module.css';

const BG_VIDEOS = [
    "/images/zekunova.mp4",
    "/images/zekunova2.mp4",
];

const LV_FILTERS = [
    { label: '全LV', value: '' },
    { label: 'LV1', value: '1' },
    { label: 'LV2', value: '2' },
    { label: 'LV3', value: '3' },
    { label: 'LV4', value: '4' },
    { label: 'LV5', value: '5' },
    { label: 'LV6', value: '6' },
];

// --- normalize関数を強化・統一 ---
const normalizeString = (name) => {
    if (!name) return '';
    return String(name)
        .trim()
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)) // 全角英数→半角
        .replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)) // 全角記号→半角
        .replace(/[ΖＺZｚ]/g, 'z')
        .replace(/[νｖV]/g, 'v')
        .replace(/[αａA]/g, 'a')
        .replace(/[βｂB]/g, 'b')
        .replace(/[［\[]/g, '[').replace(/[］\]]/g, ']')
        .replace(/【/g, '[').replace(/】/g, ']')
        .replace(/_lv(\d+)/gi, (_, lv) => `_lv${lv}`) // _LV1→_lv1
        .replace(/[ＬＶ]/gi, 'lv')
        .replace(/[\s　]+/g, '')
        .normalize('NFKC')
        .toLowerCase();
};

const normalizeMsName = (name) => normalizeString(name);
const normalizePartName = (name) => normalizeString(name);

const generateBuildUrl = (ms, selectedParts, isFullStrengthened, expansionType) => {
    if (!ms) return '';
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

    const videoRef = useRef(null);
    const [bgVideo, setBgVideo] = useState(BG_VIDEOS[0]);
    const [showFullStrengthenWarning, setShowFullStrengthenWarning] = useState(false);
    const [pendingFullStrengthen, setPendingFullStrengthen] = useState(null);
    const [showBuildShareModal, setShowBuildShareModal] = useState(false);
    const [urlConfigLoaded, setUrlConfigLoaded] = useState(false);
    
    // URL復元用の状態（PickedMsに渡す用）
    const [urlBuildData, setUrlBuildData] = useState(null);

    useEffect(() => {
        console.log('[AppContent] filterType:', filterType, 'filterCost:', filterCost, 'filterLv:', filterLv, 'selectedMs:', selectedMs, 'msData.length:', msData?.length);
    }, [filterType, filterCost, filterLv, selectedMs, msData]);

    // MSピック時にランダム動画を選択
    const handleMsSelectWithVideo = (ms) => {
        setBgVideo(BG_VIDEOS[Math.floor(Math.random() * BG_VIDEOS.length)]);
        handleMsSelect(ms);
        setShowSelector(false);
        setUrlConfigLoaded(false);
        setUrlBuildData(null);
        if (ms && ms["MS名"]) {
            navigate(`/${encodeURIComponent(ms["MS名"])}`);
        }
    };

    // MS名復元とURL復元処理を統合
    useEffect(() => {
    try {
        if (
            msData && Array.isArray(msData) && msData.length > 0 &&
            msName && !urlConfigLoaded
        ) {
            const decodedName = decodeURIComponent(msName);
            const normalizedDecoded = normalizeMsName(decodedName);
            const foundMs = msData.find(ms => {
                const norm = normalizeMsName(ms["MS名"]);
                return norm === normalizedDecoded;
            });
            
            if (foundMs && (!selectedMs || selectedMs["MS名"] !== foundMs["MS名"])) {
                const buildConfig = parseBuildFromUrl();
                console.log('[DEBUG App.js URL復元] buildConfig:', buildConfig);
                
                // URL復元データがある場合、PickedMsに渡すためのパーツ配列を作成
                if (buildConfig.parts && buildConfig.parts.length > 0) {
                    console.log('[DEBUG App.js] URL復元パーツ一覧:', buildConfig.parts);
                    setUrlBuildData(buildConfig.parts); // 配列形式で渡す
                }
                
                handleMsSelect(foundMs);
                setShowSelector(false);
                if (buildConfig.fullst) setIsFullStrengthened(true);
                if (buildConfig.expansion && buildConfig.expansion !== 'なし') setExpansionType(buildConfig.expansion);
                setUrlConfigLoaded(true);
            } else if (!foundMs) {
                setShowSelector(true);
                setUrlConfigLoaded(true);
            }
        }
    } catch (err) {
        console.error('[DEBUG] MS名復元処理で例外:', err);
    }
}, [msName, msData, urlConfigLoaded, handleMsSelect, setIsFullStrengthened, setExpansionType, selectedMs]);


    useEffect(() => {
        if (!selectedMs) setShowSelector(true);
    }, [selectedMs]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 2.0;
        }
    }, []);

    // 警告モーダル付きフル強化切り替え
    const handleFullStrengthenToggle = (next) => {
        if (isFullStrengthened && !next) {
            // 完→零（パーツ装備中なら警告）
            if (selectedParts && selectedParts.length > 0) {
                setPendingFullStrengthen(next);
                setShowFullStrengthenWarning(true);
            } else {
                setIsFullStrengthened(next);
                handleClearAllParts(); // パーツを必ず外す
            }
        } else if (!isFullStrengthened && next) {
            // 零→完
            setIsFullStrengthened(next);
        } else if (isFullStrengthened && next) {
            // 完→完（何もしない）
            setIsFullStrengthened(next);
        } else {
            // 零→零（何もしない）
            setIsFullStrengthened(next);
        }
    };

    const handleFullStrengthenWarningOk = () => {
        setShowFullStrengthenWarning(false);
        setIsFullStrengthened(pendingFullStrengthen);
        setPendingFullStrengthen(null);
        handleClearAllParts(); // パーツを必ず外す
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
                        handlePartSelect={handlePartSelect} 
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
                        handleBuildShare={handleBuildShare}
                        videoRef={videoRef}
                        bgVideo={bgVideo}
                        allPartsCache={allPartsCache}
                        urlBuildData={urlBuildData} // URL復元データを渡す
                        onUrlRestoreComplete={() => setUrlBuildData(null)} // URL復元完了コールバック
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