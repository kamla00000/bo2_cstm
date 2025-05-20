// src/App.jsx
import React, { useEffect, useState, useMemo } from 'react';
import MSSelector from './components/MSSelector';
import StatusDisplay from './components/StatusDisplay';
import SlotDisplay from './components/SlotDisplay';
import { calculateMSStats } from './utils/calculateMSStats';

function App() {
  const [msList, setMsList] = useState([]);
  const [partList, setPartList] = useState([]);
  const [msSelected, setMsSelected] = useState(null);
  const [hoveredMs, setHoveredMs] = useState(null);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [slotUsage, setSlotUsage] = useState({ close: 0, mid: 0, long: 0 });
  const [filterCategory, setFilterCategory] = useState('すべて');

  useEffect(() => {
    fetch('/data/msData.json')
      .then(res => res.json())
      .then(data => setMsList(data))
      .catch(err => console.error('MSデータ読み込みエラー:', err));

    fetch('/data/partData.json')
      .then(res => res.json())
      .then(data => setPartList(data))
      .catch(err => console.error('パーツデータ読み込みエラー:', err));

    const savedMs = localStorage.getItem('selectedMs');
    const savedParts = localStorage.getItem('selectedParts');

    if (savedMs) {
      const parsedMs = JSON.parse(savedMs);
      setMsSelected(parsedMs);
    }

    if (savedParts) {
      const parsedParts = JSON.parse(savedParts);
      setSelectedParts(parsedParts);
      updateSlotUsage(parsedParts);
    }
  }, []);

  useEffect(() => {
    if (msSelected) localStorage.setItem('selectedMs', JSON.stringify(msSelected));
    localStorage.setItem('selectedParts', JSON.stringify(selectedParts));
  }, [msSelected, selectedParts]);

  const currentStats = useMemo(() => {
    if (msSelected) {
      const stats = calculateMSStats(msSelected, selectedParts);
      return stats;
    }
    return { base: {}, bonus: {}, total: {} };
  }, [msSelected, selectedParts]);

  const handleMsSelect = (ms) => {
    setMsSelected(ms);
    setHoveredMs(null);
    setHoveredPart(null);
    setSelectedParts([]);
    updateSlotUsage([]);
  };

  const handlePartSelect = (part) => {
    if (selectedParts.find(p => p.name === part.name)) {
      const newParts = selectedParts.filter(p => p.name !== part.name);
      setSelectedParts(newParts);
      updateSlotUsage(newParts);
      return;
    }

    if (!msSelected) return;

    if (selectedParts.length >= 8) {
      alert('装着できるカスタムパーツは最大8個です。');
      return;
    }

    if (
      (slotUsage.close + part.close) > (msSelected["近スロット"] ?? 0) ||
      (slotUsage.mid + part.mid) > (msSelected["中スロット"] ?? 0) ||
      (slotUsage.long + part.long) > (msSelected["遠スロット"] ?? 0)
    ) {
      alert('スロットが不足しています。');
      return;
    }

    const newParts = [...selectedParts, part];
    setSelectedParts(newParts);
    updateSlotUsage(newParts);
  };

  const handlePartRemove = (part) => {
    const newParts = selectedParts.filter(p => p.name !== part.name);
    setSelectedParts(newParts);
    updateSlotUsage(newParts);
    setHoveredPart(null);
  };

  const handleClearAllParts = () => {
    setSelectedParts([]);
    updateSlotUsage([]);
    setHoveredPart(null);
  };

  const updateSlotUsage = (newParts) => {
    const usage = { close: 0, mid: 0, long: 0 };
    newParts.forEach((part) => {
      usage.close += part.close || 0;
      usage.mid += part.mid || 0;
      usage.long += part.long || 0;
    });
    setSlotUsage(usage);
  };

  const filteredParts = useMemo(() => {
    return filterCategory === 'すべて'
      ? partList
      : partList.filter(part => part.category === filterCategory);
  }, [partList, filterCategory]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center gap-6">
      <h1 className="text-4xl font-bold tracking-wide text-blue-400 drop-shadow-lg">bo2-cstm</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
        <div className="bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-700">
          <MSSelector
            msList={msList}
            onSelect={handleMsSelect}
            onHover={setHoveredMs}
            selectedMs={msSelected}
            slotUsage={slotUsage}
            hoveredPart={hoveredPart}
            selectedParts={selectedParts}
            parts={filteredParts}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            onPartSelect={handlePartSelect}
            onPartRemove={handlePartRemove}
            onPartHover={setHoveredPart}
            onPartLeave={() => setHoveredPart(null)}
            onClearAllParts={handleClearAllParts}
            SlotDisplayComponent={SlotDisplay}
          />
        </div>

        {msSelected && (
          <div className="bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-700">
            <StatusDisplay
              stats={currentStats}
              selectedMs={msSelected}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;