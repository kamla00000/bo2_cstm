import React, { useEffect, useState } from 'react'
import MSSelector from './components/MSSelector'
import PartList from './components/PartList'
import SlotSelector from './components/SlotSelector'

function App() {
  const [msList, setMsList] = useState([])
  const [msSelected, setMsSelected] = useState(null)
  const [hoveredMs, setHoveredMs] = useState(null)
  const [hoveredPart, setHoveredPart] = useState(null)
  const [selectedParts, setSelectedParts] = useState([])
  const [slotUsage, setSlotUsage] = useState({ close: 0, mid: 0, long: 0 })
  const [filterCategory, setFilterCategory] = useState('すべて')

  const partList = [
    { name: '攻撃ブースター', category: '攻撃', close: 1, mid: 0, long: 1 },
    { name: 'フレーム強化', category: '防御', close: 0, mid: 2, long: 1 },
    { name: '精密照準装置', category: '攻撃', close: 0, mid: 1, long: 2 },
    { name: '耐弾装甲', category: '防御', close: 2, mid: 1, long: 0 },
  ]

  useEffect(() => {
    fetch('/data/msData.json')
      .then(res => res.json())
      .then(data => setMsList(data))
      .catch(err => console.error('MSデータの読み込みに失敗しました:', err))

    const savedMs = localStorage.getItem('selectedMs')
    const savedParts = localStorage.getItem('selectedParts')

    if (savedMs) setMsSelected(JSON.parse(savedMs))
    if (savedParts) {
      const parsedParts = JSON.parse(savedParts)
      setSelectedParts(parsedParts)
      updateSlotUsage(parsedParts)
    }
  }, [])

  useEffect(() => {
    if (msSelected) localStorage.setItem('selectedMs', JSON.stringify(msSelected))
    localStorage.setItem('selectedParts', JSON.stringify(selectedParts))
  }, [msSelected, selectedParts])

  const handleMsSelect = (ms) => {
    setMsSelected(ms)
    setHoveredMs(null)
    setHoveredPart(null)
    setSlotUsage({ close: 0, mid: 0, long: 0 })
    setSelectedParts([])
  }

  const willExceedSlots = (part) => {
    if (!msSelected) return false
    return (
      slotUsage.close + part.close > msSelected.close ||
      slotUsage.mid + part.mid > msSelected.mid ||
      slotUsage.long + part.long > msSelected.long
    )
  }

  const handlePartSelect = (part) => {
    if (selectedParts.find(p => p.name === part.name)) return
    if (selectedParts.length >= 8) return
    if (willExceedSlots(part)) return

    setSelectedParts((prevParts) => {
      const newParts = [...prevParts, part]
      updateSlotUsage(newParts)
      return newParts
    })
  }

  const handlePartRemove = (part) => {
    const newParts = selectedParts.filter(p => p.name !== part.name)
    setSelectedParts(newParts)
    updateSlotUsage(newParts)
  }

  const handleClearAllParts = () => {
    setSelectedParts([])
    updateSlotUsage([])
  }

  const updateSlotUsage = (newParts) => {
    const newUsage = { close: 0, mid: 0, long: 0 }
    newParts.forEach((part) => {
      newUsage.close += part.close
      newUsage.mid += part.mid
      newUsage.long += part.long
    })
    setSlotUsage(newUsage)
  }

  const getUsageWithPreview = () => {
    if (!hoveredPart || selectedParts.find(p => p.name === hoveredPart.name)) {
      return slotUsage
    }
    return {
      close: slotUsage.close + hoveredPart.close,
      mid: slotUsage.mid + hoveredPart.mid,
      long: slotUsage.long + hoveredPart.long,
    }
  }

  const filteredParts = filterCategory === 'すべて'
    ? partList
    : partList.filter(part => part.category === filterCategory)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center gap-6">
      <h1 className="text-4xl font-bold tracking-wide text-blue-400 drop-shadow-lg">bo2-cstm</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
        <div className="bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">モビルスーツを選択</h2>
          <MSSelector
            msList={msList}
            onSelect={handleMsSelect}
            onHover={setHoveredMs}
            selectedMs={msSelected}
          />
        </div>

        {msSelected && (
          <div className="bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-2">スロット使用状況</h2>
            <SlotSelector
              usage={getUsageWithPreview()}
              maxUsage={hoveredMs || msSelected}
            />
          </div>
        )}
      </div>

      {msSelected && (
        <div className="w-full max-w-6xl bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">カテゴリ別パーツ選択</h2>

          <div className="flex flex-wrap gap-2 mb-2">
            {['すべて', '攻撃', '防御'].map(cat => (
              <button
                key={cat}
                className={`px-3 py-1 rounded-full text-sm ${filterCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-100'}`}
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
        </div>
      )}
    </div>
  )
}

export default App
