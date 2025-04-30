import React from 'react';

const SlotGauge = ({ type = '近', max = 10, used = 0 }) => {
  const totalBars = 30;
  const scale = totalBars / totalBars; // 実質1.0だが枠は30固定
  const usedBars = Math.round((used / max) * max); // usedの正規化
  const filledColor =
    type === '近' ? 'bg-red-500' : type === '中' ? 'bg-yellow-500' : 'bg-blue-500';

  return (
    <div className="flex flex-col items-start w-full gap-1">
      <div className="text-xs font-semibold">
        {type}スロット {used}/{max}
      </div>
      <div className="flex w-full h-3">
        {[...Array(totalBars)].map((_, i) => {
          const isActive = i < max;
          const isFilled = i < used;
          return (
            <div
              key={i}
              className={`flex-1 mx-[0.5px] h-full border ${
                isActive
                  ? isFilled
                    ? `${filledColor} border-gray-300`
                    : 'bg-white border-gray-300'
                  : 'bg-gray-300 border-gray-300'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
console.log(`[SlotGauge] type=${type}, max=${max}, used=${used}`);
export default SlotGauge;
