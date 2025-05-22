// src/components/SelectedPartDisplay.jsx
import React from 'react';

const SelectedPartDisplay = ({ parts, onRemove }) => {
  if (!parts || parts.length === 0) {
    return <p className="text-gray-400">パーツは装着されていません。</p>;
  }

  return (
    <div className="bg-gray-700 p-3 rounded-xl shadow-inner max-h-60 overflow-y-auto custom-scrollbar">
      {parts.map(part => (
        <div
          key={part.name}
          className="flex items-center justify-between p-2 my-1 bg-gray-600 rounded-md shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-500 rounded overflow-hidden flex-shrink-0">
              <img
                src={`/images/parts/${part.name}.jpg`}
                alt={part.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/images/parts/default.jpg'; // フォールバック画像
                }}
              />
            </div>
            <span className="text-sm font-medium text-white">{part.name}</span>
          </div>
          <button
            onClick={() => onRemove(part)}
            className="text-red-400 hover:text-red-300 ml-2"
            title="パーツを削除"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default SelectedPartDisplay;