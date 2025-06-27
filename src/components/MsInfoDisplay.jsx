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
  getTypeColor,
  onMsImageClick, // 画像クリック時のハンドラ
}) => {
  if (!selectedMs) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-md shadow-inner border border-gray-700">
        <div className="w-16 h-16 bg-gray-700 overflow-hidden flex-shrink-0">
          <img
            src={`/images/ms/${baseName}.jpg`}
            alt={selectedMs["MS名"]}
            className="w-full h-full object-cover cursor-pointer transition hover:opacity-80"
            onClick={onMsImageClick}
            onError={(e) => {
              console.error(`MsInfoDisplay: Image load error for: /images/ms/${baseName}.jpg`);
              e.target.src = '/images/ms/default.jpg';
              e.target.onerror = null;
            }}
            title="MSを再選択"
          />
        </div>
        <div className="flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-3 py-1 rounded-full text-sm ${getTypeColor(selectedMs.属性)} flex-shrink-0`}
            >
              {selectedMs.属性}
            </span>
            <span className="text-base text-gray-200 whitespace-nowrap">
              コスト: {selectedMs.コスト}
            </span>
          </div>
          <span className="text-xl font-bold text-gray-200 leading-tight">{selectedMs["MS名"]}</span>
        </div>

        <div className="flex flex-col items-start gap-1 text-gray-200 text-base ml-4">
          {/* スライドトグル */}
          <div className="flex items-center gap-2">
            <span className={`text-sm ${!isFullStrengthened ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>未強化</span>
            <button
              type="button"
              className={`relative w-14 h-7 bg-gray-600 rounded-full transition-colors duration-300 focus:outline-none`}
              onClick={() => setIsFullStrengthened(!isFullStrengthened)}
              aria-pressed={isFullStrengthened}
              tabIndex={0}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform duration-300
                  ${isFullStrengthened ? 'bg-blue-500 translate-x-7' : 'bg-gray-300 translate-x-0'}
                `}
                style={{
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                }}
              />
            </button>
            <span className={`text-sm ${isFullStrengthened ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>フル強化</span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="expansion-select" className="whitespace-nowrap">拡張選択:</label>
            <select
              id="expansion-select"
              value={expansionType}
              onChange={(e) => setExpansionType(e.target.value)}
              className="block py-2 px-3 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-200 w-auto"
            >
              {expansionOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 p-3 rounded-md shadow-inner border border-gray-700 text-gray-200 text-base text-center">
        <div
          className="text-md text-gray-200 text-center mx-auto max-w-lg"
          dangerouslySetInnerHTML={{
            __html: expansionDescriptions[expansionType] || "説明がありません"
          }}
        />
      </div>
    </>
  );
};

export default MsInfoDisplay;