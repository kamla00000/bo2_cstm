import React from 'react';

// onClearAllParts という新しいpropを追加します
const SelectedPartDisplay = ({ parts, onRemove, onClearAllParts }) => {
  const maxParts = 8; // カスタムパーツの最大装着数

  // 空のスロットを最大数まで作成
  const emptySlots = Array(Math.max(0, maxParts - parts.length)).fill(null);

  return (
    <div className="bg-gray-700 p-3 rounded-xl shadow-inner max-h-24 overflow-hidden flex flex-row gap-2 relative"> {/* relativeを追加してabsoluteな子要素の基準にする */}
      {/* 装着済みのパーツの画像を表示 */}
      {parts.map(part => (
        <div
          key={part.name}
          className="w-16 h-16 bg-gray-500 rounded overflow-hidden relative cursor-pointer flex-shrink-0"
          onClick={() => onRemove(part)}
          title={`「${part.name}」を外す`}
        >
          <img
            src={`/images/parts/${part.name}.jpg`}
            alt={part.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/images/parts/default.jpg'; // フォールバック画像
            }}
          />
          {/* 外すボタンを重ねて表示 */}
          <div className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 transition-colors duration-200">
            ✕
          </div>
        </div>
      ))}
      {/* 空のスロットを表示 */}
      {emptySlots.map((_, index) => (
        <div
          key={`empty-${index}`}
          className="w-16 h-16 bg-gray-800 rounded overflow-hidden flex items-center justify-center text-gray-600 flex-shrink-0"
          title="空きスロット"
        >
          <span className="text-2xl">+</span>
        </div>
      ))}

      {/* パーツ全削除ボタンをここに配置 */}
      <div className="absolute right-3 top-3 bottom-3 flex items-center"> {/* 右端に固定 */}
        <button
          onClick={onClearAllParts}
          className="p-2 bg-gray-600 hover:bg-red-700 rounded-lg text-white text-xs flex flex-col items-center justify-center transition-colors duration-200"
          title="全てのカスタムパーツを解除"
        >
          <span role="img" aria-label="ゴミ箱" className="text-3xl">🗑️</span>
          <span>全解除</span>
        </button>
      </div>
    </div>
  );
};

export default SelectedPartDisplay;