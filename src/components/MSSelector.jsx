import React, { useState } from 'react'

const typeColors = {
  '強襲': 'text-red-400',
  '汎用': 'text-blue-400',
  '支援': 'text-yellow-400',
}

const MSSelector = ({ msList, onSelect, onHover, selectedMs }) => {
  const [selectedType, setSelectedType] = useState('強襲')
  const [selectedCost, setSelectedCost] = useState(450)
  const [selectedName, setSelectedName] = useState(selectedMs?.name || null)

  const costOptions = Array.from({ length: 14 }, (_, i) => 100 + i * 50)

  const filteredList = msList.filter(
    ms => ms.type === selectedType && ms.cost === selectedCost
  )

  const handleSelect = (ms) => {
    setSelectedName(ms.name)
    onSelect(ms)
  }

  return (
    <div className="space-y-4">
      {/* 属性タブ */}
      <div className="flex gap-2">
        {['強襲', '汎用', '支援'].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1 rounded-full text-sm font-semibold border transition-all
              ${selectedType === type ? `${typeColors[type]} border-white bg-gray-700` : 'text-gray-400 border-gray-500'}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* コストセレクト */}
      <select
        className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
        value={selectedCost}
        onChange={(e) => setSelectedCost(Number(e.target.value))}
      >
        {costOptions.map(cost => (
          <option key={cost} value={cost}>{cost}</option>
        ))}
      </select>

      {/* 該当MS一覧 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredList.length === 0 && (
          <p className="text-sm text-gray-400 col-span-full">該当するMSがありません</p>
        )}
        {filteredList.map(ms => {
          const isSelected = selectedMs && selectedMs.name === ms.name
          return (
            <button
              key={ms.name}
              onClick={() => handleSelect(ms)}
              onMouseEnter={() => {
                if (!isSelected) onHover(ms)
              }}
              onMouseLeave={() => {
                onHover(null)
              }}
              className={`relative p-3 rounded-xl shadow border-2 transition-all duration-200
                ${isSelected ? 'border-blue-500 bg-green-700' : 'border-gray-600 bg-gray-800 hover:bg-gray-700'}`}
            >
              <img
                src={`https://via.placeholder.com/150x100?text=${ms.name}`}
                alt={`${ms.name} icon`}
                className="w-full h-auto mb-2 rounded"
              />
              <div className="text-sm font-semibold">{ms.name}</div>
              <div className={`text-xs ${typeColors[ms.type]}`}>{ms.type} / COST: {ms.cost}</div>
              {isSelected && (
                <div className="absolute top-2 right-2 text-blue-400 text-xl">★</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MSSelector
