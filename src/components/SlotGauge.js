import React from 'react';

const SlotGauge = ({ maxSlots, currentSlots }) => {
  // スロット数に合わせて目盛り数を変動
  const totalSlots = maxSlots; // MSごとの最大スロット数
  const totalBars = 30; // ゲージ全体の目盛り数（30の枠）
  const scale = totalBars / totalSlots; // 目盛り1個あたりのスロット数

  const usedBars = Math.min(Math.round(currentSlots * scale), totalBars); // 現在のスロットに基づいて塗りつぶし部分を計算

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full h-5 border border-gray-700">
        {[...Array(totalBars)].map((_, index) => (
          <div
            key={index}
            className={`flex-1 mx-0.5 ${index < usedBars ? 'bg-green-500' : 'bg-gray-300'}`}
          ></div>
        ))}
      </div>
      <div className="mt-2 text-sm">
        {currentSlots}/{maxSlots}
      </div>
    </div>
  );
};

export default SlotGauge;
