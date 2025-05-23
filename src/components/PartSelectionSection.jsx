// src/components/PartSelectionSection.jsx
import React from 'react';
import PartList from './PartList'; // PartListもこのファイルからインポート

const PartSelectionSection = ({
  partData,
  selectedParts,
  onSelectPart, // handlePartSelectをprops名変更
  onRemovePart, // handlePartRemoveをprops名変更
  onHoverPart, // setHoveredPartをprops名変更
  selectedMs,
  currentSlotUsage,
  filterCategory,
  setFilterCategory,
  categories,
  allCategoryName,
  onClearAllParts // handleClearAllPartsをprops名変更
}) => {
  if (!selectedMs) {
    return null; // MSが選択されていない場合は表示しない
  }

  return (
    <div className="w-full bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700 col-span-5">
      <h2 className="text-xl font-semibold mb-3 text-white">カテゴリ別パーツ選択</h2>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap gap-2">
          {[{ name: allCategoryName, fileName: '' }, ...categories].map(cat => (
            <button
              key={cat.name}
              onClick={() => setFilterCategory(cat.name)}
              className={`px-3 py-1 rounded-full text-sm ${
                filterCategory === cat.name
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-600 text-gray-100 hover:bg-blue-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <button
          onClick={onClearAllParts}
          className="text-sm text-red-400 hover:underline flex-shrink-0"
        >
          🗑 全パーツ解除
        </button>
      </div>
      <PartList
        parts={partData}
        selectedParts={selectedParts}
        onSelect={onSelectPart}
        onRemove={onRemovePart}
        onHover={onHoverPart}
        selectedMs={selectedMs}
        currentSlotUsage={currentSlotUsage}
      />
    </div>
  );
};

export default PartSelectionSection;