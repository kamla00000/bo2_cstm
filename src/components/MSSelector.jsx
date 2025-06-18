import React, { useState, useEffect } from 'react';

// コストフィルターの降順配列（750～100まで100刻み）
const COSTS = ['すべて', 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 100];

const MSSelector = ({
  msData,
  onSelect,
  selectedMs,
}) => {
  const [filterType, setFilterType] = useState('すべて');
  const [filterCost, setFilterCost] = useState('すべて');
  const [filteredMs, setFilteredMs] = useState([]);

  useEffect(() => {
    if (!msData || !Array.isArray(msData)) {
      setFilteredMs([]);
      return;
    }

    const results = msData.filter((ms) => {
      const matchesType = filterType === 'すべて' || ms.属性 === filterType;
      const costValue = ms.コスト;
      const matchesCost =
        filterCost === 'すべて' || Number(filterCost) === costValue;
      return matchesType && matchesCost;
    });
    setFilteredMs(results);
  }, [filterType, filterCost, msData]);

  const getTypeColor = (type) => {
    switch (type) {
      case '強襲':
        return 'bg-red-500 text-white';
      case '汎用':
        return 'bg-blue-500 text-white';
      case '支援':
      case '支援攻撃':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleMsSelect = (ms) => {
    onSelect(ms);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start px-0 py-8">
      <div className="w-full max-w-5xl mx-auto bg-gray-800 bg-opacity-90 rounded-2xl shadow-2xl p-8 flex flex-col gap-8">
        {/* フィルター */}
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <div className="flex flex-wrap gap-2">
            {['すべて', '強襲', '汎用', '支援'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1 rounded-full font-bold transition ${
                  filterType === type
                    ? 'bg-blue-500 text-white shadow'
                    : 'bg-gray-700 text-gray-200 hover:bg-blue-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {COSTS.map((cost) => (
              <button
                key={cost}
                onClick={() => setFilterCost(String(cost))}
                className={`px-4 py-1 rounded-full font-bold transition ${
                  filterCost === String(cost)
                    ? 'bg-green-500 text-white shadow'
                    : 'bg-gray-700 text-gray-200 hover:bg-green-600'
                }`}
              >
                {cost === 'すべて' ? 'コスト:すべて' : `コスト:${cost}`}
              </button>
            ))}
          </div>
        </div>
        {/* MSリスト */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredMs.length > 0 ? (
            filteredMs.map((ms) => {
              const isSelected = selectedMs && selectedMs["MS名"] === ms["MS名"];
              const baseName = ms["MS名"]
                .replace(/_LV\d+$/, '')
                .trim();

              return (
                <div
                  key={ms["MS名"]}
                  className={`cursor-pointer p-4 rounded-lg flex items-center gap-6 transition-all ${
                    isSelected
                      ? 'bg-blue-800 shadow-lg scale-105'
                      : 'hover:bg-gray-700 hover:shadow-md'
                  }`}
                  onClick={() => handleMsSelect(ms)}
                >
                  <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-700 group-hover:border-blue-400 transition">
                    <img
                      src={`/images/ms/${baseName}.jpg`}
                      alt={ms["MS名"]}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/ms/default.jpg';
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(ms.属性)} flex-shrink-0`}
                      >
                        {ms.属性}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        コスト: {ms.コスト}
                      </span>
                    </div>
                    <span className="block font-semibold truncate text-white text-lg">{ms["MS名"]}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 text-center py-8 col-span-2">該当するMSが見つかりません。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MSSelector;