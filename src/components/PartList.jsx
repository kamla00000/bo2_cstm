import React from 'react'

const PartList = ({ selectedParts, onSelect, parts, onHover }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {parts.map(part => {
        const isSelected = selectedParts.includes(part)
        return (
          <label
            key={part.name}
            onMouseEnter={() => onHover(part)}
            onMouseLeave={() => onHover(null)}
            className={`relative flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer shadow-sm transition-colors duration-200
              ${isSelected ? 'bg-gray-600 text-gray-300 opacity-60 cursor-not-allowed' : 'bg-gray-800 text-gray-100 hover:bg-gray-700'}`}
          >
            <div>
              <div className="font-semibold flex items-center gap-1">
                {isSelected && <span className="text-green-400">✔</span>}
                {part.name}
              </div>
              <div className="text-xs text-gray-400">カテゴリ: {part.category}</div>
              <div className="text-xs text-gray-300">近:{part.close} / 中:{part.mid} / 遠:{part.long}</div>
            </div>
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-500"
              checked={isSelected}
              disabled={isSelected}
              onChange={() => onSelect(part)}
            />
          </label>
        )
      })}
    </div>
  )
}

export default PartList