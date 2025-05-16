// src/components/StatusDisplay.jsx
import React from 'react';

const StatusDisplay = ({ stats }) => {
  if (!stats || !stats.base) {
    return <p>データがありません</p>;
  }

  const { base } = stats;

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

  // 補正不要なキー
  const noBonusKeys = ['格闘判定力', 'カウンター', 'close', 'mid', 'long'];

  return (
    <div className="space-y-6">
      {/* 機体名 + 属性 + コスト */}
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-700 pb-3 mb-4">
        {/* 属性ラベル */}
        <span className={`px-3 py-1 rounded-full text-sm ${getTypeColor(base.属性)}`}>
          {base.属性}
        </span>

        {/* コスト表示 */}
        <span className="text-lg font-semibold text-gray-300">
          コスト: {base.コスト}
        </span>

        {/* 機体名 */}
        <h2 className="text-2xl font-bold text-blue-400">{base.name}</h2>
      </div>

      {/* ステータス一覧 */}
      <div className="space-y-2">
        {[
          'HP',
          '耐実弾補正',
          '耐ビーム補正',
          '耐格闘補正',
          '射撃補正',
          '格闘補正',
          'スピード',
          '高速移動',
          'スラスター',
          '旋回_地上_通常時',
          '旋回_宇宙_通常時',
        ].map((key) => (
          <div
            key={key}
            className="grid grid-cols-12 gap-4 bg-gray-800 p-3 rounded-lg shadow-md"
          >
            <span className="col-span-4 font-medium text-sm whitespace-nowrap">
              {key}
            </span>
            <span className="col-span-3 text-right text-sm">{base[key]}</span>
            <span className="col-span-2 text-right text-green-400 text-sm">
              +{stats.bonus?.[key] ?? 0}
            </span>
            <span className="col-span-3 text-right font-semibold text-sm">
              {stats.total?.[key] ?? base[key]}
            </span>
          </div>
        ))}
      </div>

      {/* 補正なし項目：横並びで表示 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {[
          { key: '格闘判定力', label: '格闘判定力' },
          { key: 'カウンター', label: 'カウンター' },
          { key: 'close', label: '近スロット' },
          { key: 'mid', label: '中スロット' },
          { key: 'long', label: '遠スロット' },
        ].map(({ key, label }) => (
          <div
            key={key}
            className="bg-gray-800 p-3 rounded-lg shadow-md"
          >
            <span className="block text-xs text-gray-400 whitespace-nowrap">
              {label}
            </span>
            <span className="text-right font-semibold block text-sm whitespace-nowrap">
              {base[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusDisplay;