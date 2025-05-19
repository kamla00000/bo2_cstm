// src/App.jsx
import React, { useEffect, useState } from 'react';
import MSSelector from './components/MSSelector';
import PartList from './components/PartList';
import SlotSelector from './components/SlotSelector';
import SlotDisplay from './components/SlotDisplay';
import StatusDisplay from './components/StatusDisplay';

function App() {
  const [msList, setMsList] = useState([]);
  const [partList, setPartList] = useState([]);
  const [msSelected, setMsSelected] = useState(null);
  const [hoveredMs, setHoveredMs] = useState(null);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [slotUsage, setSlotUsage] = useState({ close: 0, mid: 0, long: 0 }); // 初期値を 0 に設定
  const [filterCategory, setFilterCategory] = useState('すべて');

  // MSデータとパーツデータを初期ロード
  useEffect(() => {
    fetch('/data/msData.json')
      .then(res => {
        if (!res.ok) throw new Error('MSデータ取得失敗');
        return res.json();
      })
      .then(data => {
        console.log('📥 msData.json 読み込み成功:', data);
        setMsList(data);
      })
      .catch(err => console.error('MSデータ読み込みエラー:', err));

    fetch('/data/partData.json')
      .then(res => res.json())
      .then(data => setPartList(data))
      .catch(err => console.error('パーツデータ読み込みエラー:', err));

    const savedMs = localStorage.getItem('selectedMs');
    const savedParts = localStorage.getItem('selectedParts');

    if (savedMs) {
      const parsedMs = JSON.parse(savedMs);
      console.log('💾 復元 MS:', parsedMs);
      setMsSelected(parsedMs);
    }

    if (savedParts) {
      const parsedParts = JSON.parse(savedParts);
      setSelectedParts(parsedParts);
      updateSlotUsage(parsedParts); // パーツを復元した際にスロット使用状況を更新
    }
  }, []);

  // ローカルストレージに保存（自動反映）
  useEffect(() => {
    if (msSelected) localStorage.setItem('selectedMs', JSON.stringify(msSelected));
    localStorage.setItem('selectedParts', JSON.stringify(selectedParts));
  }, [msSelected, selectedParts]);

  // ステータス計算関数（ホバー含む）
  const calculateMSStats = (parts = []) => {
    if (!msSelected) {
      console.warn('⚠️ msSelected が null または undefined');
      return {};
    }

    const stats = {
      name: msSelected["MS名"] || '不明',
      コスト: msSelected.コスト || 0,
      HP: msSelected.HP || 0,
      耐実弾補正: msSelected.耐実弾補正 ?? 0,
      耐ビーム補正: msSelected.耐ビーム補正 ?? 0,
      耐格闘補正: msSelected.耐格闘補正 ?? 0,
      射撃補正: msSelected.射撃補正 ?? 0,
      格闘補正: msSelected.格闘補正 ?? 0,
      スピード: msSelected.スピード ?? 0,
      高速移動: msSelected.高速移動 ?? 0,
      スラスター: msSelected.スラスター ?? 0,
      旋回_地上_通常時: msSelected.旋回_地上_通常時 ?? 0,
      旋回_宇宙_通常時: msSelected.旋回_宇宙_通常時 ?? 0,
      格闘判定力: msSelected.格闘判定力 ?? '',
      カウンター: msSelected.カウンター ?? '',
      close: msSelected.近スロット ?? 0,
      mid: msSelected.中スロット ?? 0,
      long: msSelected.遠スロット ?? 0,
    };

    const noBonusKeys = ['カウンター', 'close', 'mid', 'long'];

    const bonus = {};
    const total = {};

    Object.keys(stats).forEach((key) => {
      if (!noBonusKeys.includes(key)) {
        bonus[key] = 0;
        total[key] = stats[key];
      } else {
        bonus[key] = null; // 補正なし
        total[key] = stats[key]; // 初期値のみ反映
      }
    });

    parts.forEach((part) => {
      Object.entries(part).forEach(([key, value]) => {
        if (typeof value === 'number' && !isNaN(value)) {
          if (bonus.hasOwnProperty(key) && bonus[key] !== null) {
            bonus[key] += value;
            total[key] = stats[key] + bonus[key];
          }
        }
      });
    });

    return {
      base: stats,
      bonus,
      total
    };
  };

  // 現在のステータス（ホバー含む）
  const currentStats = msSelected
    ? calculateMSStats([
        ...selectedParts,
        ...(hoveredPart && !selectedParts.some(p => p.name === hoveredPart.name)
          ? [hoveredPart]
          : [])
      ])
    : { base: {}, bonus: {}, total: {} };

  console.log('📌 App.jsx > currentStats:', currentStats);

  // MS 選択時処理
  const handleMsSelect = (ms) => {
    console.log('🎯 handleMsSelect 実行:', ms);
    setMsSelected(ms);
    setHoveredMs(null);
    setHoveredPart(null);
    setSelectedParts([]);
    updateSlotUsage([]); // パーツを解除してスロット使用状況をリセット
  };

  // パーツ選択可否判定
  const willExceedSlots = (part) => {
    if (!msSelected) return false;

    return (
      slotUsage.close + part.close > msSelected["近スロット"] ||
      slotUsage.mid + part.mid > msSelected["中スロット"] ||
      slotUsage.long + part.long > msSelected["遠スロット"]
    );
  };

  // パーツ選択処理
  const handlePartSelect = (part) => {
    if (selectedParts.find(p => p.name === part.name)) return;
    if (selectedParts.length >= 8) return;
    if (willExceedSlots(part)) return;

    const newParts = [...selectedParts, part];
    setSelectedParts(newParts);
    updateSlotUsage(newParts);
  };

  // パーツ解除処理
  const handlePartRemove = (part) => {
    const newParts = selectedParts.filter(p => p.name !== part.name);
    setSelectedParts(newParts);
    updateSlotUsage(newParts);
    setHoveredPart(null);
  };

  // 全削除ボタン
  const handleClearAllParts = () => {
    setSelectedParts([]);
    updateSlotUsage([]); // パーツを全解除してスロット使用状況をリセット
  };

  // スロット使用状況の更新
  const updateSlotUsage = (newParts) => {
    const newUsage = { close: 0, mid: 0, long: 0 };
    newParts.forEach((part) => {
      newUsage.close += part.close || 0;
      newUsage.mid += part.mid || 0;
      newUsage.long += part.long || 0;
    });
    setSlotUsage(newUsage);
  };

  // ホバー時のプレビュー用スロット
  const getUsageWithPreview = () => {
    const usage = { ...slotUsage };
    if (hoveredPart && !selectedParts.some(p => p.name === hoveredPart.name)) {
      usage.close += hoveredPart.close || 0;
      usage.mid += hoveredPart.mid || 0;
      usage.long += hoveredPart.long || 0;
    }
    return usage;
  };

  // フィルタリング
  const filteredParts = filterCategory === 'すべて'
    ? partList
    : partList.filter(part => part.category === filterCategory);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center gap-6">
      <h1 className="text-4xl font-bold tracking-wide text-blue-400 drop-shadow-lg">bo2-cstm</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
        {/* 左：モビルスーツ選択 */}
        <div className="bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">モビルスーツを選択</h2>
          <MSSelector
            msList={msList}
            onSelect={handleMsSelect}
            onHover={setHoveredMs}
            selectedMs={msSelected}
            slotUsage={slotUsage} // スロット使用状況を渡す
          />
        </div>
        {/* 右：ステータス一覧表示 */}
        {msSelected && (
          <div className="bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-700">
            <StatusDisplay stats={currentStats} />
          </div>
        )}
      </div>
      {/* カスタムパーツセクション */}
      {msSelected && (
        <div className="w-full max-w-6xl bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">カテゴリ別パーツ選択</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {['すべて', '攻撃', '防御'].map(cat => (
              <button
                key={cat}
                className={`px-3 py-1 rounded-full text-sm ${filterCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-100'} hover:bg-blue-600`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClearAllParts}
              className="text-sm text-red-400 hover:underline"
            >
              🗑 全パーツ解除
            </button>
          </div>
          <PartList
            selectedParts={selectedParts}
            onSelect={handlePartSelect}
            onRemove={handlePartRemove}
            parts={filteredParts}
            onHover={setHoveredPart}
          />
          {/* 装着中的カスタムパーツ一覧 */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">装着中的カスタムパーツ</h2>
            <SlotDisplay parts={selectedParts} onRemove={handlePartRemove} />
          </div>
          {/* スロット使用状況 */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">スロット使用状況</h2>
            <SlotSelector
              usage={getUsageWithPreview()}
              maxUsage={msSelected}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;