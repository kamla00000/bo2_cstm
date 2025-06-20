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
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center justify-center">
        <p className="text-xl">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-800 flex flex-col items-center pt-12">
      {showSelector && (
        <h1 className="text-5xl font-extrabold tracking-wide text-white drop-shadow-lg mb-4 font-zenoldmincho">
          GBO2-CSTM
        </h1>
      )}
      {/* MS選択ボタンをmax-w-screen-xlで中央寄せ＆横一杯に */}
      {!showSelector && (
        <div className="w-full flex justify-center">
          <button
            className="w-full h-14 bg-blue-600 text-white rounded-none font-bold text-4xl"
            style={{ maxWidth: '1280px', borderRadius: 0, marginBottom: 0 }}
            onClick={() => setShowSelector(true)}
          >
            MS選択
          </button>
        </div>
      )}
      {/* 下のコンテンツもmax-w-screen-xlで合わせる */}
      <div className="flex flex-col max-w-screen-xl w-full items-start sticky top-0 z-20 bg-gray-900">
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