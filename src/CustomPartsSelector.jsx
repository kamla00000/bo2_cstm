import React, { useState } from 'react';

const partsList = [
  { name: '強化フレームLv1', short: { close: 1, mid: 0, long: 0 }, effect: 'HP +100' },
  { name: '脚部特殊装甲Lv2', short: { close: 2, mid: 1, long: 0 }, effect: '脚部HP +300' },
  { name: '高性能スラスター', short: { close: 0, mid: 1, long: 1 }, effect: 'スラスター+3' },
  { name: '攻撃強化プログラムLv3', short: { close: 1, mid: 2, long: 0 }, effect: '格闘+2%' },
  { name: '高性能レーダー', short: { close: 0, mid: 0, long: 1 }, effect: 'レーダー範囲拡大' },
  { name: '格闘強化プログラムLv2', short: { close: 1, mid: 1, long: 1 }, effect: '格闘+3%' },
];

const SLOT_LIMIT = { close: 6, mid: 6, long: 6 }; // ← 機体によって変えてOK

export default function CustomPartsSelector() {
  const [selectedParts, setSelectedParts] = useState([]);

  const togglePart = (part) => {
    const isSelected = selectedParts.find((p) => p.name === part.name);

    if (isSelected) {
      setSelectedParts(selectedParts.filter((p) => p.name !== part.name));
    } else {
      if (selectedParts.length < 8) {
        setSelectedParts([...selectedParts, part]);
      } else {
        alert("最大8つまでしか選択できません！");
      }
    }
  };

  const totalSlots = selectedParts.reduce(
    (acc, part) => {
      acc.close += part.short.close;
      acc.mid += part.short.mid;
      acc.long += part.short.long;
      return acc;
    },
    { close: 0, mid: 0, long: 0 }
  );

  const slotStatus = (used, limit) =>
    used > limit ? 'text-red-600 font-bold' : '';

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">カスタムパーツ（最大8つ）</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        {partsList.map((part, index) => (
          <label key={index} className="flex items-start gap-2 border p-2 rounded shadow-sm">
            <input
              type="checkbox"
              checked={selectedParts.some(p => p.name === part.name)}
              onChange={() => togglePart(part)}
            />
            <div>
              <div className="font-semibold">{part.name}</div>
              <div className="text-sm text-gray-600">効果: {part.effect}</div>
              <div className="text-sm text-gray-500">
                消費: 近{part.short.close} 中{part.short.mid} 遠{part.short.long}
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">スロット使用量:</h3>
        <ul className="space-y-1">
          <li className={slotStatus(totalSlots.close, SLOT_LIMIT.close)}>
            近距離: {totalSlots.close} / {SLOT_LIMIT.close}
          </li>
          <li className={slotStatus(totalSlots.mid, SLOT_LIMIT.mid)}>
            中距離: {totalSlots.mid} / {SLOT_LIMIT.mid}
          </li>
          <li className={slotStatus(totalSlots.long, SLOT_LIMIT.long)}>
            遠距離: {totalSlots.long} / {SLOT_LIMIT.long}
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-1">選択中のパーツ:</h3>
        <ol className="list-decimal pl-5">
          {selectedParts.map((part, idx) => (
            <li key={idx}>{part.name}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
