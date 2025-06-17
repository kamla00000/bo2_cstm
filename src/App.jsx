import React from 'react';
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
    selectedPreviewPart, // 追加
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
    handlePartPreviewSelect, // 追加
    setIsFullStrengthened,
    setExpansionType,
    handleMsSelect,
    handlePartRemove,
    handlePartSelect,
    handleClearAllParts,
  } = useAppData();

  if (!msData || msData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center justify-center">
        <p className="text-xl">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold tracking-wide text-white drop-shadow-lg flex-shrink-0 mb-6">bo2-cstm</h1>
      <div className="flex flex-col max-w-screen-xl w-full items-start">
        <div className="flex-shrink-0 w-full">
          <MsSelection
            msData={msData}
            selectedMs={selectedMs}
            selectedParts={selectedParts}
            hoveredPart={hoveredPart}
            selectedPreviewPart={selectedPreviewPart} // 追加
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
            handleMsSelect={handleMsSelect}
            handlePartRemove={handlePartRemove}
            handleClearAllParts={handleClearAllParts}
            onSelectedPartDisplayHover={(part) => handlePartHover(part, 'selectedParts')}
            onSelectedPartDisplayLeave={() => handlePartHover(null, null)}
          />
        </div>
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
            onPreviewSelect={handlePartPreviewSelect} // 追加
            hoveredPart={hoveredPart} // 追加
          />
        </div>
      </div>
    </div>
  );
}

export default App;