import React from 'react';

// 属性ごとに色を返す関数をこのファイル内に記述
const getTypeColor = (type) => {
  switch (type) {
    case '強襲':
      return '#e53935'; // 赤
    case '汎用':
      return '#1e88e5'; // 青
    case '支援':
      return '#eab308'; // 黄
    default:
      return '#444';    // デフォルト
  }
};

const MsInfoDisplay = ({
  selectedMs,
  baseName,
  isFullStrengthened,
  setIsFullStrengthened,
  expansionType,
  setExpansionType,
  expansionOptions,
  expansionDescriptions,
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
            className="w-full h-full object-cover cursor-pointer transition hover:opacity-20 hover:scale-125"
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
              className="hex-badge text-base flex-shrink-0"
              style={{
                background: getTypeColor(selectedMs.属性),
                color: '#fff'
              }}
            >
              {selectedMs.属性}：{selectedMs.コスト}
            </span>
          </div>
          <span className="text-xl text-gray-200 leading-tight">{selectedMs["MS名"]}</span>
        </div>

        <div className="flex flex-col items-start gap-1 text-gray-200 text-base ml-4">
          {/* スライドトグル */}
<div className="flex items-center gap-2">
  <span
    className={`text-md cursor-pointer select-none ${!isFullStrengthened ? 'text-orange-400' : 'text-gray-400'}`}
    onClick={() => setIsFullStrengthened(false)}
    tabIndex={0}
    role="button"
    aria-pressed={!isFullStrengthened}
    style={{ minWidth: 48, textAlign: 'center' }}
  >
    未強化
  </span>
<button
  type="button"
  className="relative flex items-center justify-center shadow-lg focus:outline-none hex-toggle"
  onClick={() => setIsFullStrengthened(!isFullStrengthened)}
  aria-pressed={isFullStrengthened}
  tabIndex={0}
  style={{
    width: 64,
    height: 24,
    background: '#444',
    padding: 0,
    transition: 'background 0.3s',
    clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)',
    overflow: 'hidden'
  }}
>
  {/* スライドする六角形ノブ */}
  <span
    className="absolute"
    style={{
      top: 0,
      left: isFullStrengthened ? 32 : 0, // 64/2=32
      width: 32,
      height: 24,
      background: isFullStrengthened ? '#f59e42' : '#d1d5db',
      transition: 'left 0.3s, background 0.3s',
      clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
    }}
  />
</button>
  <span
    className={`text-md cursor-pointer select-none ${isFullStrengthened ? 'text-orange-400' : 'text-gray-400'}`}
    onClick={() => setIsFullStrengthened(true)}
    tabIndex={0}
    role="button"
    aria-pressed={isFullStrengthened}
    style={{ minWidth: 48, textAlign: 'center' }}
  >
    フル強化
  </span>
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