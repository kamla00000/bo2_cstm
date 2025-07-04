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
  categories, // ['防御', '攻撃', ... 'すべて'] のstring配列で渡す
  onPreviewSelect,
  hoveredPart,
}) => {
  // カテゴリボタンの表示
  return (
    <div className="bg-gray-800 p-4 mt-4 shadow-inner border border-gray-700">
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1 ${filterCategory === cat ? 'bg-blue-600 text-gray-200' : 'bg-gray-600 text-gray-200'}`}
            onClick={() => setFilterCategory(cat)}
          >
            {cat}
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
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
      />
    </div>
  );
};

export default PartSelectionSection;