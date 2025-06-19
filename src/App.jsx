import React, { useState, useEffect, useRef } from 'react'; // useRef をインポート
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
  const msSelectionRef = useRef(null); // MsSelectionコンポーネントを参照するためのref
  const [msSelectionHeight, setMsSelectionHeight] = useState(0); // MsSelectionの動的な高さを保持するstate

  useEffect(() => {
    if (!selectedMs) setShowSelector(true);
  }, [selectedMs]);

  // MsSelectionコンポーネントの高さが変更されたときにそれを取得し、stateを更新
  useEffect(() => {
    const updateHeight = () => {
      if (msSelectionRef.current) {
        setMsSelectionHeight(msSelectionRef.current.offsetHeight);
      }
    };

    // 初回ロード時と、 selectedMs/showSelector などの状態変化時に高さを取得
    updateHeight();

    // ウィンドウのリサイズ時にも高さを更新
    window.addEventListener('resize', updateHeight);

    // クリーンアップ関数
    return () => window.removeEventListener('resize', updateHeight);
  }, [selectedMs, showSelector, msSelectionRef]); // 依存配列に msSelectionRef を追加

  if (!msData || msData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center justify-center">
        <p className="text-xl">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-800 flex flex-col items-center pt-12">
      <h1 className="text-5xl font-extrabold tracking-wide text-white drop-shadow-lg mb-8 font-zenoldmincho">GBO2-CSTM</h1>
      <div className="flex flex-col max-w-screen-xl w-full items-start sticky top-0 z-20 bg-gray-900">
        <div className="flex-shrink-0 w-full">
          <MsSelection
            ref={msSelectionRef} // MsSelection に ref を渡す
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