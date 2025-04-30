import React from 'react'

const BarGauge = ({ label, used, max = 30, color }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1 text-sm">
        <span>{label}</span>
        <span className={`${used > max ? 'text-red-400 font-bold' : ''}`}>{used} / {max}</span>
      </div>
      <div className="flex gap-[1px]">
        {Array.from({ length: max }).map((_, i) => {
          const isUsed = i < used
          const isOver = i >= max && i < used
          return (
            <div
              key={i}
              className={`h-2.5 flex-1 rounded-sm ${
                isUsed ? (isOver ? 'bg-red-500 animate-pulse' : color) : 'bg-gray-700'
              }`}
            ></div>
          )
        })}
      </div>
    </div>
  )
}

const SlotSelector = ({ usage }) => {
  return (
    <div className="space-y-4">
      <BarGauge label="近距離" used={usage.close} color="bg-red-500" />
      <BarGauge label="中距離" used={usage.mid} color="bg-yellow-400" />
      <BarGauge label="遠距離" used={usage.long} color="bg-blue-400" />
    </div>
  )
}

export default SlotSelector
