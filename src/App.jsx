// src/App.js
import React from 'react';
import MsSelection from './components/MsSelection';
import PartSelectionSection from './components/PartSelectionSection';
import { useAppData } from './hooks/useAppData';

function App() {
  const {
    msData,
    partData,
    selectedMs,
    selectedParts,
    hoveredPart,
    filterCategory,
    setFilterCategory,
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

  return (
    // ★ ルートのdiv: min-h-screenでビューポート高さを確保し、flex-colで縦に並べる
    //    p-4 (padding) は全体の高さに影響するため、box-sizing: border-box の Tailwind デフォルトでは問題ないが、
    //    厳密に高さを制御するため、このルート div の flex コンテナ内で padding を考慮した flex-grow を子に与える。
    //    ここでは gap を使わず、明示的な mb で間隔を制御する。
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold tracking-wide text-white drop-shadow-lg flex-shrink-0 mb-6">bo2-cstm</h1>

      {/* ★ メインコンテンツエリア: h1 の下の残りの全高さを占める (flex-grow) かつ縦方向のFlexコンテナ */}
      {/* w-full max-w-screen-xl で中央寄せにし、横幅を制限。 */}
      {/* この div が flex-col であれば、内部の flex-grow が機能する。 */}
      <div className="flex flex-col flex-grow w-full max-w-screen-xl"> 

        {/* MsSelection コンポーネント */}
        {/* flex-shrink-0 でこのブロックの高さを固定し、縮まないようにする。 */}
        {/* mb-6 で PartSelectionSection との間に下マージンを設定。 */}
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
          setHoveredPart={setHoveredPart}
          setIsFullStrengthened={setIsFullStrengthened}
          setExpansionType={setExpansionType}
          handleMsSelect={handleMsSelect}
          handlePartRemove={handlePartRemove}
          handleClearAllParts={handleClearAllParts}
          className="flex-shrink-0 mb-6" // MsSelection のルートdivに適用されるよう調整が必要
        />

        {/* ★ 「カテゴリ別パーツ選択」タイトルと「🗑 全パーツ解除」ボタンを完全に削除 */}
        {/* ここには何も追加せず、PartSelectionSection に直接接続する */}

        {/* PartSelectionSection コンポーネントを囲むdiv */}
        {/* flex-grow を適用し、MsSelection の下の残りのスペースをすべて埋めるようにする */}
        <div className="md:col-span-full flex-grow">
          <PartSelectionSection
            partData={partData}
            selectedParts={selectedParts}
            onSelectPart={handlePartSelect}
            onRemovePart={handlePartRemove}
            onHoverPart={setHoveredPart}
            selectedMs={selectedMs}
            currentSlotUsage={slotUsage}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            categories={categories}
            allCategoryName={allCategoryName}
            // onClearAllParts はPartSelectionSectionでは使わない
          />
        </div>
      </div>
    </div>
  );
}

export default App;