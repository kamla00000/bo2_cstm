// src/components/PartList.jsx
import React, { useState } from 'react';

// 画像パスを生成する関数をコンポーネントの外に定義
// これにより、各 img タグのエラーハンドリングロジックが独立して動作する
const getBaseImagePath = (partName) => `/images/parts/${encodeURIComponent(partName)}`;
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'bmp']; // 試す拡張子の優先順位

const PartList = ({ selectedParts, onSelect, parts, onHover, selectedMs, currentSlotUsage }) => {
  if (!parts || !Array.isArray(parts)) {
    return <p className="text-gray-400">パーツデータがありません。</p>;
  }

  const [hoveredPartName, setHoveredPartName] = useState(null);

  const renderStat = (label, value, isSlot = false) => {
    if (value === 0 || value === undefined || value === null) {
      return null;
    }
    const displayValue = value > 0 ? `+${value}` : value;
    const textColor = isSlot ? 'text-blue-400' : (value > 0 ? 'text-green-400' : 'text-red-400');

    let displayLabel = label;
    if (!isSlot) {
      if (label === '耐実弾' || label === '耐ビーム' || label === '耐格闘') {
        displayLabel = label;
      } else {
        displayLabel = label.replace('補正', '').replace('力', '').replace('修正','');
      }
    }

    return (
      <span className={`text-xs ${textColor} whitespace-nowrap`}>
        {displayLabel}: {displayValue}
      </span>
    );
  };

  const willCauseSlotOverflow = (part) => {
    if (!selectedMs || !currentSlotUsage) {
      return false;
    }

    const maxClose = currentSlotUsage.maxClose || 0;
    const maxMid = currentSlotUsage.maxMid || 0;
    const maxLong = currentSlotUsage.maxLong || 0;

    const currentClose = currentSlotUsage.close || 0;
    const currentMid = currentSlotUsage.mid || 0;
    const currentLong = currentSlotUsage.long || 0;

    const partClose = Number(part.close || 0);
    const partMid = Number(part.mid || 0);
    const partLong = Number(part.long || 0);

    const overflow = (
      (currentClose + partClose > maxClose) ||
      (currentMid + partMid > maxMid) ||
      (currentLong + partLong > maxLong)
    );
    return overflow;
  };

  return (
    <div className="overflow-y-auto pr-2 custom-scrollbar h-[500px]">
      {parts.length === 0 ? (
        <p className="text-gray-400 text-center py-4">選択されたカテゴリのパーツはありません。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {parts.map((part, index) => {
            const isSelected = selectedParts.some(p => p.name === part.name);
            const isPartHovered = hoveredPartName === part.name;

            const isOverflowing = (selectedMs && currentSlotUsage) ? willCauseSlotOverflow(part) : false;
            const isPartLimitReached = selectedParts.length >= 8;
            const isGrayedOut = (isOverflowing || isPartLimitReached) && !isSelected;

            return (
              <button
                key={`${part.name}-${index}`}
                onClick={() => {
                  if (!isGrayedOut || isSelected) {
                      onSelect(part);
                  }
                }}
                onMouseEnter={() => {
                  setHoveredPartName(part.name);
                  onHover?.(part);
                }}
                onMouseLeave={() => {
                  setHoveredPartName(null);
                  onHover?.(null);
                }}
                className={`relative w-full text-left flex items-center p-2 rounded-xl border transition-all duration-200 shadow-sm
                  ${isSelected
                    ? 'bg-green-700 text-white border-green-400 cursor-pointer'
                    : isGrayedOut
                      ? 'bg-gray-900 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'
                      : 'bg-gray-800 text-gray-100 border-gray-600 hover:border-blue-400 cursor-pointer'
                  }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400 rounded-l-xl"></div>
                )}

                <div className="mr-2 w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  {/* ImageWithFallback コンポーネントを使用 */}
                  <ImageWithFallback partName={part.name} />
                </div>

                <div className="flex flex-col flex-grow min-w-0">
                  <div className="font-semibold text-sm flex items-center gap-1 leading-tight">
                    {isSelected && <span className="text-green-300">✔</span>}
                    <span className="break-words">{part.name}</span>
                  </div>

                  {part.description && (
                    <p className={`text-xs text-gray-300 mt-0.5 leading-tight whitespace-normal break-words ${isPartHovered ? '' : 'line-clamp-2'}`}>
                      {part.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-400 mt-1">
                    {renderStat('HP', part.hp)}
                    {renderStat('耐実弾', part.armor_range)}
                    {renderStat('耐ビーム', part.armor_beam)}
                    {renderStat('耐格闘', part.armor_melee)}
                    {renderStat('射撃', part.shoot)}
                    {renderStat('格闘', part.melee)}
                    {renderStat('速度', part.speed)}
                    {renderStat('高速移動', part.highSpeedMovement)}
                    {renderStat('スラ', part.thruster)}
                    {renderStat('旋回(地)', part.turnPerformanceGround)}
                    {renderStat('旋回(宇)', part.turnPerformanceSpace)}
                    {renderStat('近ス', part.close, true)}
                    {renderStat('中ス', part.mid, true)}
                    {renderStat('遠ス', part.long, true)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PartList;


// 新規追加するコンポーネント: ImageWithFallback.jsx (または PartList.jsx 内に直接定義)
// src/components/ImageWithFallback.jsx （推奨: 別ファイルにすると管理しやすい）

// あるいは、PartList.jsx の中で定義する場合は、PartList 関数の外（export default PartList; の前）に書く
const ImageWithFallback = ({ partName }) => {
  const [currentExtIndex, setCurrentExtIndex] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false); // 画像が正常にロードされたかを示すフラグ

  const handleError = () => {
    // 現在の拡張子インデックスを増やす
    const nextExtIndex = currentExtIndex + 1;
    if (nextExtIndex < IMAGE_EXTENSIONS.length) {
      // 次の拡張子を試す
      setCurrentExtIndex(nextExtIndex);
    } else {
      // 全ての拡張子を試したがロードできなかった場合
      // default.jpg にフォールバックするため、currentExtIndex をさらに進めるか、
      // 特殊な状態 (例: -1) にして、default.jpg を明示的に表示させる
      setCurrentExtIndex(IMAGE_EXTENSIONS.length); // すべて試したことを示す
    }
  };

  const handleLoad = () => {
    setHasLoaded(true); // 正常にロードされたらフラグを立てる
  };

  // 表示する画像パスを決定
  let src;
  if (currentExtIndex < IMAGE_EXTENSIONS.length) {
    const currentExt = IMAGE_EXTENSIONS[currentExtIndex];
    src = `${getBaseImagePath(partName)}.${currentExt}`;
  } else {
    // 全ての拡張子を試しても見つからなかった場合
    src = '/images/parts/default.jpg';
  }

  // Debugging: 確認用
  // console.log(`[ImageFallback] Part: ${partName}, Trying: ${src}, Index: ${currentExtIndex}`);

  // hasLoadedがtrueの場合は、再レンダリング時にonErrorが発火しないようにする
  // これにより、一度正常に表示された画像が、不要なエラーハンドリングを繰り返すのを防ぐ
  return (
    <img
      src={src}
      alt={partName}
      className="w-full h-full object-cover"
      onError={hasLoaded ? null : handleError} // 既にロード済みの場合はonErrorを無効化
      onLoad={handleLoad} // 正常ロード時にフラグを立てる
    />
  );
};