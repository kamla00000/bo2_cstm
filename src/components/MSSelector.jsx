import React, { useState, useEffect } from 'react';
import styles from './MSSelector.module.css';
const COSTS = [750, 700, 650, 600, 550, 500, 450];
const TYPES = ['強襲', '汎用', '支援'];

const TYPE_ORDER = {
  '強襲': 0,
  '汎用': 1,
  '支援': 2,
};

const MSSelector = ({
  msData,
  onSelect,
  selectedMs,
  filterType,
  setFilterType,
  filterCost,
  setFilterCost,
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredMs, setFilteredMs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 画像名正規化関数（検索と同じロジック）
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

  // MS画像コンポーネント（複数パターンを試す）
  const MSImage = ({ baseName, msName, isSelected }) => {
    const [currentPathIndex, setCurrentPathIndex] = useState(0);
    const [imagePaths] = useState(() => generateImagePaths(baseName));

    const handleImageError = () => {
      if (currentPathIndex < imagePaths.length - 1) {
        setCurrentPathIndex(currentPathIndex + 1);
      } else {
        // 全てのパターンが失敗した場合はdefault.webpに切り替え
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
        className={`ms-img-card transition ${isSelected ? 'selected' : ''}`}
        onError={handleImageError}
      />
    );
  };

  useEffect(() => {
    if (!msData || !Array.isArray(msData)) {
      setFilteredMs([]);
      return;
    }

    let results = msData.filter((ms) => {
      const msType = String(ms.属性 ?? '').trim();
      const msCost = String(ms.コスト ?? '').trim();
      const msName = String(ms["MS名"] ?? '').trim();

      // タイプフィルタ
      const matchesType = !filterType || msType === filterType;
      // コストフィルタ
      const matchesCost =
        !filterCost ||
        msCost === filterCost ||
        (filterCost === 'low' && Number(msCost) <= 400);
      // 名前検索（部分一致・大文字小文字・全角半角・ひらがなカタカナ区別なし＋ギリシャ文字・英字ゆるく）
      const toHiragana = (str) => str.replace(/[\u30a1-\u30f6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
      
      // ギリシャ文字⇔英字ゆる変換（検索を緩くするため）
      const normalizeAlphabet = (str) => {
        return str
          .replace(/[ΖζＺｚZz]/g, 'z')
          .replace(/[ΝνＶｖVv]/g, 'v')
          .replace(/[ΑαＡａAa]/g, 'a')
          .replace(/[ΣσＳｓSs]/g, 's')
          .replace(/[ΕεＥｅEe]/g, 'e')
          .replace(/[ΩωＯｏOo]/g, 'o');
      };
      
      const normalize = (str) => {
        return normalizeAlphabet(
          toHiragana(
            str.toLowerCase()
              .replace(/[\u0009\s　]/g, '')
              .normalize('NFKC')
          )
        );
      };
      
      const matchesSearch =
        !searchText ||
        normalize(msName).includes(normalize(searchText));

        return matchesType && matchesCost && matchesSearch;
    });

    // 重複排除（スクロール挙動確認用に一時コメントアウト）
    const seen = new Set();
    results = results.filter(ms => {
      const key = `${ms["MS名"]}_${ms.コスト}_${ms.属性}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // ソート
    results.sort((a, b) => {
      if (b.コスト !== a.コスト) {
        return b.コスト - a.コスト;
      }
      const aType = TYPE_ORDER[String(a.属性).trim()] ?? 99;
      const bType = TYPE_ORDER[String(b.属性).trim()] ?? 99;
      if (aType !== bType) {
        return aType - bType;
      }
      const nameA = a["MS名"] ?? '';
      const nameB = b["MS名"] ?? '';
      return nameA.localeCompare(nameB, 'ja');
    });

    setFilteredMs(results);
    setIsLoading(false);
  }, [filterType, filterCost, searchText, msData]);

  const getTypeColor = (type) => {
    switch (type) {
      case '強襲':
        return 'bg-red-500 text-gray-200';
      case '汎用':
        return 'bg-blue-500 text-gray-200';
      case '支援':
      case '支援攻撃':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-700 text-gray-200';
    }
  };

  const handleMsSelect = (ms) => {
    onSelect(ms);
  };

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-start ${styles.msselectorRoot}`}> 
  <div className={`w-full flex flex-col gap-2 px-[10px] ${styles.msselectorMainInner}`}> 
  <div className={`w-full msselector-filter-row flex flex-row flex-wrap gap-3 items-center mb-2 ${styles.msselectorFilterRow}`}> 
          <div className={`${styles['msselector-filter-group']} ${styles.zokusei}`}> 
            <button
              onClick={() => setFilterType('')}
              className={`hex-filter-btn text-lg sm:text-xl transition ${filterType === '' ? 'hex-filter-btn-active' : ''}`}
            >全属性</button>
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`hex-filter-btn text-lg sm:text-xl transition ${filterType === type ? 'hex-filter-btn-active' : ''}`}
              >{type}</button>
            ))}
          </div>
          <div className={`${styles['msselector-filter-group']} ${styles.cost}`}> 
            <button
              onClick={() => setFilterCost('')}
              className={`hex-filter-btn text-lg sm:text-xl transition ${filterCost === '' ? 'hex-filter-btn-active' : ''}`}
            >全コスト</button>
            {COSTS.map((cost) => (
              <button
                key={cost}
                onClick={() => setFilterCost(String(cost))}
                className={`hex-filter-btn text-lg sm:text-xl transition ${filterCost === String(cost) ? 'hex-filter-btn-active' : ''}`}
              >{cost}</button>
            ))}
            <button
              onClick={() => setFilterCost('low')}
              className={`hex-filter-btn text-lg sm:text-xl transition ${filterCost === 'low' ? 'hex-filter-btn-active' : ''}`}
              style={{ minWidth: 0 }}
            >低</button>
          </div>
          <div className={`${styles['msselector-filter-group']} ${styles.kensaku} msselector-search-box ml-2 relative flex items-center`}>
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="MS名で検索"
              className="search-input px-2 py-1 text-lg sm:text-xl bg-gray-900 text-gray-200 border border-gray-600 pr-8"
              style={{ minWidth: 120, maxWidth: 155, textDecoration: 'none' }}
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText('')}
                className="clear-search-btn absolute right-2 top-1/2 -translate-y-1/2 focus:outline-none"
                tabIndex={-1}
                aria-label="検索内容をクリア"
              >×</button>
            )}
          </div>
          <style>{`
            .hex-filter-btn {
              position: relative;
              padding: 0.5rem 1.2rem;
              background: #23272e;
              color: #f3f3f3;
              border: none;
              outline: none;
              clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
              margin: 0 2px;
              z-index: 1;
              border-top: 3px solid #fb923c;
              border-bottom: 3px solid #fb923c;
              border-left: none;
              border-right: none;
              box-shadow: 0 2px 8px #0004;
              transition: background 0.2s, color 0.2s;
            }
            .hex-filter-btn:hover, .hex-filter-btn-active {
              background: #b85c00;
              color: #fff;
            }
            .search-input:focus {
              outline: none;
              border-color: #ff9100 !important;
              box-shadow: 0 0 0 2px #ff910044;
            }
            .clear-search-btn {
              color: #ff9100;
              font-size: 1.7em;
              font-weight: bold;
              background: none;
              border: none;
              line-height: 1;
              padding: 0 2px;
              cursor: pointer;
              text-shadow: 0 0 4px #fff8, 0 0 2px #ff9100;
              transition: color 0.2s, text-shadow 0.2s;
            }
            .clear-search-btn:hover {
              color: #fff;
              text-shadow: 0 0 8px #ff9100, 0 0 2px #fff;
            }
            .scrollbar-thin {
              scrollbar-width: thin;
            }
            .scrollbar-thumb-gray-700::-webkit-scrollbar-thumb {
              background: #374151;
            }
            .scrollbar-track-gray-900::-webkit-scrollbar-track {
              background: #111827;
            }
          `}</style>
        </div>
        {/* MSリスト：複数列表示に更新 */}
  <div className={`w-full h-full ${styles.msListOuter}`}> 
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[75vh] custom-scrollbar ${styles['ms-list-container']}`}
            style={{ width: '100%', maxWidth: 'calc(100vw - 20px)', boxSizing: 'border-box', margin: '0 auto', overflowY: 'auto' }}
          >
            {filteredMs.length > 0 ? (
              filteredMs.map((ms) => {
                const isSelected = selectedMs && selectedMs["MS名"] === ms["MS名"];
                const baseName = (ms["MS名"] ?? '').replace(/_LV\d+$/, '').trim();

                return (
                  <div
                    key={`${ms["MS名"]}_${ms.コスト}_${ms.属性}`}
                    className={`ms-row-card-mecha cursor-pointer flex items-center gap-2 transition-all`}
                    onClick={() => handleMsSelect(ms)}
                    style={{
                      minHeight: 72,
                      border: 'none', // 罫線なし
                      padding: '0.3rem 0.2rem',
                      borderRadius: '0',
                      // clipPath: 'polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%)',
                      // backdropFilter: 'blur(12px)',
                      // WebkitBackdropFilter: 'blur(12px)',
                    }}
                  >
                    <div className="ms-imgbox-card relative w-16 h-16 flex-shrink-0 overflow-hidden transition" style={{ width: '4rem', height: '4rem', position: 'relative', overflow: 'hidden' }}>
                      <MSImage baseName={baseName} msName={ms["MS名"]} isSelected={isSelected} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span
                          className={`ms-badge-hex flex-shrink-0 text-right`}
                          data-type={ms.属性}
                        >
                          {`${ms.属性}：${ms.コスト}`}
                        </span>
                        <style>{`
                          .ms-row-card-mecha {
                            background: rgba(0,0,0,0.5);
                            border: none;
                            box-shadow: 0 2px 8px #0003;
                            padding: 0.3rem 0.2rem;
                            border-radius: 0;
                            /* 右上の角を45度でカット（小さめ） */
                            clip-path: polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%);
                            transition: background 0.18s, box-shadow 0.18s, border-color 0.18s, transform 0.18s;
                            /* すりガラス効果は削除 */
                          }
                          .ms-row-card-mecha:hover {
                            background: rgba(0,0,0,0.32);
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
                          .ms-row-card-mecha:hover .ms-imgbox-card .ms-img-card {
                            transform: scale(1.25);
                          }
                          .ms-row-card-mecha:hover .ms-name {color: #fff;
                            text-shadow: 0 0 8px #fff, 0 0 2px #fff;
                          }
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
                      <span className={`block truncate text-white ${styles.msName}`} style={{
                        textShadow: '0 3px 16px #000, 0 0 0px #000, 0 1px 0 #000'
                      }}>{ms["MS名"]}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              isLoading ? (
                <div className="w-full flex flex-col items-center justify-center py-8 col-span-full">
                  <div className="flex space-x-2 mb-4">
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-gray-300">MSデータをロード中...</span>
                </div>
              ) : (
                <p className="text-gray-200 text-center py-8 col-span-full">該当するMSが見つかりません。</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MSSelector;