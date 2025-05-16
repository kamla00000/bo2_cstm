// src/components/MSSelector.jsx
import React, { useState } from 'react';

const typeColors = {
  '強襲': 'text-red-400',
  '汎用': 'text-blue-400',
  '支援': 'text-yellow-400',
};

const MSSelector = ({ msList, onSelect, onHover, selectedMs }) => {
  const [selectedType, setSelectedType] = useState('すべて');
  const [selectedCost, setSelectedCost] = useState('ALL'); // ALL が初期値

  // コストの一覧を取得（重複除去 + 降順ソート）
  const costOptions = [...new Set(msList.map(ms => ms.コスト))].sort((a, b) => b - a);
  costOptions.unshift('ALL');

  // フィルタリング処理
  const filteredList = msList.filter(ms => {
    const matchesType = selectedType === 'すべて' || ms.属性 === selectedType;
    const matchesCost = selectedCost === 'ALL' || ms.コスト === selectedCost;

    return matchesType && matchesCost;
  });

  // 表示リストをコスト降順にソート
  const sortedList = [...filteredList].sort((a, b) => b.コスト - a.コスト);

  return (
    <div className="space-y-4">
      {/* 属性タブ */}
      <div className="flex gap-2">
        {['すべて', '強襲', '汎用', '支援'].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1 rounded-full text-sm font-semibold border transition-all ${
              selectedType === type ? `${typeColors[type]} border-white bg-gray-700` : 'text-gray-400 border-gray-500'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* コストセレクトボックス */}
      <select
        className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
        value={selectedCost}
        onChange={(e) => setSelectedCost(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
      >
        {costOptions.map(cost => (
          <option key={cost} value={cost}>
            {cost === 'ALL' ? '全コスト範囲' : `COST ${cost}`}
          </option>
        ))}
      </select>

      {/* 該当する機体一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedList.length === 0 ? (
          <p className="text-sm text-gray-400 col-span-full">該当するMSがありません</p>
        ) : (
          sortedList.map((ms, index) => {
            const isSelected = selectedMs && selectedMs["MS名"] === ms["MS名"];
            return (
              <button
                key={index}
                onClick={() => onSelect(ms)}
                onMouseEnter={() => onHover(ms)}
                onMouseLeave={() => onHover(null)}
                className={`relative p-3 rounded-xl shadow border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-green-900'
                    : 'border-gray-600 bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <img
                  src={`https://via.placeholder.com/150x100?text=         ${encodeURIComponent(ms["MS名"])}`}
                  alt={`${ms["MS名"]} icon`}
                  className="w-full h-auto mb-2 rounded"
                />
                <div className="text-sm font-semibold">{ms["MS名"]}</div>
                {isSelected && (
                  <div className="absolute top-2 right-2 text-blue-400 text-xl">★</div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MSSelector;