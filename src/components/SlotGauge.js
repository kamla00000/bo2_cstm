import React from 'react';

const SlotGauge = ({ type = '近', max = 10, used = 0 }) => {
  // ここでmaxとusedを確認
  console.log(`Max: ${max}, Used: ${used}`); // 親から渡された値を表示

  const totalBars = 30; // 最大30バー
  const usedBars = Math.round((used / max) * totalBars); // 使用バーの計算

  const filledColor =
    type === '近' ? 'bg-red-500' : type === '中' ? 'bg-yellow-500' : 'bg-blue-500';

  return (
    <div className="flex flex-col items-start w-full gap-1">
      <div className="text-xs font-semibold">
        {type}スロット {used}/{max}
      </div>
      <div className="flex w-full h-3">
        {[...Array(totalBars)].map((_, i) => {
          const isActive = i < totalBars; // 常に30個のバー
          const isFilled = i < usedBars; // 使用バーの計算（maxに基づく）
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

export default SlotGauge;
