// src/App.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import MSSelector from './components/MSSelector';
import PartList from './components/PartList';
import StatusDisplay from './components/StatusDisplay';
import SlotSelector from './components/SlotSelector';
import SelectedPartDisplay from './components/SelectedPartDisplay';

function App() {
  const [msData, setMsData] = useState([]);
  const [partData, setPartData] = useState([]);
  const allPartsCache = useRef({});
  const [selectedMs, setSelectedMs] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [filterCategory, setFilterCategory] = useState('防御');
  const [isFullStrengthened, setIsFullStrengthened] = useState(false); // フル強化の状態
  const [expansionType, setExpansionType] = useState('無し'); // 拡張選択の状態

  const categories = [
    { name: '防御', fileName: 'defensive_parts.json' },
    { name: '攻撃', fileName: 'offensive_parts.json' },
    { name: '移動', fileName: 'moving_parts.json' },
    { name: '補助', fileName: 'support_parts.json' },
    { name: '特殊', fileName: 'special_parts.json' }
  ];
  const allCategoryName = 'すべて';

  const expansionOptions = [
    "無し",
    "射撃補正拡張",
    "格闘補正拡張",
    "耐実弾補正拡張",
    "耐ビーム補正拡張",
    "耐格闘補正拡張",
    "スラスター拡張",
    "カスタムパーツ拡張[HP]",
    "カスタムパーツ拡張[攻撃]",
    "カスタムパーツ拡張[装甲]",
    "カスタムパーツ拡張[スラスター]",
  ];

  const expansionDescriptions = {
    "無し": "拡張スキルなし",
    "射撃補正拡張": "射撃補正が8増加し、射撃補正の上限値が8増加する",
    "格闘補正拡張": "格闘補正が8増加し、格闘補正の上限値が8増加する",
    "耐実弾補正拡張": "耐実弾補正が10増加し、耐実弾補正の上限値が10増加する",
    "耐ビーム補正拡張": "耐ビーム補正が10増加し、耐ビーム補正の上限値が10増加する",
    "耐格闘補正拡張": "耐格闘補正が10増加し、耐格闘補正の上限値が10増加する",
    "スラスター拡張": "スラスターが10増加し、スラスターの上限値が20増加する",
    "カスタムパーツ拡張[HP]": "「攻撃」タイプのカスタムパーツを1つ装備するごとに機体HPが400上昇する",
    "カスタムパーツ拡張[攻撃]": "「移動」タイプのカスタムパーツを1つ装備するごとに格闘補正が3、射撃補正が3上昇する",
    "カスタムパーツ拡張[装甲]": "「補助」タイプのカスタムパーツを1つ装備するごとに耐実弾補正が3、耐ビーム補正が3、耐格闘補正が3増加する",
    "カスタムパーツ拡張[スラスター]": "「特殊」タイプのカスタムパーツを1つ装備するごとにスラスターが5増加する",
  };

  // --- データ読み込みロジック ---

  useEffect(() => {
    fetch('/data/msData.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setMsData(data))
      .catch(error => console.error("MSデータ読み込みエラー:", error));
  }, []);

  const loadAllPartsIntoCache = useCallback(async () => {
    const promises = categories.map(async (cat) => {
      if (!allPartsCache.current[cat.name]) {
        try {
          const response = await fetch(`/data/${cat.fileName}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${cat.fileName}`);
          }
          const data = await response.json();
          allPartsCache.current[cat.name] = data;
        } catch (error) {
          console.error(`パーツデータ読み込みエラー (${cat.fileName}):`, error);
        }
      }
    });
    await Promise.all(promises);
  }, [categories]);

  useEffect(() => {
    const updateDisplayedParts = async () => {
      await loadAllPartsIntoCache();

      let loadedParts = [];
      if (filterCategory === allCategoryName) {
        for (const cat of categories) {
          if (allPartsCache.current[cat.name]) {
            loadedParts.push(...allPartsCache.current[cat.name]);
          }
        }
      } else {
        const targetCategory = categories.find(cat => cat.name === filterCategory);
        if (targetCategory && allPartsCache.current[targetCategory.name]) {
          loadedParts = allPartsCache.current[targetCategory.name];
        }
      }
      setPartData(loadedParts);
    };

    updateDisplayedParts();
  }, [filterCategory, categories, loadAllPartsIntoCache]);


  // --- 計算関数 ---

  const calculateSlotUsage = useCallback((ms, parts) => {
    if (!ms) return { close: 0, mid: 0, long: 0, maxClose: 0, maxMid: 0, maxLong: 0 };
    let usedClose = 0;
    let usedMid = 0;
    let usedLong = 0;
    parts.forEach(part => {
      usedClose += Number(part.close || 0);
      usedMid += Number(part.mid || 0);
      usedLong += Number(part.long || 0);
    });
    return {
      close: usedClose,
      mid: usedMid,
      long: usedLong,
      maxClose: Number(ms["近スロット"] || 0),
      maxMid: Number(ms["中スロット"] || 0),
      maxLong: Number(ms["遠スロット"] || 0)
    };
  }, []);

  const calculateMSStats = useCallback((ms, parts, isFullStrengthened, expansionType) => {
    if (!ms) {
      const defaultStats = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
      return { 
        base: defaultStats, 
        partBonus: { ...defaultStats }, 
        fullStrengthenBonus: { ...defaultStats }, 
        expansionBonus: { ...defaultStats }, 
        total: { ...defaultStats },
        rawTotal: { ...defaultStats }, // rawTotalも初期化
        currentLimits: { ...defaultStats, flags: {} } // currentLimitsも初期化
      };
    }

    const baseStats = {
      hp: Number(ms.HP || 0), armor: Number(ms.耐実弾補正 || 0), beam: Number(ms.耐ビーム補正 || 0), melee: Number(ms.耐格闘補正 || 0),
      shoot: Number(ms.射撃補正 || 0), meleeCorrection: Number(ms.格闘補正 || 0), speed: Number(ms.スピード || 0), thruster: Number(ms.スラスター || 0),
      turnPerformanceGround: Number(ms["旋回(地上)"] || 0), turnPerformanceSpace: Number(ms["旋回(宇宙)"] || 0)
    };

    // 基本的なステータス上限値を定義 (上限がないものはundefined)
    const baseLimits = { 
      hp: undefined, 
      armor: 50, 
      beam: 50, 
      melee: 50, 
      shoot: 100, 
      meleeCorrection: 100, 
      speed: 200, 
      thruster: 100, 
      turnPerformanceGround: undefined, 
      turnPerformanceSpace: undefined, 
    }; 

    // 各種ボーナスを初期化
    const partBonus = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
    const fullStrengthenBonus = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
    const expansionBonus = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
    
    // パーツによるボーナス
    parts.forEach(part => {
      // ここでパーツによる上限増加も考慮する場合は追加
      if (typeof part.hp === 'number') partBonus.hp += part.hp;
      if (typeof part.armor_range === 'number') partBonus.armor += part.armor_range;
      if (typeof part.armor_beam === 'number') partBonus.beam += part.armor_beam;
      if (typeof part.armor_melee === 'number') partBonus.melee += part.armor_melee;
      if (typeof part.shoot === 'number') partBonus.shoot += part.shoot;
      if (typeof part.melee === 'number') partBonus.meleeCorrection += part.melee;
      if (typeof part.speed === 'number') partBonus.speed += part.speed;
      if (typeof part.thruster === 'number') partBonus.thruster += part.thruster;
      if (typeof part.turnPerformanceGround === 'number') partBonus.turnPerformanceGround += part.turnPerformanceGround;
      if (typeof part.turnPerformanceSpace === 'number') partBonus.turnPerformanceSpace += part.turnPerformanceSpace;
    });

    // フル強化によるボーナス（仮の値、調整してください）
    if (isFullStrengthened) {
      fullStrengthenBonus.hp += 2500; // 仮
      fullStrengthenBonus.armor += 5; // 仮
      fullStrengthenBonus.beam += 5; // 仮
      fullStrengthenBonus.melee += 5; // 仮
      fullStrengthenBonus.shoot += 5; // 仮
      fullStrengthenBonus.meleeCorrection += 5; // 仮
      fullStrengthenBonus.speed += 5; // 仮
      fullStrengthenBonus.thruster += 5; // 仮
    }

    // 拡張選択によるステータスボーナス
    switch (expansionType) {
      case "射撃補正拡張":
        expansionBonus.shoot += 8;
        break;
      case "格闘補正拡張":
        expansionBonus.meleeCorrection += 8;
        break;
      case "耐実弾補正拡張":
        expansionBonus.armor += 10;
        break;
      case "耐ビーム補正拡張":
        expansionBonus.beam += 10;
        break;
      case "耐格闘補正拡張":
        expansionBonus.melee += 10;
        break;
      case "スラスター拡張":
        expansionBonus.thruster += 10;
        break;
      case "カスタムパーツ拡張[HP]":
        // カスタムパーツ拡張は直接HPを増やす（上限には影響しないという解釈）
        break;
      case "カスタムパーツ拡張[攻撃]":
        // カスタムパーツ拡張は格闘補正と射撃補正を増加（上限には影響しないという解釈）
        break;
      case "カスタムパーツ拡張[装甲]":
        // カスタムパーツ拡張は耐実弾、耐ビーム、耐格闘補正を増加（上限には影響しないという解釈）
        break;
      case "カスタムパーツ拡張[スラスター]":
        // カスタムパーツ拡張はスラスターを増加（上限には影響しないという解釈）
        break;
      default:
        break;
    }

    // 動的な上限値を計算 (baseLimitsをコピーし、変動を反映)
    const currentLimits = { ...baseLimits };
    const limitChangedFlags = {}; // 各ステータスの上限が変更されたかどうかのフラグ

    // 拡張による上限増加をcurrentLimitsに反映
    if (expansionType === "射撃補正拡張") { currentLimits.shoot = (currentLimits.shoot || baseLimits.shoot || 0) + 8; limitChangedFlags.shoot = true; }
    if (expansionType === "格闘補正拡張") { currentLimits.meleeCorrection = (currentLimits.meleeCorrection || baseLimits.meleeCorrection || 0) + 8; limitChangedFlags.meleeCorrection = true; }
    if (expansionType === "耐実弾補正拡張") { currentLimits.armor = (currentLimits.armor || baseLimits.armor || 0) + 10; limitChangedFlags.armor = true; }
    if (expansionType === "耐ビーム補正拡張") { currentLimits.beam = (currentLimits.beam || baseLimits.beam || 0) + 10; limitChangedFlags.beam = true; }
    if (expansionType === "耐格闘補正拡張") { currentLimits.melee = (currentLimits.melee || baseLimits.melee || 0) + 10; limitChangedFlags.melee = true; }
    if (expansionType === "スラスター拡張") { currentLimits.thruster = (currentLimits.thruster || baseLimits.thruster || 0) + 20; limitChangedFlags.thruster = true; }

    // カスタムパーツによる上限変動（もしあれば）
    parts.forEach(part => {
      // 仮のロジック: もしパーツに "上限増加" のようなプロパティがあれば
      // if (part.limitIncrease_shoot) { 
      //    currentLimits.shoot = (currentLimits.shoot || baseLimits.shoot || 0) + part.limitIncrease_shoot; 
      //    limitChangedFlags.shoot = true; 
      // }
      // if (part.limitIncrease_thruster) { 
      //    currentLimits.thruster = (currentLimits.thruster || baseLimits.thruster || 0) + part.limitIncrease_thruster; 
      //    limitChangedFlags.thruster = true; 
      // }
      // など、具体的な上限増加パーツがあれば追加してください
    });
    currentLimits.flags = limitChangedFlags; // 変更フラグをcurrentLimitsに追加

    // 最終的な合計値を上限でクリップ
    const totalStats = {}; // クリップ後の表示用合計値
    const rawTotalStats = {}; // クリップ前の純粋な合計値

    Object.keys(baseStats).forEach(key => {
      let calculatedValue = baseStats[key] + partBonus[key] + fullStrengthenBonus[key] + expansionBonus[key];
      rawTotalStats[key] = calculatedValue; // クリップ前の値を保持
      // 定義された上限値がある場合のみクリップ
      if (currentLimits[key] !== undefined && currentLimits[key] !== null) {
        totalStats[key] = Math.min(calculatedValue, currentLimits[key]);
      } else {
        totalStats[key] = calculatedValue;
      }
    });
    
    return {
        base: baseStats,
        partBonus: partBonus,
        fullStrengthenBonus: fullStrengthenBonus,
        currentLimits: currentLimits, // 計算された上限値を返す
        expansionBonus: expansionBonus, // expansionBonusも返す
        rawTotal: rawTotalStats, // クリップ前の合計値も返す
        total: totalStats,
    };
  }, []);

  const getUsageWithPreview = useCallback(() => {
    if (!selectedMs) return { close: 0, mid: 0, long: 0 };
    const usage = { ...calculateSlotUsage(selectedMs, selectedParts) };
    if (hoveredPart && !selectedParts.some(p => p.name === hoveredPart.name)) {
      usage.close += Number(hoveredPart.close || 0);
      usage.mid += Number(hoveredPart.mid || 0);
      usage.long += Number(hoveredPart.long || 0);
    }
    return usage;
  }, [selectedMs, hoveredPart, selectedParts, calculateSlotUsage]);

  const currentStats = calculateMSStats(selectedMs, selectedParts, isFullStrengthened, expansionType);
  const slotUsage = calculateSlotUsage(selectedMs, selectedParts);
  const usageWithPreview = getUsageWithPreview();


  // --- イベントハンドラ ---

  const handleMsSelect = useCallback((ms) => {
    setSelectedMs(ms);
    setSelectedParts([]);
    setHoveredPart(null);
    setIsFullStrengthened(false); // MS選択時にリセット
    setExpansionType('無し'); // MS選択時にリセット
  }, []);

  const handlePartSelect = useCallback((part) => {
    if (!selectedMs) {
      alert("先にモビルスーツを選択してください。");
      return;
    }

    if (selectedParts.some(p => p.name === part.name)) {
      alert("このパーツは既に装備されています。");
      return;
    }

    const currentSlots = calculateSlotUsage(selectedMs, selectedParts);
    const newClose = (currentSlots.close || 0) + (part.close || 0);
    const newMid = (currentSlots.mid || 0) + (part.mid || 0);
    const newLong = (currentSlots.long || 0) + (part.long || 0);

    if (newClose > (Number(selectedMs["近スロット"]) || 0) ||
        newMid > (Number(selectedMs["中スロット"]) || 0) ||
        newLong > (Number(selectedMs["遠スロット"]) || 0)) {
      return;
    }

    setSelectedParts(prevParts => [...prevParts, part]);
  }, [selectedMs, selectedParts, calculateSlotUsage]);

  const handlePartRemove = useCallback((partToRemove) => {
    setSelectedParts(prevParts => prevParts.filter(part => part.name !== partToRemove.name));
  }, []);

  const handleClearAllParts = useCallback(() => {
    setSelectedParts([]);
  }, []);

  // MSデータがまだ読み込まれていない場合は、ローディング表示
  if (msData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center justify-center">
        <p className="text-xl">データを読み込み中...</p>
      </div>
    );
  }

  // selectedMsから画像パスのベース名を取得
  const baseName = selectedMs ? selectedMs["MS名"].split('(')[0].trim() : 'default';

  // 属性ごとのカラー設定
  const getTypeColor = (type) => {
    switch (type) {
      case '強襲':
        return 'bg-red-500 text-white';
      case '汎用':
        return 'bg-blue-500 text-white';
      case '支援':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center gap-6">
      <h1 className="text-4xl font-bold tracking-wide text-white drop-shadow-lg">bo2-cstm</h1>

      {/* グリッドレイアウト: max-w-screen-xl を使用 (1280px) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full max-w-screen-xl items-stretch">
        {/* 左側のカラム：MS選択、MS基本情報、フル強化/拡張選択、スロット情報 */}
        <div className="space-y-4 md:col-span-3 flex flex-col">
          <MSSelector
            msData={msData}
            onSelect={handleMsSelect}
            selectedMs={selectedMs}
          />

          {/* MS基本情報（selectedMsが選択されている場合のみ表示） */}
          {selectedMs && (
            <>
              <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-xl shadow-inner border border-gray-700">
                {/* 画像 */}
                <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={`/images/ms/${baseName}.jpg`}
                    alt={selectedMs["MS名"]}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/ms/default.jpg';
                      e.target.onerror = null;
                    }}
                  />
                </div>
                {/* 名前 + 属性 + コスト */}
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

                {/* フル強化チェックボックスと拡張選択プルダウン - 2行表示と隣接配置 */}
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

              {/* 新しい拡張説明表示エリア */}
              <div className="bg-gray-800 p-3 rounded-xl shadow-inner border border-gray-700 text-white text-base text-center">
                {expansionDescriptions[expansionType] || "説明がありません"}
              </div>

              {/* スロット情報部分は変更なし */}
              <div className="bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700 flex-grow">
                <SlotSelector
                  usage={usageWithPreview}
                  maxUsage={{
                    close: Number(selectedMs.近スロット ?? 0),
                    mid: Number(selectedMs.中スロット ?? 0),
                    long: Number(selectedMs.遠スロット ?? 0),
                  }}
                  baseUsage={slotUsage}
                />
              </div>
            </>
          )}
        </div>

        {/* 右上のカラム：ステータスディスプレイ */}
        <div className="space-y-4 md:col-span-2 flex flex-col">
          {selectedMs && (
            <StatusDisplay
              stats={currentStats}
              selectedMs={selectedMs}
              hoveredPart={hoveredPart}
              isFullStrengthened={isFullStrengthened}
            />
          )}
        </div>

        {/* 下段のパーツ選択・装着中パーツセクション */}
        {selectedMs && (
          <div className="w-full bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700 col-span-5">
            <h2 className="text-xl font-semibold mb-2 text-white">カテゴリ別パーツ選択</h2>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap gap-2">
                {[{ name: allCategoryName, fileName: '' }, ...categories].map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setFilterCategory(cat.name)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filterCategory === cat.name
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-600 text-gray-100 hover:bg-blue-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <button
                onClick={handleClearAllParts}
                className="text-sm text-red-400 hover:underline flex-shrink-0"
              >
                🗑 全パーツ解除
              </button>
            </div>
            <PartList
              parts={partData}
              selectedParts={selectedParts}
              onSelect={handlePartSelect}
              onRemove={handlePartRemove}
              onHover={setHoveredPart}
              selectedMs={selectedMs}
              currentSlotUsage={slotUsage}
            />

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2 text-white">装着中のカスタムパーツ</h2>
              <SelectedPartDisplay
                parts={selectedParts}
                onRemove={handlePartRemove}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;