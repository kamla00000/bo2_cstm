// src/components/MSSelector.jsx
import React, { useState, useEffect } from 'react'; // useEffect を追加

const MSSelector = ({
  msData, // msList ではなく msData を受け取るように変更（App.jsxの渡し方に合わせる）
  onSelect,
  selectedMs,
  // MSSelector ではパーツ関連のPropsは直接使用しないため削除
  // slotUsage, hoveredPart, selectedParts, parts, filterCategory, setFilterCategory,
  // onPartSelect, onPartRemove, onPartHover, onPartLeave, onClearAllParts, SlotDisplayComponent
}) => {
  const [filterType, setFilterType] = useState('すべて');
  const [filterCost, setFilterCost] = useState('すべて');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [filteredMs, setFilteredMs] = useState([]); // フィルターされたMSを管理するstateを追加

  // msData またはフィルター条件が変更されたときに filteredMs を更新
  useEffect(() => {
    // msData がundefinedやnullでないことを確認
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
  }, [filterType, filterCost, msData]); // 依存配列に msData を追加

  // 属性ごとのカラー設定
  const getTypeColor = (type) => {
    switch (type) {
      case '強襲':
        return 'bg-red-500 text-white';
      case '汎用':
        return 'bg-blue-500 text-white';
      case '支援':
      case '支援攻撃': // '支援攻撃'のような新しい属性がある場合を考慮
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // セレクターの開閉を切り替える関数
  const toggleSelector = () => {
    setIsSelectorOpen(!isSelectorOpen);
  };

  // MS選択時の処理
  const handleMsSelect = (ms) => {
    onSelect(ms); // App.jsxのhandleMsSelectを呼び出す
    setIsSelectorOpen(false); // MS選択後に閉じる
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-inner space-y-4">
      {/* ヘッダー部分（クリックで展開） */}
      {!isSelectorOpen && (
        <div
          className="cursor-pointer p-3 rounded bg-gray-900 border border-gray-700"
          onClick={toggleSelector}
        >
          <h2 className="text-xl font-semibold text-white">モビルスーツを選択</h2>
        </div>
      )}

      {/* フィルタリングとMSリスト */}
      {isSelectorOpen && (
        <div className="space-y-2">
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
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {filteredMs.length > 0 ? (
              filteredMs.map((ms) => {
                const isSelected = selectedMs && selectedMs["MS名"] === ms["MS名"];
                const baseName = ms["MS名"].split('(')[0].trim();

                return (
                  <div
                    key={ms["MS名"]}
                    className={`cursor-pointer p-3 rounded transition-colors ${
                      isSelected ? 'bg-blue-800' : 'hover:bg-gray-700'
                    }`}
                    onClick={() => handleMsSelect(ms)}
                    // MSSelectorではMSのホバーは不要な場合が多いので削除（App.jsxで管理）
                    // onMouseEnter={() => onHover?.(ms)}
                    // onMouseLeave={() => onHover?.(null)}
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
      {/* MSSelector内からパーツ選択やスロット表示を削除 */}
      {/* これらはApp.jsxで管理し、それぞれのコンポーネントに渡すべき */}
    </div>
  );
};

export default MSSelector;