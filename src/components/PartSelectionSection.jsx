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
  isPartDisabled,
}) => {
  // カテゴリボタンの表示
  return (
    <div className="partselect-card-shape p-4 mt-4">
      <style>{`
        .partselect-card-shape {
          background: rgba(0,0,0,0.5);
          border: none;
          box-shadow: none;
          border-radius: 0;
          clip-path: polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%);
          transition: background 0.18s, box-shadow 0.18s, border-color 0.18s, transform 0.18s;
        }
        .hex-btn-orange-border {
          position: relative;
          background: rgba(0,0,0,0.5);
          clip-path: polygon(12% 0, 88% 0, 100% 50%, 88% 100%, 12% 100%, 0 50%);
          border: none;
          box-shadow: none;
          border-radius: 0;
          z-index: 1;
          overflow: visible;
          transition: background-color 0.18s, color 0.18s;
        }
        .hex-btn-orange-border::before,
        .hex-btn-orange-border::after {
          content: '';
          position: absolute;
          left: 0; right: 0;
          height: 3px;
          background: #fb923c !important;
          z-index: 2;
          border-radius: 2px;
        }
        .hex-btn-orange-border::before {
          top: 0;
        }
        .hex-btn-orange-border::after {
          bottom: 0;
        }
        .hex-btn-orange-border:focus {
          outline: none;
          box-shadow: 0 0 0 2px #fb923c !important;
        }
        .partselect-hex-btn {
          position: relative;
          background: rgba(34,34,40,0.8);
          color: #e5e7eb;
          clip-path: polygon(12% 0, 88% 0, 100% 50%, 88% 100%, 12% 100%, 0 50%);
          border: none;
          box-shadow: none;
          border-radius: 0;
          z-index: 1;
          overflow: visible;
          transition: background 0.18s, color 0.18s;
          cursor: pointer;
          padding-top: 8px;
          padding-bottom: 8px;
        }
        .partselect-hex-btn:hover,
        .partselect-hex-btn:focus {
          background: #b85c00 !important;
          color: #fff !important;
        }
        .partselect-hex-btn--selected {
          background: #b85c00 !important;
          color: #fff !important;
        }
        .partselect-hex-label {
          position: relative;
          z-index: 3;
        }
      `}</style>
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`hex-btn-orange-border partselect-hex-btn px-3 py-1 text-sm font-bold transition-all duration-150 select-none partselect-hex-btn${filterCategory === cat ? ' partselect-hex-btn--selected' : ''}`}
            onClick={() => setFilterCategory(cat)}
            style={{ minWidth: 56 }}
          >
            <span className="partselect-hex-label">{cat}</span>
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
        isPartDisabled={isPartDisabled} 
      />
    </div>
  );
};

export default PartSelectionSection;