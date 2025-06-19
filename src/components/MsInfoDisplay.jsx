// src/components/MsInfoDisplay.jsx
import React from 'react';

const MsInfoDisplay = ({
  selectedMs,
  baseName,
  isFullStrengthened,
  setIsFullStrengthened,
  expansionType,
  setExpansionType,
  expansionOptions,
  expansionDescriptions,
  getTypeColor
}) => {
  if (!selectedMs) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-xl shadow-inner border border-gray-700">
        <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={`/images/ms/${baseName}.jpg`}
            alt={selectedMs["MS名"]}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error(`MsInfoDisplay: Image load error for: /images/ms/${baseName}.jpg`);
              e.target.src = '/images/ms/default.jpg';
              e.target.onerror = null;
            }}
          />
        </div>
        <div className="flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-3 py-1 rounded-full text-sm ${getTypeColor(selectedMs.属性)} flex-shrink-0`}
            >
              {selectedMs.属性}
            </span>
            <span className="text-base text-gray-400 whitespace-nowrap">
              コスト: {selectedMs.コスト}
            </span>
          </div>
          <span className="text-2xl font-bold text-white leading-tight">{selectedMs["MS名"]}</span>
        </div>

        <div className="flex flex-col items-start gap-1 text-white text-base ml-4">
          <label className="flex items-center text-white text-base cursor-pointer">
            <input
              type="checkbox"
              checked={isFullStrengthened}
              onChange={(e) => setIsFullStrengthened(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 rounded mr-2 focus:ring-blue-500"
            />
            フル強化
          </label>
          <div className="flex items-center gap-2">
            <label htmlFor="expansion-select" className="whitespace-nowrap">拡張選択:</label>
            <select
              id="expansion-select"
              value={expansionType}
              onChange={(e) => setExpansionType(e.target.value)}
              className="block py-2 px-3 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white w-auto"
            >
              {expansionOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 p-3 rounded-xl shadow-inner border border-gray-700 text-white text-base text-center">
        {/* max-w-sm を max-w-md に変更 */}
        <p className="text-md text-white text-center mx-auto max-w-md">
          {expansionDescriptions[expansionType] || "説明がありません"}
        </p>
      </div>
    </>
  );
};

export default MsInfoDisplay;