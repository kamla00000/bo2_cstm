// src/components/MSSelector.jsx
import React, { useState } from 'react';
import SlotSelector from './SlotSelector';

const MSSelector = ({ msList, onSelect, onHover, selectedMs, slotUsage }) => {
  const [filterType, setFilterType] = useState('すべて');
  const [filterCost, setFilterCost] = useState('すべて');

  // 属性ごとのカラー設定
  const getTypeColor = (type) => {
    switch (type) {
      case '強襲':
        return 'bg-red-500 text-white';
      case '汎用':
        return 'bg-blue-500 text-white';
      case '支援':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // フィルタリング処理
  const filteredMS = msList.filter((ms) => {
    const matchesType = filterType === 'すべて' || ms.属性 === filterType;
    const costValue = ms.コスト;
    const matchesCost =
      filterCost === 'すべて' ||
      (filterCost === '750' && costValue === 750) ||
      (filterCost === '700' && costValue === 700) ||
      (filterCost === '650' && costValue === 650) ||
      (filterCost === '600' && costValue === 600);

    return matchesType && matchesCost;
  });

  return (
    <div className="space-y-4">
      {/* 属性フィルタ */}
      <div className="flex flex-wrap gap-2">
        {['すべて', '強襲', '汎用', '支援'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-full text-sm ${
              filterType === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-600 text-gray-100 hover:bg-blue-600'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* コストフィルタ */}
      <div className="flex flex-wrap gap-2">
        {['すべて', '750', '700', '650', '600'].map((cost) => (
          <button
            key={cost}
            onClick={() => setFilterCost(cost)}
            className={`px-3 py-1 rounded-full text-sm ${
              filterCost === cost
                ? 'bg-green-500 text-white'
                : 'bg-gray-600 text-gray-100 hover:bg-green-600'
            }`}
          >
            コスト: {cost}
          </button>
        ))}
      </div>

      {/* 機体一覧 */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {filteredMS.map((ms) => {
          const isSelected = selectedMs && selectedMs["MS名"] === ms["MS名"];
          const baseName = ms["MS名"].split('(')[0].trim();

          return (
            <div
              key={ms["MS名"]}
              className={`cursor-pointer p-3 rounded transition-colors ${
                isSelected ? 'bg-blue-800' : 'hover:bg-gray-700'
              }`}
              onClick={() => onSelect(ms)}
              onMouseEnter={() => onHover?.(ms)}
              onMouseLeave={() => onHover?.(null)}
            >
              <div className="flex items-center gap-3">
                {/* 画像表示 */}
                <div className="w-10 h-10 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={`/images/ms/${baseName}.jpg`}
                    alt={ms["MS名"]}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/ms/default.jpg';
                    }}
                  />
                </div>

                {/* 名前 + 属性 + コスト */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${getTypeColor(ms.属性)}`}
                    >
                      {ms.属性}
                    </span>
                    <span className="text-sm text-gray-400 whitespace-nowrap">
                      コスト: {ms.コスト}
                    </span>
                    <span className="block font-medium truncate">{ms["MS名"]}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* スロット使用状況 */}
      {selectedMs && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-lg font-semibold mb-3">スロット使用状況</h3>
          <SlotSelector
            usage={slotUsage}
            maxUsage={{
              close: selectedMs.近スロット,
              mid: selectedMs.中スロット,
              long: selectedMs.遠スロット,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MSSelector;