// src/components/StatusDisplay.jsx
import React from 'react';

const StatusDisplay = ({ stats, selectedMs }) => {
  // 各ステータスの日本語ラベル
  const statusLabels = {
    hp: "HP",
    armor: "耐実弾補正",
    beam: "耐ビーム補正",
    melee: "耐格闘補正",
    shoot: "射撃補正",
    格闘補正: "格闘補正",
    speed: "スピード",
    スラスター: "スラスター",
    旋回_地上_通常時: "旋回(地上)",
    旋回_宇宙_通常時: "旋回(宇宙)",
  };

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

  const renderStatRow = (label, base, bonus, total) => {
    // HPから旋回_宇宙_通常時までの項目のみを扱う
    if (['name', '属性', 'コスト', '近スロット', '中スロット', '遠スロット', '格闘判定力', 'カウンター'].includes(label)) {
      return null;
    }

    return (
      <div key={label} className="flex justify-between items-center py-1 border-b border-gray-700 last:border-b-0">
        <span className="text-gray-300 text-sm">{statusLabels[label] || label}</span>
        <div className="flex items-center text-sm">
          <span className="w-12 text-right">{base}</span>
          <span className={`w-12 text-right font-bold ${
            bonus > 0 ? 'text-green-400' : (bonus < 0 ? 'text-red-400' : 'text-gray-400')
          }`}>
            {bonus > 0 ? `+${bonus}` : bonus}
          </span>
          <span className="w-12 text-right text-white font-semibold">{total}</span>
        </div>
      </div>
    );
  };

  // MSが選択されていない場合は何も表示しない
  if (!selectedMs) {
    return <p className="text-gray-400">モビルスーツを選択してください。</p>;
  }

  const baseName = selectedMs["MS名"].split('(')[0].trim();

  return (
    <div className="space-y-6">
      {/* MS基本情報 */}
      <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-xl shadow-inner border border-gray-700">
        {/* 画像 */}
        <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={`/images/ms/${baseName}.jpg`}
            alt={selectedMs["MS名"]}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/images/ms/default.jpg';
            }}
          />
        </div>
        {/* 名前 + 属性 + コスト */}
        <div className="flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-3 py-1 rounded-full text-sm ${getTypeColor(selectedMs.属性)} flex-shrink-0`}
            >
              {selectedMs.属性}
            </span>
            <span className="text-sm text-gray-400 whitespace-nowrap">
              コスト: {selectedMs.コスト}
            </span>
          </div>
          <span className="text-2xl font-bold text-white leading-tight">{selectedMs["MS名"]}</span>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">ステータス一覧</h2>

      {/* 通常ステータス表 */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-inner">
        {Object.keys(stats.base).map(key => renderStatRow(key, stats.base[key], stats.bonus[key], stats.total[key]))}

        {/* 格闘判定力、カウンター、スロット情報を画像のように並べる */}
        {/* より画像に近づけるために、個別のボックスとしてflexで横並びにする */}
        <div className="flex justify-around items-stretch py-2 mt-4 border-t border-gray-700 pt-4">
            {/* 格闘判定力 */}
            <div className="flex flex-col items-center justify-center p-2 rounded-md bg-gray-700 mx-1 flex-1 min-w-[70px]">
                <span className="text-xs text-gray-400 whitespace-nowrap">格闘判定力</span>
                <span className="text-base font-bold text-white mt-1">{selectedMs["格闘判定力"] || "N/A"}</span>
            </div>
            {/* カウンター */}
            <div className="flex flex-col items-center justify-center p-2 rounded-md bg-gray-700 mx-1 flex-1 min-w-[70px]">
                <span className="text-xs text-gray-400 whitespace-nowrap">カウンター</span>
                <span className="text-base font-bold text-white mt-1">{selectedMs["カウンター"] || "N/A"}</span>
            </div>
            {/* 近スロット */}
            <div className="flex flex-col items-center justify-center p-2 rounded-md bg-gray-700 mx-1 flex-1 min-w-[70px]">
                <span className="text-xs text-gray-400 whitespace-nowrap">近スロット</span>
                <span className="text-base font-bold text-blue-400 mt-1">{selectedMs["近スロット"] ?? 0}</span>
            </div>
            {/* 中スロット */}
            <div className="flex flex-col items-center justify-center p-2 rounded-md bg-gray-700 mx-1 flex-1 min-w-[70px]">
                <span className="text-xs text-gray-400 whitespace-nowrap">中スロット</span>
                <span className="text-base font-bold text-blue-400 mt-1">{selectedMs["中スロット"] ?? 0}</span>
            </div>
            {/* 遠スロット */}
            <div className="flex flex-col items-center justify-center p-2 rounded-md bg-gray-700 mx-1 flex-1 min-w-[70px]">
                <span className="text-xs text-gray-400 whitespace-nowrap">遠スロット</span>
                <span className="text-base font-bold text-blue-400 mt-1">{selectedMs["遠スロット"] ?? 0}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;