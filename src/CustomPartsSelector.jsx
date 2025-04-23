import React from 'react';

const allParts = [
  '射撃強化プログラム',
  '格闘強化プログラム',
  'スラスター制御装置',
  '耐弾装甲',
  '耐ビーム装甲',
  '耐格闘装甲',
  'フレーム強化',
  '緊急回避制御装置',
  '高性能AMBAC',
  'バランサー強化装置',
  'ステルスユニット',
  '観測情報連結',
  '脚部特殊装甲',
  'バックアップジェネレーター',
  '噴射制御装置',
];

const CustomPartsSelector = ({ selectedParts, setSelectedParts }) => {
  const handleTogglePart = (part) => {
    if (selectedParts.includes(part)) {
      setSelectedParts(selectedParts.filter((p) => p !== part));
    } else if (selectedParts.length < 8) {
      setSelectedParts([...selectedParts, part]);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold mb-2">カスタムパーツ選択（最大8つ）</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
        {allParts.map((part) => (
          <button
            key={part}
            onClick={() => handleTogglePart(part)}
            className={`border rounded p-2 text-sm ${
              selectedParts.includes(part) ? 'bg-green-200' : ''
            }`}
          >
            {part}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <p className="font-semibold">選択中のパーツ（{selectedParts.length}/8）:</p>
        <ul className="list-disc list-inside">
          {selectedParts.map((part) => (
            <li key={part}>{part}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomPartsSelector;
