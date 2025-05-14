// src/components/PartList.jsx
import React from 'react';

const PartList = ({ selectedParts, onSelect, onRemove, parts, onHover }) => {
  // ステータスキー → 日本語ラベルのマッピング
  const statusLabels = {
    hp: "HP",
    armor: "耐実弾補正",
    beam: "耐ビーム補正",
    melee: "耐格闘補正",
    shoot: "射撃補正",
    格闘補正: "格闘補正",
    スピード: "スピード",
    スラスター: "スラスター"
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {parts.map(part => {
        const isSelected = selectedParts.some(p => p.name === part.name);

        const handleClick = () => {
          if (isSelected) {
            onRemove(part);
          } else {
            onSelect(part);
          }
        };

        // パーツによる補正値を抽出（数値のみ）
        const effectEntries = Object.entries(part).filter(
          ([key, value]) =>
            typeof value === 'number' &&
            !isNaN(value) &&
            !['close', 'mid', 'long'].includes(key)
        );

        return (
          <button
            key={part.name}
            onClick={handleClick}
            onMouseEnter={() => onHover(part)}
            onMouseLeave={() => onHover(null)}
            className={`relative w-full text-left flex px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm ${
              isSelected
                ? 'bg-green-700 text-white border-green-400'
                : 'bg-gray-800 text-gray-100 border-gray-600 hover:bg-gray-700 hover:border-blue-400'
            }`}
          >
            {/* 左側の色バー（装備中だけ表示） */}
            {isSelected && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400 rounded-l-xl"></div>
            )}

            <div className="flex flex-col ml-1">
              <div className="font-semibold text-sm flex items-center gap-1">
                {isSelected && <span className="text-green-300">🔧</span>}
                {part.name}
              </div>

              <div className="text-xs text-gray-300">
                カテゴリ: {part.category}
              </div>

              {/* スロット情報 */}
              <div className="text-xs text-gray-300">
                近:{part.close} / 中:{part.mid} / 遠:{part.long}
              </div>

              {/* 補正情報（例: 射撃補正: +5、耐実弾補正: +3 など） */}
              {effectEntries.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {effectEntries.map(([key, value]) => (
                    <div key={key} className="text-xs text-green-400">
                      {statusLabels[key] || key}: +{value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default PartList;