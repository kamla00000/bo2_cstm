import React, { useState, useEffect, useCallback, useRef } from 'react';
import MSSelector from './components/MSSelector';
import PartList from './components/PartList';
import StatusDisplay from './components/StatusDisplay';
import SlotSelector from './components/SlotSelector';
import SelectedPartDisplay from './components/SelectedPartDisplay';

function App() {
  const [msData, setMsData] = useState([]);
  const [partData, setPartData] = useState([]);
  const allPartsCache = useRef({}); // 全てのパーツデータをキャッシュするためのref
  const [selectedMs, setSelectedMs] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [filterCategory, setFilterCategory] = useState('防御'); // 初期カテゴリは「防御」
  const [isFullStrengthened, setIsFullStrengthened] = useState(false);
  const [expansionType, setExpansionType] = useState('無し');

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
    "耐格闘補正拡張": "耐格闘補正が10増加し、耐格闘補定の上限値が10増加する",
    "スラスター拡張": "スラスターが10増加し、スラスターの上限値が20増加する",
    "カスタムパーツ拡張[HP]": "「攻撃」タイプのカスタムパーツを1つ装備するごとに機体HPが400上昇する",
    "カスタムパーツ拡張[攻撃]": "「移動」タイプのカスタムパーツを1つ装備するごとに格闘補正が3、射撃補正が3上昇する",
    "カスタムパーツ拡張[装甲]": "「補助」タイプのカスタムパーツを1つ装備するごとに耐実弾補正が3、耐ビーム補正が3、耐格闘補正が3増加する",
    "カスタムパーツ拡張[スラスター]": "「特殊」タイプのカスタムパーツを1つ装備するごとにスラスターが5増加する",
  };

  // --- データ読み込みロジック ---

  // MSデータを初回のみ読み込む
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

  // 全てのパーツデータを初回のみキャッシュに読み込む
  // このuseEffectは、コンポーネントマウント時に一度だけ実行され、キャッシュを埋めることが目的
  useEffect(() => {
    const loadAllPartsIntoCache = async () => {
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
    };

    loadAllPartsIntoCache();
  }, []);

  const updateDisplayedParts = useCallback((category) => {
    let loadedParts = [];
    if (category === allCategoryName) {
      for (const cat of categories) {
        if (allPartsCache.current[cat.name]) {
          loadedParts.push(...allPartsCache.current[cat.name]);
        }
      }
    } else {
      const targetCategory = categories.find(cat => cat.name === category);
      if (targetCategory && allPartsCache.current[targetCategory.name]) {
        loadedParts = allPartsCache.current[targetCategory.name];
      }
    }
    setPartData(loadedParts);
  }, [categories]);

  useEffect(() => {
    const allCacheLoaded = categories.every(cat => allPartsCache.current[cat.name]);
    if (allCacheLoaded) {
      updateDisplayedParts(filterCategory);
    }
  }, [filterCategory, updateDisplayedParts, categories]);

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
      const defaultStats = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
      return {
        base: defaultStats,
        partBonus: { ...defaultStats },
        fullStrengthenBonus: { ...defaultStats },
        expansionBonus: { ...defaultStats },
        total: { ...defaultStats },
        rawTotal: { ...defaultStats },
        currentLimits: { ...defaultStats, flags: {} }
      };
    }

    const baseStats = {
      hp: Number(ms.HP || 0),
      armor: Number(ms.耐実弾補正 || 0),
      beam: Number(ms.耐ビーム補正 || 0),
      melee: Number(ms.耐格闘補正 || 0),
      shoot: Number(ms.射撃補正 || 0),
      meleeCorrection: Number(ms.格闘補正 || 0),
      speed: Number(ms.スピード || 0),
      highSpeedMovement: Number(ms.高速移動 || 0),
      thruster: Number(ms.スラスター || 0),
      turnPerformanceGround: Number(ms["旋回_地上_通常時"] || 0),
      turnPerformanceSpace: Number(ms["旋回_宇宙_通常時"] || 0)
    };

    const baseLimits = {
      hp: undefined,
      armor: 50,
      beam: 50,
      melee: 50,
      shoot: 100,
      meleeCorrection: 100,
      speed: 200,
      highSpeedMovement: undefined,
      thruster: 100,
      turnPerformanceGround: undefined,
      turnPerformanceSpace: undefined,
    };

    const partBonus = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
    const fullStrengthenBonus = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
    const expansionBonus = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };

    parts.forEach(part => {
      if (typeof part.hp === 'number') partBonus.hp += part.hp;
      if (typeof part.armor_range === 'number') partBonus.armor += part.armor_range;
      if (typeof part.armor_beam === 'number') partBonus.beam += part.armor_beam;
      if (typeof part.armor_melee === 'number') partBonus.melee += part.armor_melee;
      if (typeof part.shoot === 'number') partBonus.shoot += part.shoot;
      if (typeof part.melee === 'number') partBonus.meleeCorrection += part.melee;
      if (typeof part.speed === 'number') partBonus.speed += part.speed;
      if (typeof part.highSpeedMovement === 'number') partBonus.highSpeedMovement += part.highSpeedMovement;
      if (typeof part.thruster === 'number') partBonus.thruster += part.thruster;
      if (typeof part.turnPerformanceGround === 'number') partBonus.turnPerformanceGround += part.turnPerformanceGround;
      if (typeof part.turnPerformanceSpace === 'number') partBonus.turnPerformanceSpace += part.turnPerformanceSpace;
    });

    if (isFullStrengthened) {
      fullStrengthenBonus.hp = 2500;
      fullStrengthenBonus.armor = 5;
      fullStrengthenBonus.beam = 5;
      fullStrengthenBonus.melee = 5;
      fullStrengthenBonus.shoot = 5;
      fullStrengthenBonus.meleeCorrection = 5;
      fullStrengthenBonus.speed = 5;
      fullStrengthenBonus.highSpeedMovement = 5;
      fullStrengthenBonus.thruster = 5;
      fullStrengthenBonus.turnPerformanceGround = 5;
      fullStrengthenBonus.turnPerformanceSpace = 5;
    }

    const currentLimits = { ...baseLimits };
    const limitChangedFlags = {};

    switch (expansionType) {
      case "射撃補正拡張":
        expansionBonus.shoot += 8;
        currentLimits.shoot = (currentLimits.shoot || baseLimits.shoot || 0) + 8;
        limitChangedFlags.shoot = true;
        break;
      case "格闘補正拡張":
        expansionBonus.meleeCorrection += 8;
        currentLimits.meleeCorrection = (currentLimits.meleeCorrection || baseLimits.meleeCorrection || 0) + 8;
        limitChangedFlags.meleeCorrection = true;
        break;
      case "耐実弾補正拡張":
        expansionBonus.armor += 10;
        currentLimits.armor = (currentLimits.armor || baseLimits.armor || 0) + 10;
        limitChangedFlags.armor = true;
        break;
      case "耐ビーム補正拡張":
        expansionBonus.beam += 10;
        currentLimits.beam = (currentLimits.beam || baseLimits.beam || 0) + 10;
        limitChangedFlags.beam = true;
        break;
      case "耐格闘補正拡張":
        expansionBonus.melee += 10;
        currentLimits.melee = (currentLimits.melee || baseLimits.melee || 0) + 10;
        limitChangedFlags.melee = true;
        break;
      case "スラスター拡張":
        expansionBonus.thruster += 10;
        currentLimits.thruster = (currentLimits.thruster || baseLimits.thruster || 0) + 20;
        limitChangedFlags.thruster = true;
        break;
      case "カスタムパーツ拡張[HP]":
        const offensivePartsCountHP = parts.filter(p => allPartsCache.current['攻撃']?.some(op => op.name === p.name)).length;
        expansionBonus.hp += offensivePartsCountHP * 400;
        break;
      case "カスタムパーツ拡張[攻撃]":
        const movingPartsCountAttack = parts.filter(p => allPartsCache.current['移動']?.some(mp => mp.name === p.name)).length;
        expansionBonus.meleeCorrection += movingPartsCountAttack * 3;
        expansionBonus.shoot += movingPartsCountAttack * 3;
        break;
      case "カスタムパーツ拡張[装甲]":
        const supportPartsCountArmor = parts.filter(p => allPartsCache.current['補助']?.some(sp => sp.name === p.name)).length;
        expansionBonus.armor += supportPartsCountArmor * 3;
        expansionBonus.beam += supportPartsCountArmor * 3;
        expansionBonus.melee += supportPartsCountArmor * 3;
        break;
      case "カスタムパーツ拡張[スラスター]":
        const specialPartsCountThruster = parts.filter(p => allPartsCache.current['特殊']?.some(spp => spp.name === p.name)).length;
        expansionBonus.thruster += specialPartsCountThruster * 5;
        break;
      default:
        break;
    }
    currentLimits.flags = limitChangedFlags;

    const totalStats = {};
    const rawTotalStats = {};

    Object.keys(baseStats).forEach(key => {
      let calculatedValue = baseStats[key] + partBonus[key] + fullStrengthenBonus[key] + expansionBonus[key];
      rawTotalStats[key] = calculatedValue;
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
      currentLimits: currentLimits,
      expansionBonus: expansionBonus,
      rawTotal: rawTotalStats,
      total: totalStats,
    };
  }, [allPartsCache]);

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
    console.log("App: Selected MS in handleMsSelect:", ms); // 選択されたMSオブジェクト全体をログ
    setSelectedMs(ms);
    setSelectedParts([]);
    setHoveredPart(null);
    setIsFullStrengthened(false);
    setExpansionType('無し');
  }, []);

  const handlePartRemove = useCallback((partToRemove) => {
    setSelectedParts(prevParts => prevParts.filter(part => part.name !== partToRemove.name));
  }, []);

  const handlePartSelect = useCallback((part) => {
    if (!selectedMs) {
      alert("先にモビルスーツを選択してください。");
      return;
    }

    if (selectedParts.some(p => p.name === part.name)) {
      handlePartRemove(part);
      return;
    }

    if (selectedParts.length >= 8) {
      alert("カスタムパーツは最大8つまでしか装着できません。");
      return;
    }

    if (part.name.startsWith("高性能走行制御機構") && selectedParts.some(p => p.name.startsWith("高性能走行制御機構"))) {
      alert("「高性能走行制御機構」系パーツは複数装備できません。");
      return;
    }

    if (part.name === "駆動系強化機構" || part.name === "コンポジットモーター") {
      const conflictingPart = selectedParts.find(p =>
        (p.speed > 0 || p.turnPerformanceGround > 0 || p.turnPerformanceSpace > 0) &&
        p.name !== "駆動系強化機構" && p.name !== "コンポジットモーター"
      );
      if (conflictingPart) {
        alert("「駆動系強化機構」または「コンポジットモーター」は、スピードまたは旋回性能が上昇する他のパーツと同時装備できません。");
        return;
      }
    }
    if ((part.speed > 0 || part.turnPerformanceGround > 0 || part.turnPerformanceSpace > 0) &&
      selectedParts.some(p => p.name === "駆動系強化機構" || p.name === "コンポジットモーター")) {
      alert("スピードまたは旋回性能が上昇するパーツは、「駆動系強化機構」または「コンポジットモーター」と同時装備できません。");
      return;
    }


    const currentSlots = calculateSlotUsage(selectedMs, selectedParts);
    const newClose = (currentSlots.close || 0) + (part.close || 0);
    const newMid = (currentSlots.mid || 0) + (part.mid || 0);
    const newLong = (currentSlots.long || 0) + (part.long || 0);

    if (newClose > (Number(selectedMs["近スロット"]) || 0) ||
      newMid > (Number(selectedMs["中スロット"]) || 0) ||
      newLong > (Number(selectedMs["遠スロット"]) || 0)) {
      alert("スロット容量が不足しています。");
      return;
    }

    setSelectedParts(prevParts => [...prevParts, part]);
  }, [selectedMs, selectedParts, calculateSlotUsage, handlePartRemove]);


  const handleClearAllParts = useCallback(() => {
    setSelectedParts([]);
  }, []);

  if (msData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center justify-center">
        <p className="text-xl">データを読み込み中...</p>
      </div>
    );
  }

  // ★全角括弧の変換処理を削除
  const baseName = selectedMs
    ? selectedMs["MS名"]
        .replace(/_LV\d+$/, '')    // 末尾の"_LV数字" を削除
        .trim() // 余分な空白を削除
    : 'default';

  console.log("App: MS Name from JSON:", selectedMs ? selectedMs["MS名"] : "No MS Selected"); // JSONからの元々のMS名
  console.log("App: Generated baseName for image:", baseName); // 画像ファイル名に変換されたbaseName

  const getTypeColor = (type) => {
    switch (type) {
      case '強襲':
        return 'bg-red-500 text-white';
      case '汎用':
      case '汎用（変形）':
        return 'bg-blue-500 text-white';
      case '支援':
      case '支援攻撃':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 flex flex-col items-center gap-6">
      <h1 className="text-4xl font-bold tracking-wide text-white drop-shadow-lg">bo2-cstm</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full max-w-screen-xl items-stretch">
        <div className="space-y-4 md:col-span-3 flex flex-col">
          <MSSelector
            msData={msData}
            onSelect={handleMsSelect}
            selectedMs={selectedMs}
          />

          {selectedMs && (
            <>
              <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-xl shadow-inner border border-gray-700">
                <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={`/images/ms/${baseName}.jpg`}
                    alt={selectedMs["MS名"]}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`App: Image load error for: /images/ms/${baseName}.jpg`); // 画像読み込みエラーログ
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
                {expansionDescriptions[expansionType] || "説明がありません"}
              </div>

              <div className="bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700">
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

              <div className="bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700 mt-4">
                <SelectedPartDisplay
                  parts={selectedParts}
                  onRemove={handlePartRemove}
                  onClearAllParts={handleClearAllParts}
                />
              </div>
            </>
          )}
        </div>

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

        {selectedMs && (
          <div className="w-full bg-gray-800 p-4 rounded-xl shadow-inner border border-gray-700 col-span-5">
            <h2 className="text-xl font-semibold mb-3 text-white">カテゴリ別パーツ選択</h2>
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
          </div>
        )}
      </div>
    </div>
  );
}

export default App;