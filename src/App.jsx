// src/App.js
import React from 'react';
import MSSelector from './components/MSSelector';
// import PartList from './components/PartList'; // PartSelectionSection内でインポートされるため、ここからは削除
import StatusDisplay from './components/StatusDisplay';
import SlotSelector from './components/SlotSelector';
import SelectedPartDisplay from './components/SelectedPartDisplay';
import MsInfoDisplay from './components/MsInfoDisplay';
import PartSelectionSection from './components/PartSelectionSection'; // ★新規コンポーネントをインポート
import { useAppData } from './hooks/useAppData';

function App() {
  const {
    msData,
    partData,
    selectedMs,
    selectedParts,
    hoveredPart,
    filterCategory,
    isFullStrengthened,
    expansionType,
    categories,
    allCategoryName,
    expansionOptions,
    expansionDescriptions,
    currentStats,
    slotUsage,
    usageWithPreview,
    setHoveredPart,
    setFilterCategory,
    setIsFullStrengthened,
    setExpansionType,
    handleMsSelect,
    handlePartRemove,
    handlePartSelect,
    handleClearAllParts,
  } = useAppData();

  if (msData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center justify-center">
        <p className="text-xl">データを読み込み中...</p>
      </div>
    );
  }

  const baseName = selectedMs
    ? selectedMs["MS名"]
        .replace(/_LV\d+$/, '') // 末尾の"_LV数字" を削除
        .trim() // 余分な空白を削除
    : 'default';

  console.log("App: MS Name from JSON:", selectedMs ? selectedMs["MS名"] : "No MS Selected");
  console.log("App: Generated baseName for image:", baseName);

  const getTypeColor = (type) => {
    switch (type) {
      case '強襲':
        return 'bg-red-500 text-white';
      case '汎用':
      case '汎用（変形）':
        return 'bg-blue-500 text-white';
      case '支援':
      case '支援攻撃':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center gap-6">
      <h1 className="text-4xl font-bold tracking-wide text-white drop-shadow-lg">bo2-cstm</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full max-w-screen-xl items-stretch">
        <div className="space-y-4 md:col-span-3 flex flex-col">
          <MSSelector
            msData={msData}
            onSelect={handleMsSelect}
            selectedMs={selectedMs}
          />

          {selectedMs && (
            <>
              <MsInfoDisplay
                selectedMs={selectedMs}
                baseName={baseName}
                isFullStrengthened={isFullStrengthened}
                setIsFullStrengthened={setIsFullStrengthened}
                expansionType={expansionType}
                setExpansionType={setExpansionType}
                expansionOptions={expansionOptions}
                expansionDescriptions={expansionDescriptions}
                getTypeColor={getTypeColor}
              />

              <div className="bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700">
                <SlotSelector
                  usage={usageWithPreview}
                  maxUsage={{
                    close: Number(selectedMs.近スロット ?? 0),
                    mid: Number(selectedMs.中スロット ?? 0),
                    long: Number(selectedMs.遠スロット ?? 0),
                  }}
                  baseUsage={slotUsage}
                />
              </div>

              <div className="bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700 mt-4">
                <SelectedPartDisplay
                  parts={selectedParts}
                  onRemove={handlePartRemove}
                  onClearAllParts={handleClearAllParts}
                />
              </div>
            </>
          )}
        </div>

        <div className="space-y-4 md:col-span-2 flex flex-col">
          {selectedMs && (
            <StatusDisplay
              stats={currentStats}
              selectedMs={selectedMs}
              hoveredPart={hoveredPart}
              isFullStrengthened={isFullStrengthened}
            />
          )}
        </div>

        {/* ★ PartSelectionSection コンポーネントを使用 */}
        <PartSelectionSection
          partData={partData}
          selectedParts={selectedParts}
          onSelectPart={handlePartSelect} // props名を変更して渡す
          onRemovePart={handlePartRemove} // props名を変更して渡す
          onHoverPart={setHoveredPart} // props名を変更して渡す
          selectedMs={selectedMs}
          currentSlotUsage={slotUsage}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          categories={categories}
          allCategoryName={allCategoryName}
          onClearAllParts={handleClearAllParts} // props名を変更して渡す
        />
      </div>
    </div>
  );
}

export default App;