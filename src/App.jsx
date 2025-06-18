import React, { useState } from 'react';
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

  const [isMsListOpen, setIsMsListOpen] = useState(false);

  if (!msData || msData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center justify-center">
        <p className="text-xl">データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-800 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-extrabold tracking-wide text-white drop-shadow-lg mb-8">GBO2-CSTM</h1>
      {/* 初期画面：MS選択ボタン */}
      {!selectedMs && !isMsListOpen && (
        <div className="flex flex-col items-center justify-center bg-gray-800 bg-opacity-80 rounded-2xl shadow-2xl px-10 py-12">
          <button
            className="flex flex-col items-center justify-center w-40 h-48 bg-gray-900 rounded-xl shadow-lg hover:bg-gray-700 transition"
            onClick={() => setIsMsListOpen(true)}
          >
            <span className="text-6xl text-blue-400 mb-2">＋</span>
            <span className="text-lg text-white font-bold">MS選択</span>
          </button>
        </div>
      )}

      {/* MS一覧モーダル */}
      {isMsListOpen && !selectedMs && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-h-[80vh] overflow-y-auto relative min-w-[350px]">
            <button
              className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-white"
              onClick={() => setIsMsListOpen(false)}
              aria-label="閉じる"
            >×</button>
            <MsSelection
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
                setIsMsListOpen(false);
              }}
              handlePartRemove={handlePartRemove}
              handleClearAllParts={handleClearAllParts}
              onSelectedPartDisplayHover={(part) => handlePartHover(part, 'selectedParts')}
              onSelectedPartDisplayLeave={() => handlePartHover(null, null)}
            />
          </div>
        </div>
      )}

      {/* MS選択後の画面 */}
      {selectedMs && (
        <div className="flex flex-col max-w-screen-xl w-full items-start">
          <div className="flex-shrink-0 w-full">
            <MsSelection
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
              onPreviewSelect={handlePartPreviewSelect}
              hoveredPart={hoveredPart}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;