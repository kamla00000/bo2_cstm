
import React from 'react';

const partsList = [
  { name: '頭部耐久強化LV1', slots: { S: 1, M: 0, L: 0 }, effect: '頭部HP+500' },
  { name: '耐格闘装甲LV2', slots: { S: 0, M: 1, L: 0 }, effect: '格闘補正-3、格闘耐性+8' },
  { name: '強制噴射装置LV1', slots: { S: 0, M: 0, L: 1 }, effect: 'スラスター容量+10' },
  // 必要に応じて追加可能
];

export default function CustomPartsSelector({ selectedParts, setSelectedParts }) {
  const togglePart = (part) => {
    if (selectedParts.includes(part)) {
      setSelectedParts(selectedParts.filter(p => p !== part));
    } else if (selectedParts.length < 8) {
      setSelectedParts([...selectedParts, part]);
    }
  };

  return (
    <div>
      <h2 className="font-semibold mb-2">カスタムパーツ選択（最大8）</h2>
      <ul className="space-y-2">
        {partsList.map((part, index) => (
          <li key={index}>
            <button
              className={
                'w-full text-left p-2 rounded ' +
                (selectedParts.includes(part)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200')
              }
              onClick={() => togglePart(part)}
            >
              {part.name} - {part.effect}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <h3 className="font-medium">選択中のパーツ:</h3>
        <ul className="list-disc ml-5">
          {selectedParts.map((part, index) => (
            <li key={index}>{part.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
