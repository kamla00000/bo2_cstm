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
      <div className="msrow-card-shape flex items-center gap-4 p-3">
        <style>{`
          .msrow-card-shape {
            background: rgba(0,0,0,0.5);
            border: none;
            box-shadow: none;
            border-radius: 0;
            clip-path: polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%);
            transition: background 0.18s, box-shadow 0.18s, border-color 0.18s, transform 0.18s;
          }
          .ms-imgbox-card {
            width: 4rem;
            height: 4rem;
            aspect-ratio: 1 / 1;
            position: relative;
            overflow: hidden;
            background: none;
            border: none;
            border-radius: 0;
            box-shadow: none;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .ms-imgbox-card .ms-img-card {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            background: none;
            border: none;
            border-radius: 0;
            box-shadow: none;
            transition: filter 0.18s, transform 0.18s, opacity 0.18s;
            transform: scale(1);
            display: block;
          }
          .ms-imgbox-card:hover .ms-img-card {
            transform: scale(1.25);
          }
        `}</style>
        <div className="ms-imgbox-card">
          <img
            src={`/images/ms/${baseName}.webp`}
            alt={selectedMs["MS名"]}
            className="ms-img-card cursor-pointer"
            onClick={onMsImageClick}
            onError={(e) => {
              console.error(`MsInfoDisplay: Image load error for: /images/ms/${baseName}.webp`);
              e.target.src = '/images/ms/default.webp';
              e.target.onerror = null;
            }}
            title="MSを再選択"
          />
        </div>
        <div className="flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="ms-badge-hex text-base flex-shrink-0"
              data-type={selectedMs.属性}
            >
              {selectedMs.属性}：{selectedMs.コスト}
            </span>
            <style>{`
              .ms-badge-hex {
                display: inline-block;
                padding: 0.2em 1.1em;
                clip-path: polygon(18% 0%, 82% 0%, 100% 50%, 82% 100%, 18% 100%, 0% 50%);
                margin: 0 2px;
                box-shadow: 0 2px 8px #0003;
                letter-spacing: 0.05em;
                background: #353942;
                color: #fff;
                border-top: 3px solid transparent;
                border-bottom: 3px solid transparent;
                transition: box-shadow 0.18s, background 0.18s, color 0.18s, transform 0.18s;
              }
              .ms-badge-hex[data-type="強襲"] {
                border-top: 3px solid #ef4444;
                border-bottom: 3px solid #ef4444;
              }
              .ms-badge-hex[data-type="汎用"] {
                border-top: 3px solid #3b82f6;
                border-bottom: 3px solid #3b82f6;
              }
              .ms-badge-hex[data-type="支援"],
              .ms-badge-hex[data-type="支援攻撃"] {
                border-top: 3px solid #facc15;
                border-bottom: 3px solid #facc15;
              }
            `}</style>
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
      <div className="msrow-card-shape p-3 text-gray-200 text-base text-center mt-2">
        <style>{`
          .msrow-card-shape {
            background: rgba(0,0,0,0.5);
            border: none;
            box-shadow: none;
            border-radius: 0;
            clip-path: polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%);
            transition: background 0.18s, box-shadow 0.18s, border-color 0.18s, transform 0.18s;
          }
        `}</style>
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