// src/App.jsx

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
    // setHoveredPart, // この行を削除
    handlePartHover, // この行を追加
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

      <div className="flex flex-col flex-grow w-full max-w-screen-xl"> 

        {/* MsSelection コンポーネント */}
        <MsSelection
          msData={msData}
          selectedMs={selectedMs}
          selectedParts={selectedParts}
          hoveredPart={hoveredPart} 
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
          className="flex-shrink-0 mb-6"
          onSelectedPartDisplayHover={(part) => handlePartHover(part, 'selectedParts')} // hoverSourceを指定
          onSelectedPartDisplayLeave={() => handlePartHover(null, null)} // hoverSourceをnullに
        />

        <div className="md:col-span-full flex-grow">
          <PartSelectionSection
            partData={partData}
            selectedParts={selectedParts}
            onSelectPart={handlePartSelect}
            onRemovePart={handlePartRemove}
            onHoverPart={(part) => handlePartHover(part, 'partList')} // hoverSourceを指定
            selectedMs={selectedMs}
            currentSlotUsage={slotUsage}
            usageWithPreview={usageWithPreview}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            categories={CATEGORIES}
            allCategoryName={ALL_CATEGORY_NAME}
          />
        </div>
      </div>
    </div>
  );
}

export default App;