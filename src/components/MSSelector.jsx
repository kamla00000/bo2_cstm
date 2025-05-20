// src/components/MSSelector.jsx
import React, { useState } from 'react';
import SlotSelector from './SlotSelector';
import PartList from './PartList'; // PartListをインポート
// SlotDisplayはMSSelector内では直接使用しないので、ここではインポート不要
// StatusDisplay内でのSlotDisplayの使用は、App.jsxからのPropsで制御されます。

const MSSelector = ({
  msList,
  onSelect,
  onHover,
  selectedMs,
  slotUsage,
  hoveredPart,
  selectedParts,
  // App.jsxから受け取るパーツ関連のPropsを追加
  parts, // filteredPartsが渡される想定
  filterCategory,
  setFilterCategory,
  onPartSelect,
  onPartRemove,
  onPartHover,
  onPartLeave,
  onClearAllParts,
  SlotDisplayComponent // SlotDisplayを直接渡すのではなく、Propsとして受け取る
}) => {
  const [filterType, setFilterType] = useState('すべて');
  const [filterCost, setFilterCost] = useState('すべて');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false); // 初期状態は閉じておく

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

  // セレクターの開閉を切り替える関数
  const toggleSelector = () => {
    setIsSelectorOpen(!isSelectorOpen);
  };

  // MS選択時の処理
  const handleMsSelect = (ms) => {
    onSelect(ms); // App.jsxのhandleMsSelectを呼び出す
    setIsSelectorOpen(false); // MS選択後に閉じる
    // selectedPartsやhoveredPartのリセットはApp.jsxのhandleMsSelectで行われる
  };

  // ホバー時のプレビュー用スロット情報生成
  const getUsageWithPreview = () => {
    // MSが選択されていなければ、使用スロットは0
    if (!selectedMs) return { close: 0, mid: 0, long: 0 };

    // 初期値は App.jsx から渡された slotUsage（現在選択中のパーツのスロット合計）
    const usage = { ...slotUsage };

    // hoveredPart があり、かつまだ選択されていないパーツであれば仮加算
    if (
      hoveredPart &&
      !selectedParts.some(p => p.name === hoveredPart.name)
    ) {
      usage.close += hoveredPart.close || 0;
      usage.mid += hoveredPart.mid || 0;
      usage.long += hoveredPart.long || 0;
    }

    return usage;
  };

  const usageWithPreview = getUsageWithPreview();

  return (
    <div className="space-y-4">
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
                  onClick={() => handleMsSelect(ms)} // handleMsSelect を使用
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
                          className={`px-3 py-1 rounded-full text-sm ${getTypeColor(ms.属性)} flex-shrink-0`}
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
        </div>
      )}

      {/* スロット使用状況 */}
      {selectedMs && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-white">スロット使用状況</h3>
          <SlotSelector
            usage={usageWithPreview}
            maxUsage={{
              close: selectedMs.近スロット ?? 0,
              mid: selectedMs.中スロット ?? 0,
              long: selectedMs.遠スロット ?? 0,
            }}
            baseUsage={slotUsage} // 現在選択中のパーツのスロット数
          />

          {/* ★ ここにカテゴリ別パーツ選択を移動 ★ */}
          <div className="w-full bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-700 mt-6">
            <h2 className="text-xl font-semibold mb-2 text-white">カテゴリ別パーツ選択</h2>
            <div className="flex flex-wrap gap-2 mb-2">
              {['すべて', '攻撃', '防御'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterCategory === cat
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-600 text-gray-100 hover:bg-blue-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex justify-end mb-4">
              <button
                onClick={onClearAllParts}
                className="text-sm text-red-400 hover:underline"
              >
                🗑 全パーツ解除
              </button>
            </div>
            <PartList
              parts={parts} // filteredPartsが渡される想定
              selectedParts={selectedParts}
              onSelect={onPartSelect}
              onRemove={onPartRemove}
              onHover={onPartHover}
              onLeave={onPartLeave}
            />

            {/* 装着中のカスタムパーツ一覧もここに移動 */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">装着中のカスタムパーツ</h2>
              {/* SlotDisplayComponent がApp.jsxから渡されることを想定 */}
              {SlotDisplayComponent && (
                <SlotDisplayComponent parts={selectedParts} onRemove={onPartRemove} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MSSelector;