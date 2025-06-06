// src/components/PartSelectionSection.jsx
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
  filterCategory,
  setFilterCategory,
  categories,
  allCategoryName,
}) => {
  if (!selectedMs) {
    return null;
  }

  return (
    // App.js からの flex-grow を受け取る (flex-grow) が、
    // 自身は内部要素 (カテゴリボタンとPartList) を縦に並べる (flex-col)。
    // padding-4 (p-4) も適用。
    <div className="w-full bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700 col-span-5 flex flex-col flex-grow">
      
      {/* カテゴリボタンのみのセクション。flex-shrink-0 でこの要素の高さは固定 */}
      <div className="flex flex-wrap items-center justify-start gap-2 mb-3 flex-shrink-0">
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
      </div>
      
      {/* ★ PartList を囲む div: flex-grow, overflow-y-auto, h-full を削除。 */}
      {/*    PartList 自体がスクロールと高さを制御するため、ここでは特にスタイルは指定しない。 */}
      {/*    これにより、PartList は自身に設定された 500px の高さで表示される。 */}
      <div> 
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
    </div>
  );
};

export default PartSelectionSection;