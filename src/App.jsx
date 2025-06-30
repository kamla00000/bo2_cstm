import React, { useState, useEffect, useRef } from 'react';
import PickedMs from './components/PickedMs';
import PartSelectionSection from './components/PartSelectionSection';
import { useAppData } from './hooks/useAppData';
import { CATEGORY_NAMES, ALL_CATEGORY_NAME } from './constants/appConstants';

// 追加: 背景動画のパターン
const BG_VIDEOS = [
  "/images/zekunova.mp4",
  "/images/zekunova2.mp4",
];

function App() {
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
  } = useAppData();

  const [showSelector, setShowSelector] = useState(!selectedMs);
  const PickedMsRef = useRef(null);
  const [PickedMsHeight, setPickedMsHeight] = useState(0);

  // 動画再生速度用ref
  const videoRef = useRef(null);

  // ランダム動画選択
  const [bgVideo, setBgVideo] = useState(BG_VIDEOS[0]);

  // MSピック時にランダム動画を選択
  const handleMsSelectWithVideo = (ms) => {
    setBgVideo(BG_VIDEOS[Math.floor(Math.random() * BG_VIDEOS.length)]);
    handleMsSelect(ms);
    setShowSelector(false);
  };

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

  // 再生スピード
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 2.0;
    }
  }, []);

  if (!msData || msData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-700 text-gray-100 p-4 flex flex-col items-center justify-center">
        <p className="text-xl">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-700 flex flex-col items-center pt-12">
      {showSelector && (
        <h1 className="text-5xl font-extrabold tracking-wide text-gray-200 drop-shadow-lg mb-4 font-zenoldmincho">
          GBO2-CSTM
        </h1>
      )}
      {/* MS選択ボタン（斜めストライプボーダー装飾 or 空間エフェクト） */}
      {!showSelector && (
        <div className="w-full flex justify-center mb-4">
          <button
            className="w-full h-14 rounded-none font-bold text-4xl text-gray-200 bg-transparent relative overflow-visible flex items-center group"
            style={{
              maxWidth: '1280px',
              borderRadius: 0,
              marginBottom: 0,
              zIndex: 1,
              padding: 0,
            }}
            onClick={() => setShowSelector(true)}
          >
            {/* 通常ストライプ */}
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
            <span className="relative z-10 pl-6 pr-4 font-extrabold text-white text-4xl"
              style={{ textShadow: '2px 2px 8px #000, 0 0 4px #000' }}
            >
              M　S　再　選　択
            </span>
          </button>
        </div>
      )}
      {/* 下のコンテンツ */}
      <div className="flex flex-col max-w-screen-xl w-full items-start sticky top-0 z-20 bg-gray-700">
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
            setIsFullStrengthened={setIsFullStrengthened}
            setExpansionType={setExpansionType}
            handleMsSelect={handleMsSelectWithVideo}
            handlePartRemove={handlePartRemove}
            handleClearAllParts={handleClearAllParts}
            onSelectedPartDisplayHover={(part) => handlePartHover(part, 'selectedParts')}
            onSelectedPartDisplayLeave={() => handlePartHover(null, null)}
            showSelector={showSelector}
            setShowSelector={setShowSelector}
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
            />
          </div>
        )}
      </div>
      <div style={{ height: PickedMsHeight }}></div>
    </div>
  );
}

export default App;