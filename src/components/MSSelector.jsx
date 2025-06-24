import React, { useState, useEffect } from 'react';

const COSTS = [750, 700, 650, 600, 550, 500, 450];
const TYPES = ['強襲', '汎用', '支援'];

const TYPE_ORDER = {
  '強襲': 0,
  '汎用': 1,
  '支援': 2,
};

const MSSelector = ({
  msData,
  onSelect,
  selectedMs,
}) => {
  const [filterType, setFilterType] = useState('');
  const [filterCost, setFilterCost] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filteredMs, setFilteredMs] = useState([]);

  useEffect(() => {
    if (!msData || !Array.isArray(msData)) {
      setFilteredMs([]);
      return;
    }

    let results = msData.filter((ms) => {
      const msType = String(ms.属性).trim();
      const typeFilter = filterType.trim();
      const matchesType = !filterType || msType === typeFilter;
      const matchesCost = !filterCost || String(ms.コスト) === String(filterCost);
      // ★名前検索（部分一致・大文字小文字区別なし）
      const matchesSearch = !searchText || (ms["MS名"] && ms["MS名"].toLowerCase().includes(searchText.toLowerCase()));
      return matchesType && matchesCost && matchesSearch;
    });

    // 重複排除
    const seen = new Set();
    results = results.filter(ms => {
      const key = `${ms["MS名"]}_${ms.コスト}_${ms.属性}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // ソート
    results.sort((a, b) => {
      if (b.コスト !== a.コスト) {
        return b.コスト - a.コスト;
      }
      const aType = TYPE_ORDER[String(a.属性).trim()] ?? 99;
      const bType = TYPE_ORDER[String(b.属性).trim()] ?? 99;
      if (aType !== bType) {
        return aType - bType;
      }
      const nameA = a["MS名"] ?? '';
      const nameB = b["MS名"] ?? '';
      return nameA.localeCompare(nameB, 'ja');
    });

    setFilteredMs(results);
  }, [filterType, filterCost, searchText, msData]);

  const getTypeColor = (type) => {
    switch (type) {
      case '強襲':
        return 'bg-red-500 text-gray-400';
      case '汎用':
        return 'bg-blue-500 text-gray-400';
      case '支援':
      case '支援攻撃':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-700 text-gray-400';
    }
  };

  const handleMsSelect = (ms) => {
    onSelect(ms);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start">
      <div className="w-full bg-gray-700 bg-opacity-90 rounded-2xl shadow-2xl flex flex-col gap-6">
        {/* フィルター */}
        <div className="flex w-full items-center gap-3">
  {/* 左詰め：タイプ＋コスト */}
  <div className="flex flex-wrap gap-1">
    <button
      onClick={() => setFilterType('')}
      className={`px-3 py-1 text-sm font-bold transition ${
        filterType === ''
          ? 'bg-blue-500 text-gray-400 shadow'
          : 'bg-gray-700 text-gray-200 hover:bg-blue-600'
      }`}
      style={{ borderRadius: 0 }}
    >
      すべて
    </button>
    {TYPES.map((type) => (
      <button
        key={type}
        onClick={() => setFilterType(type.trim())}
        className={`px-3 py-1 text-sm font-bold transition ${
          filterType === type
            ? 'bg-blue-500 text-gray-400 shadow'
            : 'bg-gray-700 text-gray-200 hover:bg-blue-600'
        }`}
        style={{ borderRadius: 0 }}
      >
        {type}
      </button>
    ))}
    <button
      onClick={() => setFilterCost('')}
      className={`px-3 py-1 text-sm font-bold transition ${
        filterCost === ''
          ? 'bg-green-500 text-gray-400 shadow'
          : 'bg-gray-700 text-gray-200 hover:bg-green-600'
      }`}
      style={{ borderRadius: 0 }}
    >
      コスト:すべて
    </button>
    {COSTS.map((cost) => (
      <button
        key={cost}
        onClick={() => setFilterCost(String(cost))}
        className={`px-3 py-1 text-sm font-bold transition ${
          filterCost === String(cost)
            ? 'bg-green-500 text-gray-400 shadow'
            : 'bg-gray-700 text-gray-200 hover:bg-green-600'
        }`}
        style={{ borderRadius: 0 }}
      >
        {cost}
      </button>
    ))}
  </div>
  {/* 右詰め：検索窓 */}
  <div className="ml-auto">
    <input
      type="text"
      value={searchText}
      onChange={e => setSearchText(e.target.value)}
      placeholder="MS名で検索"
      className="px-2 py-1 text-sm rounded bg-gray-900 text-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      style={{ minWidth: 120, maxWidth: 200 }}
    />
  </div>
</div>
        {/* MSリスト */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar w-full">
            {filteredMs.length > 0 ? (
              filteredMs.map((ms) => {
                const isSelected = selectedMs && selectedMs["MS名"] === ms["MS名"];
                const baseName = ms["MS名"]
                  .replace(/_LV\d+$/, '')
                  .trim();

                return (
                  <div
                    key={`${ms["MS名"]}_${ms.コスト}_${ms.属性}`}
                    className="cursor-pointer p-2 rounded flex items-center gap-3 transition-all hover:bg-gray-700 hover:shadow"
                    onClick={() => handleMsSelect(ms)}
                    style={{ minHeight: 56 }}
                  >
                    <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0 border border-gray-700 group-hover:border-blue-400 transition">
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
                      <div className="flex items-center gap-1 mb-0.5">
                        <span
                          className={`px-2 py-0.5 text-xs font-bold ${getTypeColor(ms.属性)} flex-shrink-0`}
                          style={{ borderRadius: 0 }}
                        >
                          {ms.属性}
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          コスト: {ms.コスト}
                        </span>
                      </div>
                      <span className="block font-semibold truncate text-gray-400 text-base">{ms["MS名"]}</span>
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
    </div>
  );
};

export default MSSelector;