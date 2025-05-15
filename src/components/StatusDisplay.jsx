// src/components/StatusDisplay.jsx
import React from 'react';

const StatusDisplay = ({ stats }) => {
  // stats が undefined のときは空オブジェクトで代替
  const { base, bonus, total } = stats || {
    base: {},
    bonus: {},
    total: {}
  };

  // 表示するステータス一覧（順番も制御）
  const statusLabels = [
    { key: "HP", label: "HP" },
    { key: "耐実弾補正", label: "耐実弾補正" },
    { key: "耐ビーム補正", label: "耐ビーム補正" },
    { key: "耐格闘補正", label: "耐格闘補正" },
    { key: "射撃補正", label: "射撃補正" },
    { key: "格闘補正", label: "格闘補正" },
    { key: "スピード", label: "スピード" },
    { key: "高速移動", label: "高速移動" },
    { key: "スラスター", label: "スラスター" },
    { key: "旋回_地上_通常時", label: "旋回(地上)" },
    { key: "旋回_宇宙_通常時", label: "旋回(宇宙)" },
  ];

  return (
    <div className="space-y-2">
      {/* MS名表示 */}
      <div className="text-2xl font-bold text-blue-400 mb-4">{total?.name}</div>

      {/* ステータス一覧 */}
      <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-sm border-t border-gray-700 pt-2">
        {/* ヘッダー */}
        <div className="font-semibold text-gray-400">項目</div>
        <div className="font-semibold text-gray-400">初期値</div>
        <div className="font-semibold text-gray-400">補正値</div>
        <div className="font-semibold text-gray-400">合計値</div>

        {/* 各ステータス項目 */}
        {statusLabels.map(({ key, label }) => (
          <React.Fragment key={key}>
            <div>{label}</div>
            <div>{base?.[key] ?? '-'}</div>
            <div className={bonus?.[key] !== 0 ? 'text-green-400' : ''}>
              {bonus?.[key] !== null && bonus?.[key] !== undefined ? bonus[key] : '-'}
            </div>
            <div className="font-semibold">{total?.[key] ?? '-'}</div>
          </React.Fragment>
        ))}

        {/* 補正不要な項目（格闘判定力 / カウンター）*/}
        <div>格闘判定力</div>
        <div className="col-span-3 font-semibold">{base?.格闘判定力 ?? '-'}</div>

        <div>カウンター</div>
        <div className="col-span-3 font-semibold">{base?.カウンター ?? '-'}</div>

        {/* スロット関連項目 */}
        <div>近スロット</div>
        <div className="col-span-3 font-semibold">
          {base?.close ?? '-'}{/* 初期値のみ */}
        </div>

        <div>中スロット</div>
        <div className="col-span-3 font-semibold">
          {base?.mid ?? '-'}{/* 初期値のみ */}
        </div>

        <div>遠スロット</div>
        <div className="col-span-3 font-semibold">
          {base?.long ?? '-'}{/* 初期値のみ */}
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;