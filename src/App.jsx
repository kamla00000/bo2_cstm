import React, { useState, useEffect, useRef } from 'react';
import MsSelection from './components/MsSelection';
import PartSelectionSection from './components/PartSelectionSection';
import { useAppData } from './hooks/useAppData';
import { CATEGORIES, ALL_CATEGORY_NAME } from './constants/appConstants';

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
  const msSelectionRef = useRef(null);
  const [msSelectionHeight, setMsSelectionHeight] = useState(0);

  useEffect(() => {
    if (!selectedMs) setShowSelector(true);
  }, [selectedMs]);

  useEffect(() => {
    const updateHeight = () => {
      if (msSelectionRef.current) {
        setMsSelectionHeight(msSelectionRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [selectedMs, showSelector, msSelectionRef]);

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
        <h1 className="text-5xl font-extrabold tracking-wide text-gray-400 drop-shadow-lg mb-4 font-zenoldmincho">
          GBO2-CSTM
        </h1>
      )}
      {/* MS選択ボタン（斜めストライプボーダー装飾） */}
      {!showSelector && (
        <div className="w-full flex justify-center">
  <button
    className="w-full h-14 rounded-none font-bold text-4xl text-gray-400 bg-transparent relative overflow-visible"
    style={{
      maxWidth: '1280px',
      borderRadius: 0,
      marginBottom: 0,
      zIndex: 1,
      padding: 0,
    }}
    onClick={() => setShowSelector(true)}
  >
    <svg
      className="absolute inset-0 pointer-events-none"
      width="100%" height="100%" viewBox="0 0 1280 56"
      style={{ zIndex: 0 }}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="stripe" patternUnits="userSpaceOnUse" width="30" height="30" patternTransform="rotate(45)">
          <rect x="0" y="0" width="15" height="30" fill="#ff9100" />
          <rect x="15" y="0" width="15" height="30" fill="transparent" />
        </pattern>
      </defs>
      <rect
        x="0" y="0" width="1280" height="56"
        fill="none"
        stroke="url(#stripe)"
        strokeWidth="30"
      />
    </svg>
    <span className="relative z-10">MS選択</span>
  </button>
</div>
      )}
      {/* 下のコンテンツ */}
      <div className="flex flex-col max-w-screen-xl w-full items-start sticky top-0 z-20 bg-gray-700">
        <div className="flex-shrink-0 w-full">
          <MsSelection
            ref={msSelectionRef}
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
            handleMsSelect={(ms) => {
              handleMsSelect(ms);
              setShowSelector(false);
            }}
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
              categories={CATEGORIES}
              allCategoryName={ALL_CATEGORY_NAME}
              onPreviewSelect={handlePartPreviewSelect}
              hoveredPart={hoveredPart}
            />
          </div>
        )}
      </div>
      <div style={{ height: msSelectionHeight }}></div>
    </div>
  );
}

export default App;