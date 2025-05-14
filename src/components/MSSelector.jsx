// src/components/MSSelector.jsx
import React, { useState } from 'react';

const typeColors = {
  '強襲': 'text-red-400',
  '汎用': 'text-blue-400',
  '支援': 'text-yellow-400',
};

const MSSelector = ({ msList, onSelect, onHover, selectedMs }) => {
  const [selectedType, setSelectedType] = useState('強襲');
  const [selectedCost, setSelectedCost] = useState(450);

  // 🔍 ログ①：props.msList が正しく渡されているか確認
  console.log('📥 MSSelector 受け取った msList:', msList);

  // フィルタリング条件：属性 + コスト
  const filteredList = msList.filter(
    ms => ms.属性 === selectedType && ms.コスト === selectedCost
  );

  // 🔍 ログ②：フィルタリング後のリストを確認
  console.log('🔍 MSSelector フィルタリング後:', filteredList);
  console.log('🎯 現在の selectedType:', selectedType);
  console.log('💰 現在の selectedCost:', selectedCost);

  const handleSelect = (ms) => {
    console.log('🎯 MSSelector で選択されたMS:', ms);
    onSelect(ms);
  };

  return (
    <div className="space-y-4">
      {/* 属性タブ */}
      <div className="flex gap-2">
        {['強襲', '汎用', '支援'].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1 rounded-full text-sm font-semibold border transition-all
              ${selectedType === type ? `${typeColors[type]} border-white bg-gray-700` : 'text-gray-400 border-gray-500'}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* コストセレクト */}
      <select
        className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
        value={selectedCost}
        onChange={(e) => setSelectedCost(Number(e.target.value))}
      >
        {Array.from({ length: 14 }, (_, i) => 100 + i * 50).map(cost => (
          <option key={cost} value={cost}>{cost}</option>
        ))}
      </select>

      {/* 該当MS一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredList.length === 0 && (
          <p className="text-sm text-gray-400 col-span-full">該当するMSがありません</p>
        )}
        {filteredList.map((ms, index) => {
          const isSelected = selectedMs && selectedMs["MS名"] === ms["MS名"];
          return (
            <button
              key={index}
              onClick={() => handleSelect(ms)}
              onMouseEnter={() => {
                if (!isSelected) onHover(ms);
              }}
              onMouseLeave={() => {
                onHover(null);
              }}
              className={`relative p-3 rounded-xl shadow border-2 transition-all duration-200
                ${isSelected ? 'border-blue-500 bg-green-700' : 'border-gray-600 bg-gray-800 hover:bg-gray-700'}`}
            >
              <img
                src={`https://via.placeholder.com/150x100?text=      ${encodeURIComponent(ms["MS名"])}`}
                alt={`${ms["MS名"]} icon`}
                className="w-full h-auto mb-2 rounded"
              />
              <div className="text-sm font-semibold">{ms["MS名"]}</div>

              {isSelected && (
                <div className="absolute top-2 right-2 text-blue-400 text-xl">★</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MSSelector;