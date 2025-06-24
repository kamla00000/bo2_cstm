import React from 'react';
import PartList from './PartList';

const PartSelectionSection = ({
  partData,
  selectedParts,
  onSelectPart,
  onRemovePart,
  onHoverPart,
  selectedMs,
  currentSlotUsage,
  usageWithPreview,
  filterCategory,
  setFilterCategory,
  categories,
  allCategoryName,
  onPreviewSelect,
  hoveredPart,
}) => {
  // カテゴリボタンの表示
  return (
    <div className="bg-gray-800 rounded-xl p-4 mt-4 shadow-inner border border-gray-700">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${filterCategory === allCategoryName ? 'bg-blue-600 text-gray-400' : 'bg-gray-600 text-gray-200'}`}
          onClick={() => setFilterCategory(allCategoryName)}
        >
          すべて
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            className={`px-3 py-1 rounded ${filterCategory === cat.name ? 'bg-blue-600 text-gray-400' : 'bg-gray-600 text-gray-200'}`}
            onClick={() => setFilterCategory(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <PartList
        parts={partData}
        selectedParts={selectedParts}
        onSelect={onSelectPart}
        onHover={onHoverPart}
        hoveredPart={hoveredPart}
        selectedMs={selectedMs}
        currentSlotUsage={currentSlotUsage}
        onPreviewSelect={onPreviewSelect}
      />
    </div>
  );
};

export default PartSelectionSection;