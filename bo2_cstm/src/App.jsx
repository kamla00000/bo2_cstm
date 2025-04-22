import { useState } from 'react';

const MS_DATA = [
  { name: 'ジム・カスタム', slots: { close: 6, mid: 8, long: 4 } },
  { name: 'ガンダム', slots: { close: 10, mid: 10, long: 10 } }
];

const PARTS_DATA = [
  { name: '強化フレームLv1', close: 2, mid: 0, long: 0, effect: 'HP+1000' },
  { name: '射撃強化プログラムLv1', close: 0, mid: 2, long: 1, effect: '射撃補正+3' },
  { name: '近接強化プログラムLv1', close: 1, mid: 1, long: 0, effect: '格闘補正+2' }
];

export default function App() {
  const [selectedMS, setSelectedMS] = useState(MS_DATA[0]);
  const [selectedParts, setSelectedParts] = useState([]);

  const togglePart = (part) => {
    setSelectedParts((prev) =>
      prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part].slice(0, 8)
    );
  };

  const total = selectedParts.reduce(
    (acc, p) => {
      acc.close += p.close;
      acc.mid += p.mid;
      acc.long += p.long;
      return acc;
    },
    { close: 0, mid: 0, long: 0 }
  );

  const over =
    total.close > selectedMS.slots.close ||
    total.mid > selectedMS.slots.mid ||
    total.long > selectedMS.slots.long;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>バトオペ2 カスタムパーツシミュレーター</h1>

      <select onChange={(e) => setSelectedMS(MS_DATA.find((ms) => ms.name === e.target.value))}>
        {MS_DATA.map((ms) => (
          <option key={ms.name} value={ms.name}>
            {ms.name}
          </option>
        ))}
      </select>

      <p>
        スロット: 近 {selectedMS.slots.close} / 中 {selectedMS.slots.mid} / 遠{' '}
        {selectedMS.slots.long}
      </p>
      <p>
        使用中: 近 {total.close} / 中 {total.mid} / 遠 {total.long}
      </p>
      {over && <p style={{ color: 'red' }}>※ スロットオーバーしています！</p>}

      <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
        {PARTS_DATA.map((part) => (
          <div
            key={part.name}
            style={{
              border: '1px solid #ccc',
              padding: '0.5rem',
              background: selectedParts.includes(part) ? '#d0e9ff' : '#fff',
              cursor: 'pointer'
            }}
            onClick={() => togglePart(part)}
          >
            <strong>{part.name}</strong>
            <p>近 {part.close} / 中 {part.mid} / 遠 {part.long}</p>
            <p>効果: {part.effect}</p>
          </div>
        ))}
      </div>
    </div>
  );
}