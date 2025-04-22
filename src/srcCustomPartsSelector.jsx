import React, { useState } from 'react';

const partsList = [
  '強化フレームLv1',
  '脚部特殊装甲Lv2',
  '高性能スラスター',
  '攻撃強化プログラムLv3',
  '高性能レーダー',
  'シールド補強材Lv2',
  '射撃強化プログラムLv1',
  '格闘強化プログラムLv2',
  'バックアップユニット',
  '強化ジェネレーター'
];

export default function CustomPartsSelector() {
  const [selectedParts, setSelectedParts] = useState([]);

  const togglePart = (part) => {
    if (selectedParts.includes(part)) {
      setSelectedParts(selectedParts.filter(p => p !== part));
    } else {
      if (selectedParts.length < 8) {
        setSelectedParts([...selectedParts, part]);
      } else {
        alert("最大8つまでしか選択できません！");
      }
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">カスタムパーツ（最大8つ）</h2>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {partsList.map((part, index) => (
          <label key={index} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedParts.includes(part)}
              onChange={() => togglePart(part)}
            />
            <span>{part}</span>
          </label>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-1">選択中のパーツ:</h3>
        <ol className="list-decimal pl-5">
          {selectedParts.map((part, idx) => (
            <li key={idx}>{part}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
