import React from 'react'

const BarGauge = ({ label, used, max = 30, color }) => {
  const totalSlots = 30;

  return (
    <div className="mb-4">
      {/* ラベル（上） */}
      <div className="text-sm mb-1 text-left font-semibold text-gray-200">{label}</div>

      {/* ゲージバー本体 */}
      <div className="flex overflow-x-auto">
        {Array.from({ length: totalSlots }).map((_, i) => {
          const isWithinMax = i < max;
          const isUsed = i < used;
          const isOver = isUsed && !isWithinMax;
          return (
            <div
              key={i}
              className={`h-3 w-[8px] mx-[1px] rounded-sm ${
                isUsed
                  ? (isOver ? 'bg-red-500 animate-pulse' : color)
                  : (isWithinMax ? 'bg-gray-700' : 'bg-gray-900 opacity-30')
              }`}
            ></div>
          );
        })}
      </div>

      {/* 分子/分母（下） */}
      <div className="text-xs mt-1 text-left text-gray-400">
        <span className={used > max ? 'text-red-400 font-bold' : ''}>
          {used} / {max}
        </span>
      </div>
    </div>
  );
};




const SlotSelector = ({ usage, maxUsage }) => {
  return (
    <div className="space-y-4">
      <BarGauge label="近距離" used={usage.close} max={maxUsage.close} color="bg-red-500" />
      <BarGauge label="中距離" used={usage.mid} max={maxUsage.mid} color="bg-yellow-400" />
      <BarGauge label="遠距離" used={usage.long} max={maxUsage.long} color="bg-blue-400" />
    </div>
  )
}

export default SlotSelector
