// src/components/SlotGauge.jsx
import React from 'react';

const SlotGauge = ({ type = '近', max = 10, used = 0, hoveredOccupiedAmount = 0 }) => {
  const totalBars = 30;
  const usedBars = Math.round((used / max) * totalBars);

  const filledColor =
    type === '近' ? 'bg-red-500' : type === '中' ? 'bg-yellow-500' : 'bg-blue-500';

  return (
    <div className="flex flex-col items-start w-full gap-1">
      <div className="text-xs font-semibold">
        {type}スロット {used}/{max}
      </div>
      <div className="flex w-full h-3">
        {[...Array(totalBars)].map((_, i) => {
          const isFilled = i < usedBars;
          
          const hoveredOccupiedBarsStart = usedBars - Math.round((hoveredOccupiedAmount / max) * totalBars);
          const isHoveredOccupied = hoveredOccupiedAmount > 0 && 
                                    i >= hoveredOccupiedBarsStart &&
                                    i < usedBars;

          // ★★★ デバッグ用 console.log を追加 ★★★
          // ホバー中に開発者コンソールを確認
          // `type`, `i` (バーのインデックス), `isFilled`, `isHoveredOccupied`, `hoveredOccupiedAmount` を確認
          // console.log(`Type: ${type}, Bar Index: ${i}, isFilled: ${isFilled}, isHoveredOccupied: ${isHoveredOccupied}, hoveredOccupiedAmount: ${hoveredOccupiedAmount}`);


          let segmentColorClass = 'bg-gray-700 border-gray-600';

          if (isFilled) {
            segmentColorClass = `${filledColor} border-gray-300`;
          }

          if (isHoveredOccupied) {
            segmentColorClass = 'bg-yellow-400 border-yellow-300 animate-ping-once';
          }

          return (
            <div
              key={i}
              className={`flex-1 mx-[0.5px] h-full rounded-sm ${segmentColorClass}`}
              style={{ minWidth: '1px' }}
            />
          );
        })}
        {used > max && (
            <span className="text-red-400 text-xs ml-2">OVER!</span>
        )}
      </div>
    </div>
  );
};

export default SlotGauge;