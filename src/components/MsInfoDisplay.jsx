import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './PickedMs.module.css';

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

// 画像名正規化関数（MSSelector と同じロジック）
const normalizeImageName = (name) => {
  return name
    .replace(/[ΖζＺｚZz]/g, 'Z')
    .replace(/[ΝνＶｖVv]/g, 'V')
    .replace(/[ΑαＡａAa]/g, 'A')
    .replace(/[ΣσＳｓSs]/g, 'S')
    .replace(/[ΕεＥｅEe]/g, 'E')
    .replace(/[ΩωＯｏOo]/g, 'O');
};

// 複数パターンの画像パスを生成
const generateImagePaths = (baseName) => {
  const normalized = normalizeImageName(baseName);
  const paths = [
    `/images/ms/${baseName}.webp`,      // 元の名前
    `/images/ms/${normalized}.webp`,    // 正規化後
  ];
  
  // 重複を除去
  return [...new Set(paths)];
};

// ...existing code...
const MSImageDisplay = ({ baseName, msName }) => {
  const [currentPathIndex, setCurrentPathIndex] = useState(0);

  // baseNameが変わるたびにimagePathsを再生成
  const imagePaths = useMemo(() => generateImagePaths(baseName), [baseName]);

  // baseNameまたはmsNameが変わったらリセット
  useEffect(() => {
    setCurrentPathIndex(0);
  }, [baseName, msName]);

  const handleImageError = () => {
    if (currentPathIndex < imagePaths.length - 1) {
      setCurrentPathIndex(currentPathIndex + 1);
    } else {
      setCurrentPathIndex(-1);
    }
  };
  const currentSrc = currentPathIndex === -1 
    ? '/images/ms/default.webp' 
    : imagePaths[currentPathIndex];
  return (
    <img
      src={currentSrc}
      alt={msName}
      className="ms-img-card cursor-pointer"
      onError={handleImageError}
    />
  );
};
// ...existing code...

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
  msData,
  handleMsSelect,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  if (!selectedMs) {
    return null;
  }

  // 同名・同属性の他レベル（コスト違い）MSを抽出
  const baseMsName = (selectedMs["MS名"] ?? '').replace(/_LV\d+$/, '').trim();
  const msType = selectedMs.属性;
  const relatedMsList = (msData || []).filter(ms => {
    const name = (ms["MS名"] ?? '').replace(/_LV\d+$/, '').trim();
    return name === baseMsName && ms.属性 === msType;
  }).sort((a, b) => Number(a.コスト) - Number(b.コスト));
  // コスト順で並べる
  const currentCost = String(selectedMs.コスト);

  return (
    <>
      {/* <div className="msrow-card-shape flex items-center gap-4 p-3"> */}
  <div className={styles.msInfoInnerWrapper + " flex items-center gap-4 p-3"}>
        <style>{`
          // .msrow-card-shape {
          //   background: rgba(0,0,0,0.5);
          //   border: none;
          //   box-shadow: none;
          //   border-radius: 0;
          //   clip-path: polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%);
          //   transition: background 0.18s, box-shadow 0.18s, border-color 0.18s, transform 0.18s;
          // }
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
          <Link 
            to="/" 
            onClick={onMsImageClick}
            className="inline-block"
            title="MSを再選択"
          >
            <MSImageDisplay
              baseName={baseName}
              msName={selectedMs["MS名"]}
            />
          </Link>
        </div>
        <div className="flex flex-col flex-grow">
          <div className="flex items-center mb-1">
            {/* コスト選択六角形群（外観調整） */}
            {relatedMsList.map(ms => {
              const costStr = String(ms.コスト);
              const isCurrent = costStr === currentCost;
              // アクティブなコストのみ属性＋上下ボーダー＋色付き
              // 非アクティブはコストのみ・ボーダーなし・文字小さめ・抑揚強化
              // 属性ごとにボーダー色を決定
              let borderTop = '', borderBottom = '';
              if (isCurrent) {
                if (ms.属性 === '強襲') {
                  borderTop = borderBottom = '#ef4444';
                } else if (ms.属性 === '汎用') {
                  borderTop = borderBottom = '#3b82f6';
                } else if (ms.属性 === '支援' || ms.属性 === '支援攻撃') {
                  borderTop = borderBottom = '#facc15';
                }
              }
              return isCurrent ? (
                <button
                  key={costStr}
                  className={`ms-badge-hex flex-shrink-0 hex-main`}
                  data-type={ms.属性}
                  style={{
                    opacity: 1,
                    border: 'none',
                    background: '#353942',
                    cursor: 'default',
                    minWidth: 0,
                    padding: '0.2em 1.1em',
                    boxShadow: '0 2px 8px #0003',
                    color: '#fff',
                    borderTop: `3px solid ${borderTop}`,
                    borderBottom: `3px solid ${borderBottom}`,
                  }}
                  disabled={true}
                  title="選択中"
                >
                  {`${ms.属性}：${costStr}`}
                </button>
              ) : (
                <Link
                  key={costStr}
                  to={`/${encodeURIComponent(ms["MS名"])}`}
                  className={`ms-badge-hex flex-shrink-0 hex-side`}
                  style={{
                    opacity: 0.7,
                    border: 'none',
                    background: '#23272e',
                    cursor: 'pointer',
                    minWidth: 28,
                    padding: '0.08em 0.7em',
                    boxShadow: '0 1px 4px #0002',
                    color: '#fff',
                    fontSize: '1em',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                  onClick={() => handleMsSelect(ms)}
                  title={costStr}
                >
                  {costStr}
                </Link>
              );
            })}
            <style>{`
              .ms-badge-hex {
                display: inline-block;
                clip-path: polygon(18% 0%, 82% 0%, 100% 50%, 82% 100%, 18% 100%, 0% 50%);
                margin: 0 2px;
                letter-spacing: 0.05em;
                transition: box-shadow 0.18s, background 0.18s, color 0.18s, transform 0.18s;
              }
              /* アクティブのみ上下ボーダー色付き */
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
              .hex-main {
                font-size: 1.15em;
                font-weight: bold;
                z-index: 2;
              }
              .hex-side {
                font-size: 1em;
                z-index: 1;
                color: #fff;
                transition: background 0.25s, color 0.25s, box-shadow 0.25s, border 0.25s;
                animation: hexSideBlink 2.2s infinite linear;
              }
              @keyframes hexSideBlink {
                0% { background: #181a20; }
                50% { background: #fb923c; }
                100% { background: #181a20; }
              }
              .hex-side:not(:disabled):hover {
                background: #fb923c !important;
                color: #fff !important;
                box-shadow: 0 0 16px #fb923c, 0 2px 12px #0008;
                border: 2px solid #fb923c;
                outline: none;
              }
            `}</style>
          </div>
          <span className={styles.msNameText + " text-xl text-gray-200 leading-tight"}>{selectedMs["MS名"]}</span>
        </div>

  <div className={styles.msInfoDetailSection + " flex flex-col items-start gap-1 text-gray-200 text-base ml-4"}>
          {/* 3段階選択トグル */}
<div className={styles.msToggleRow}>
  <span
    className="text-md cursor-pointer select-none text-orange-400 hover:text-orange-200 transition-colors duration-200"
    onClick={() => {
      if (isFullStrengthened === 6) {
        setIsFullStrengthened(4);
      } else if (isFullStrengthened === 4) {
        setIsFullStrengthened(0);
      }
      // 零の場合は無反応
    }}
    tabIndex={0}
    role="button"
  >
    ◀
  </span>
<button
  type="button"
  className="relative flex items-center justify-center shadow-lg focus:outline-none hex-toggle"
  onClick={(e) => {
    // クリック位置を取得
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const centerX = rect.width / 2; // 四の位置（中央）
    const isLeftSide = clickX < centerX;
    
    if (isFullStrengthened === 0) {
      // 零の状態では右側クリックのみ反応（四へ）
      if (!isLeftSide) {
        setIsFullStrengthened(4);
      }
    } else if (isFullStrengthened === 4) {
      // 四の状態では左右どちらでも反応
      if (isLeftSide) {
        setIsFullStrengthened(0); // 左側クリックで零へ
      } else {
        setIsFullStrengthened(6); // 右側クリックで完へ
      }
    } else if (isFullStrengthened === 6) {
      // 完の状態では左側クリックのみ反応（四へ）
      if (isLeftSide) {
        setIsFullStrengthened(4);
      }
    }
  }}
  aria-pressed={true}
  tabIndex={0}
  style={{
    width: 64,
    height: 24,
    background: '#444',
    padding: 0,
    transition: 'background 0.3s',
    clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)',
    overflow: 'hidden',
    cursor: 'pointer'
  }}
>
  {/* 常時オレンジの六角形ノブ */}
  <span
    className="absolute flex items-center justify-center"
    style={{
      top: 0,
      left: isFullStrengthened === 0 ? 0 : isFullStrengthened === 4 ? 16 : 32,
      width: 32,
      height: 24,
      background: '#f59e42', // 常時オレンジ
      transition: 'left 0.3s',
      clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
    }}
  >
    {/* ボタン内の白文字表示 */}
    <span className="text-white text-sm font-bold" style={{ zIndex: 10, textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.6)' }}>
      {isFullStrengthened === 0 ? '零' : isFullStrengthened === 4 ? '四' : '完'}
    </span>
  </span>
</button>
  <span
    className="text-md cursor-pointer select-none text-orange-400 hover:text-orange-200 transition-colors duration-200"
    onClick={() => {
      if (isFullStrengthened === 0) {
        setIsFullStrengthened(4);
      } else if (isFullStrengthened === 4) {
        setIsFullStrengthened(6);
      }
      // 完の場合は無反応
    }}
    tabIndex={0}
    role="button"
  >
    ▶
  </span>
</div>
          <div className="flex items-center gap-2">
            <label htmlFor="expansion-select" className={styles.expansionLabel + " whitespace-nowrap"}>拡張</label>
            <select
              id="expansion-select"
              value={expansionType}
              onChange={(e) => setExpansionType(e.target.value)}
              className={styles.expansionSelect + " block py-2 px-3 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-200 w-auto"}
            >
              {expansionOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
  <div className={styles.expansionTextCard + " msrow-card-shape p-3 text-gray-200 text-base text-center mt-2"}>
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
        {isMobile ? (
          <span className="text-md text-gray-200 text-center mx-auto max-w-lg">
            {(expansionDescriptions[expansionType] || "説明がありません").replace(/<br\s*\/?>(\n)?/gi, '')}
          </span>
        ) : (
          <div
            className="text-md text-gray-200 text-center mx-auto max-w-lg"
            dangerouslySetInnerHTML={{
              __html: expansionDescriptions[expansionType] || "説明がありません"
            }}
          />
        )}
      </div>
    </>
  );
};

export default MsInfoDisplay;