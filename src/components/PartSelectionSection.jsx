import React from 'react';
import PartList from './PartList';
import styles from './PartSelectionSection.module.css';

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
    <div className={styles.partselectCardShape}>
      <div className={styles.categoryBtnRow}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.hexBtnOrangeBorder} ${styles.hexBtn} ${styles.categoryBtn} ${filterCategory === cat ? styles.selected : ''}`}
            onClick={() => setFilterCategory(cat)}
            style={{ minWidth: 56 }}
          >
            <span className={styles.hexLabel}>{cat}</span>
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