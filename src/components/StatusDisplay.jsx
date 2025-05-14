// src/components/StatusDisplay.jsx
import React from 'react';

const StatusDisplay = ({ stats }) => {
  if (!stats || !stats.total) {
    return <div className="text-gray-500">MSを選択してください</div>;
  }

  const { base, bonus, total } = stats;

  return (
    <div className="space-y-2">
      {/* MS名のみ表示 */}
      <div className="text-2xl font-bold text-blue-400 mb-4">{total.name}</div>

      {/* ステータス一覧（列ごとに分けて表示） */}
      <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-sm border-t border-gray-700 pt-2">
        {/* カテゴリヘッダー */}
        <div className="font-semibold text-gray-400">項目</div>
        <div className="font-semibold text-gray-400">初期値</div>
        <div className="font-semibold text-gray-400">補正値</div>
        <div className="font-semibold text-gray-400">合計値</div>

        {/* 各ステータス */}
<div>コスト</div>
<div>{base.コスト}</div>
<div className={bonus.コスト !== 0 ? "text-green-400" : ""}>{bonus.コスト}</div>
<div className="font-semibold">{total.コスト}</div>

<div>HP</div>
<div>{base.HP}</div>
<div className={bonus.HP !== 0 ? "text-green-400" : ""}>{bonus.HP}</div>
<div className="font-semibold">{total.HP}</div>

        <div>耐実弾補正</div>
<div>{base.耐実弾補正}</div>
<div className={bonus.耐実弾補正 !== 0 ? "text-green-400" : ""}>{bonus.耐実弾補正}</div>
<div className="font-semibold">{total.耐実弾補正}</div>

<div>耐ビーム補正</div>
<div>{base.耐ビーム補正}</div>
<div className={bonus.耐ビーム補正 !== 0 ? "text-green-400" : ""}>{bonus.耐ビーム補正}</div>
<div className="font-semibold">{total.耐ビーム補正}</div>

<div>耐格闘補正</div>
<div>{base.耐格闘補正}</div>
<div className={bonus.耐格闘補正 !== 0 ? "text-green-400" : ""}>{bonus.耐格闘補正}</div>
<div className="font-semibold">{total.耐格闘補正}</div>

<div>射撃補正</div>
<div>{base.射撃補正}</div>
<div className={bonus.射撃補正 !== 0 ? "text-green-400" : ""}>{bonus.射撃補正}</div>
<div className="font-semibold">{total.射撃補正}</div>

        <div>格闘補正</div>
        <div>{base.格闘補正}</div>
        <div className={bonus.格闘補正 !== 0 ? "text-green-400" : ""}>{bonus.格闘補正}</div>
        <div className="font-semibold">{total.格闘補正}</div>

        <div>スピード</div>
        <div>{base.スピード}</div>
        <div className={bonus.スピード !== 0 ? "text-green-400" : ""}>{bonus.スピード}</div>
        <div className="font-semibold">{total.スピード}</div>

        <div>高速移動</div>
        <div>{base.高速移動}</div>
        <div className={bonus.高速移動 !== 0 ? "text-green-400" : ""}>{bonus.高速移動}</div>
        <div className="font-semibold">{total.高速移動}</div>

        <div>スラスター</div>
        <div>{base.スラスター}</div>
        <div className={bonus.スラスター !== 0 ? "text-green-400" : ""}>{bonus.スラスター}</div>
        <div className="font-semibold">{total.スラスター}</div>

        <div>旋回(地上)</div>
        <div>{base.旋回_地上_通常時}</div>
        <div className={bonus.旋回_地上_通常時 !== 0 ? "text-green-400" : ""}>{bonus.旋回_地上_通常時}</div>
        <div className="font-semibold">{total.旋回_地上_通常時}</div>

        <div>旋回(宇宙)</div>
        <div>{base.旋回_宇宙_通常時}</div>
        <div className={bonus.旋回_宇宙_通常時 !== 0 ? "text-green-400" : ""}>{bonus.旋回_宇宙_通常時}</div>
        <div className="font-semibold">{total.旋回_宇宙_通常時}</div>

        <div>格闘判定力</div>
        <div>{base.格闘判定力}</div>
        <div className={bonus.格闘判定力 !== 0 ? "text-green-400" : ""}>{bonus.格闘判定力}</div>
        <div className="font-semibold">{total.格闘判定力}</div>

        <div>カウンター</div>
        <div>{base.カウンター}</div>
        <div className={bonus.カウンター !== 0 ? "text-green-400" : ""}>{bonus.カウンター}</div>
        <div className="font-semibold">{total.カウンター}</div>

        <div>近スロット</div>
        <div>{base.close}</div>
        <div className={bonus.close !== 0 ? "text-green-400" : ""}>{bonus.close}</div>
        <div className="font-semibold">{total.close}</div>

        <div>中スロット</div>
        <div>{base.mid}</div>
        <div className={bonus.mid !== 0 ? "text-green-400" : ""}>{bonus.mid}</div>
        <div className="font-semibold">{total.mid}</div>

        <div>遠スロット</div>
        <div>{base.long}</div>
        <div className={bonus.long !== 0 ? "text-green-400" : ""}>{bonus.long}</div>
        <div className="font-semibold">{total.long}</div>
      </div>
    </div>
  );
};

export default StatusDisplay;