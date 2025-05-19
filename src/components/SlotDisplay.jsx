// src/components/SlotDisplay.jsx
import React from 'react';

const SlotDisplay = ({ parts, onRemove }) => {
  return (
    <div className="space-y-2">
      {parts.length === 0 ? (
        <p className="text-gray-400">未装着</p>
      ) : (
        parts.map((part) => (
          <div
            key={part.name}
            className="flex items-center justify-between bg-gray-800 p-2 rounded-md"
          >
            <span>{part.name}</span>
            <button
              onClick={() => onRemove(part)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              削除
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default SlotDisplay;