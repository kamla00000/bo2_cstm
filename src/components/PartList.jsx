import React from 'react'

const PartList = ({ selectedParts, onSelect, onRemove, parts, onHover }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {parts.map(part => {
        const isSelected = selectedParts.some(p => p.name === part.name)

        const handleClick = () => {
          if (isSelected) {
            onRemove(part)
          } else {
            onSelect(part)
          }
        }

        return (
          <button
            key={part.name}
            onClick={handleClick}
            onMouseEnter={() => onHover(part)}
            onMouseLeave={() => onHover(null)}
            className={`relative w-full text-left flex px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm
              ${isSelected
                ? 'bg-green-700 text-white border-green-400'
                : 'bg-gray-800 text-gray-100 border-gray-600 hover:bg-gray-700 hover:border-blue-400'
              }`}
          >
            {/* 左側の色バー（装備中だけ表示） */}
            {isSelected && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400 rounded-l-xl"></div>
            )}

            <div className="flex flex-col ml-1">
              <div className="font-semibold text-sm flex items-center gap-1">
                {isSelected && <span className="text-green-300">🔧</span>}
                {part.name}
              </div>
              <div className="text-xs text-gray-300">カテゴリ: {part.category}</div>
              <div className="text-xs text-gray-300">近:{part.close} / 中:{part.mid} / 遠:{part.long}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default PartList
