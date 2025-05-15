// src/components/SlotDisplay.jsx
import React from 'react';

const SlotDisplay = ({ parts = [], onRemove }) => {
  return (
    <div className="space-y-2">
      {parts.length > 0 && <div className="text-lg font-semibold">装着中のカスタムパーツ</div>}
      <div className="space-y-2">
        {parts.map((part, index) => (
          <div key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded hover:bg-gray-700 transition">
            <span>{part.name}</span>
            <button onClick={() => onRemove(part)} className="text-xs text-red-400 hover:text-red-300">削除</button>
          </div>
        ))}
        {parts.length === 0 && <p className="text-gray-500 text-sm">装着中のパーツはありません</p>}
      </div>
    </div>
  );
};


export default SlotDisplay;