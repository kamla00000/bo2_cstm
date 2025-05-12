import React from 'react';

const StatusDisplay = ({ stats }) => {
  const statusLabels = {
    cost: "コスト",
    type: "タイプ",
    hp: "HP",
    armor: "耐実弾補正",
    beam: "耐ビーム補正",
    melee: "耐格闘補正",
    shoot: "射撃補正",
    格闘補正: "格闘補正",
    スピード: "スピード",
    スラスター: "スラスター"
  };

  return (
    <ul className="space-y-1 text-sm">
      {Object.entries(stats).map(([key, value]) =>
        key === 'close' || key === 'mid' || key === 'long' ? null : (
          <li key={key} className="flex justify-between">
            <span>{statusLabels[key] || key}</span>
            <span>{value}</span>
          </li>
        )
      )}
    </ul>
  );
};

export default StatusDisplay;