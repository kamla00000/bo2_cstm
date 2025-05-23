import React, { useState, useEffect } from 'react';

const MSSelector = ({
  msData,
  onSelect,
  selectedMs,
}) => {
  const [filterType, setFilterType] = useState('すべて');
  const [filterCost, setFilterCost] = useState('すべて');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
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
        filterCost === 'すべて' ||
        (filterCost === '750' && costValue === 750) ||
        (filterCost === '700' && costValue === 700) ||
        (filterCost === '650' && costValue === 650) ||
        (filterCost === '600' && costValue === 600);
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

  const toggleSelector = () => {
    setIsSelectorOpen(!isSelectorOpen);
  };

  const handleMsSelect = (ms) => {
    console.log("MSSelector: MS selected (passing to App):", ms);
    onSelect(ms);
    setIsSelectorOpen(false);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-inner space-y-4">
      {!isSelectorOpen && (
        <div
          className="cursor-pointer p-3 rounded bg-gray-900 border border-gray-700"
          onClick={toggleSelector}
        >
          <h2 className="text-xl font-semibold text-white">モビルスーツを選択</h2>
        </div>
      )}

      {isSelectorOpen && (
        <div className="space-y-2">
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

          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {filteredMs.length > 0 ? (
              filteredMs.map((ms) => {
                const isSelected = selectedMs && selectedMs["MS名"] === ms["MS名"];
                // ★全角括弧の変換処理を削除
                const baseName = ms["MS名"]
                  .replace(/_LV\d+$/, '')    // 末尾の"_LV数字" を削除
                  .trim(); // 余分な空白を削除

                console.log(`MSSelector: List item "${ms["MS名"]}" -> Generated baseName: "${baseName}"`);

                return (
                  <div
                    key={ms["MS名"]}
                    className={`cursor-pointer p-3 rounded transition-colors ${
                      isSelected ? 'bg-blue-800' : 'hover:bg-gray-700'
                    }`}
                    onClick={() => handleMsSelect(ms)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={`/images/ms/${baseName}.jpg`}
                          alt={ms["MS名"]}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`MSSelector: Image load error for list item: /images/ms/${baseName}.jpg`);
                            e.target.src = '/images/ms/default.jpg';
                            e.target.onerror = null;
                          }}
                        />
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${getTypeColor(ms.属性)} flex-shrink-0`}
                          >
                            {ms.属性}
                          </span>
                          <span className="text-sm text-gray-400 whitespace-nowrap">
                            コスト: {ms.コスト}
                          </span>
                        </div>
                        <span className="block font-medium truncate text-white">{ms["MS名"]}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400">該当するMSが見つかりません。</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MSSelector;