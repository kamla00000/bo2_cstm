// src/hooks/useAppData.js
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { calculateMSStatsLogic } from '../utils/calculateStats';

// カテゴリ定義はApp.jsから移動
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
  "耐実弾補正拡張": "対実弾補正が10増加し、対実弾補正の上限値が10増加する",
  "耐ビーム補正拡張": "対ビーム補正が10増加し、対ビーム補正の上限値が10増加する",
  "耐格闘補正拡張": "対格闘補正が10増加し、対格闘補定の上限値が10増加する",
  "スラスター拡張": "スラスターが10増加し、スラスターの上限値が20増加する",
  "カスタムパーツ拡張[HP]": "「攻撃」タイプのカスタムパーツを1つ装備するごとに機体HPが400上昇する",
  "カスタムパーツ拡張[攻撃]": "「移動」タイプのカスタムパーツを1つ装備するごとに格闘補正が3、射撃補正が3上昇する",
  "カスタムパーツ拡張[装甲]": "「補助」タイプのカスタムパーツを1つ装備するごとに耐実弾補正が3、耐ビーム補正が3、耐格闘補正が3増加する",
  "カスタムパーツ拡張[スラスター]": "「特殊」タイプのカスタムパーツを1つ装備するごとにスラスターが5増加する",
};


export const useAppData = () => {
  const [msData, setMsData] = useState([]);
  const [partData, setPartData] = useState([]); // 表示中のパーツデータ
  const allPartsCache = useRef({}); // 全てのパーツデータをキャッシュするためのref
  // fullst.json からフル強化効果データを読み込む
  const [fullStrengtheningEffects, setFullStrengtheningEffects] = useState([]);

  const [selectedMs, setSelectedMs] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [filterCategory, setFilterCategory] = useState(allCategoryName);
  const [isFullStrengthened, setIsFullStrengthened] = useState(false);
  const [expansionType, setExpansionType] = useState('無し');

  // カテゴリに基づいて表示パーツを更新
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
  }, []);

  // MSデータとfullStrengtheningEffectsデータを初回のみ読み込む
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const msResponse = await fetch('/data/msData.json');
        if (!msResponse.ok) {
          throw new Error(`HTTP error! status: ${msResponse.status} for msData.json`);
        }
        const msData = await msResponse.json();
        setMsData(msData);

        // fullst.json からフル強化効果データを読み込む
        const fullStrengtheningResponse = await fetch('/data/fullst.json');
        if (!fullStrengtheningResponse.ok) {
          throw new Error(`HTTP error! status: ${fullStrengtheningResponse.status} for fullst.json`);
        }
        const fullStrengtheningData = await fullStrengtheningResponse.json();
        setFullStrengtheningEffects(fullStrengtheningData);

      } catch (error) {
        console.error("データ読み込みエラー:", error);
      }
    };
    loadInitialData();
  }, []);


  // 全てのパーツデータを初回のみキャッシュに読み込む
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
      // キャッシュロード完了後、初期カテゴリでパーツデータをセット
      updateDisplayedParts(allCategoryName);
    };

    loadAllPartsIntoCache();
  }, [updateDisplayedParts]);

  useEffect(() => {
    // MS選択後やカテゴリ変更時にパーツリストを更新する
    if (selectedMs) {
      updateDisplayedParts(filterCategory);
    } else if (filterCategory === allCategoryName && categories.every(cat => allPartsCache.current[cat.name])) {
      // MS選択前でも、初期カテゴリが「すべて」で全キャッシュがロードされていれば表示
      updateDisplayedParts(allCategoryName);
    }
  }, [filterCategory, selectedMs, updateDisplayedParts]);


  // スロット使用量計算関数 (useCallback でラップしてメモ化)
  const calculateSlotUsage = useCallback((ms, parts, isFullStrengthenedParam, fullStrengtheningEffectsData) => {
    if (!ms) {
      return { close: 0, mid: 0, long: 0, maxClose: 0, maxMid: 0, maxLong: 0 };
    }
    let usedClose = 0;
    let usedMid = 0;
    let usedLong = 0;
    parts.forEach(part => {
      usedClose += Number(part.close || 0);
      usedMid += Number(part.mid || 0);
      usedLong += Number(part.long || 0);
    });

    let additionalSlots = { close: 0, mid: 0, long: 0 };

    if (isFullStrengthenedParam && ms.fullst && Array.isArray(ms.fullst) && fullStrengtheningEffectsData) {
      ms.fullst.forEach(fsPart => {
        const foundFsEffect = fullStrengtheningEffectsData.find(
          fse => fse.name === fsPart.name
        );
        if (foundFsEffect) {
          const levelEffect = foundFsEffect.levels.find(l => l.level === fsPart.level)?.effects;
          if (levelEffect) {
            if (typeof levelEffect['近スロット'] === 'number') additionalSlots.close += levelEffect['近スロット'];
            if (typeof levelEffect['中スロット'] === 'number') additionalSlots.mid += levelEffect['中スロット'];
            if (typeof levelEffect['遠スロット'] === 'number') additionalSlots.long += levelEffect['遠スロット'];
          }
        }
      });
    }

    const maxClose = Number(ms["近スロット"] || 0) + additionalSlots.close;
    const maxMid = Number(ms["中スロット"] || 0) + additionalSlots.mid;
    const maxLong = Number(ms["遠スロット"] || 0) + additionalSlots.long;

    // ★★★ 問題特定のための詳細ログ追加 (これはデバッグ用なので、修正完了後に削除推奨) ★★★
    console.log("--- calculateSlotUsage Detail (for Debugging Discrepancy) ---");
    console.log(`MS Base Slots (from msData.json for ${ms.MS名}):`, {
        close: Number(ms["近スロット"] || 0),
        mid: Number(ms["中スロット"] || 0),
        long: Number(ms["遠スロット"] || 0)
    });
    console.log("Is Full Strengthened:", isFullStrengthenedParam);
    console.log("Additional Slots from Full Strengthening:", additionalSlots);
    console.log("Final Calculated Max Slots (by calculateSlotUsage):", {
        close: maxClose,
        mid: maxMid,
        long: maxLong
    });
    console.log("---------------------------------------------------------------");
    // ★★★ ここまで詳細ログ追加 ★★★

    return {
      close: usedClose,
      mid: usedMid,
      long: usedLong,
      maxClose: maxClose,
      maxMid: maxMid,
      maxLong: maxLong
    };
  }, []); // calculateSlotUsage は依存配列なしでOK。引数で受け取るためstateの変更に依存しない。


  // useMemo を使用して currentStats をキャッシュ
  const currentStats = useMemo(() => {
    return calculateMSStatsLogic(
      selectedMs,
      selectedParts,
      isFullStrengthened,
      expansionType,
      allPartsCache.current,
      fullStrengtheningEffects
    );
  }, [selectedMs, selectedParts, isFullStrengthened, expansionType, fullStrengtheningEffects]);

  // useMemo を使用して slotUsage をキャッシュ
  const slotUsage = useMemo(() => {
    if (!selectedMs) {
      return { close: 0, mid: 0, long: 0, maxClose: 0, maxMid: 0, maxLong: 0 };
    }
    return calculateSlotUsage(selectedMs, selectedParts, isFullStrengthened, fullStrengtheningEffects);
    // ★ 修正点1: fullStrengtheningEffects を依存配列に追加
  }, [selectedMs, selectedParts, isFullStrengthened, fullStrengtheningEffects, calculateSlotUsage]);


  // ホバー時のスロット使用状況プレビュー
  const getUsageWithPreview = useCallback(() => {
    if (!selectedMs) return null;
    const current = slotUsage; // 現在の確定したスロット使用量

    const newUsed = {
      close: current.close,
      mid: current.mid,
      long: current.long,
    };

    if (hoveredPart && !selectedParts.some(p => p.name === hoveredPart.name)) {
      newUsed.close += Number(hoveredPart.close || 0);
      newUsed.mid += Number(hoveredPart.mid || 0);
      newUsed.long += Number(hoveredPart.long || 0);
    }

    const canAddResult = (newUsed.close <= current.maxClose &&
                          newUsed.mid <= current.maxMid &&
                          newUsed.long <= current.maxLong);

    return {
      close: newUsed.close,
      mid: newUsed.mid,
      long: newUsed.long,
      maxClose: current.maxClose,
      maxMid: current.maxMid,
      maxLong: current.maxLong,
      canAdd: canAddResult
    };
  }, [selectedMs, hoveredPart, selectedParts, slotUsage]); // ★ 修正点2: slotUsage を依存配列に追加


  // --- イベントハンドラ ---
  const handleMsSelect = useCallback((ms) => {
    setSelectedMs(ms);
    setSelectedParts([]);
    setHoveredPart(null);
    setIsFullStrengthened(false);
    setExpansionType('無し');
    setFilterCategory(allCategoryName);
  }, []);

  const handlePartRemove = useCallback((partToRemove) => {
    setSelectedParts(prevParts => prevParts.filter(part => part.name !== partToRemove.name));
  }, []);

  const handlePartSelect = useCallback((part) => {
    console.log("--- handlePartSelect Called ---");
    console.log("Part attempting to select:", part.name);

    if (!selectedMs) {
      alert("先にモビルスーツを選択してください。");
      return;
    }

    if (selectedParts.some(p => p.name === part.name)) {
      handlePartRemove(part); // 既に選択されている場合は解除
      return;
    }

    if (selectedParts.length >= 8) {
      alert("カスタムパーツは最大8つまでしか装着できません。");
      return;
    }

    // 「高性能走行制御機構」系パーツの重複チェック
    if (part.name.startsWith("高性能走行制御機構") && selectedParts.some(p => p.name.startsWith("高性能走行制御機構"))) {
      alert("「高性能走行制御機構」系パーツは複数装備できません。");
      return;
    }

    const partsWithNew = [...selectedParts, part];
    const projectedSlots = calculateSlotUsage(selectedMs, partsWithNew, isFullStrengthened, fullStrengtheningEffects);

    console.log(`Attempting to add ${part.name}: Cost (C:${part.close || 0}, M:${part.mid || 0}, L:${part.long || 0})`);
    console.log(`Current Used Slots (before adding ${part.name}): (C:${slotUsage.close}, M:${slotUsage.mid}, L:${slotUsage.long})`);
    console.log(`Max Slots (used for check): (C:${projectedSlots.maxClose}, M:${projectedSlots.maxMid}, L:${projectedSlots.maxLong})`);
    console.log(`Projected New Slots (C:${projectedSlots.close}, M:${projectedSlots.mid}, L:${projectedSlots.long})`);


    if (projectedSlots.close > projectedSlots.maxClose ||
        projectedSlots.mid > projectedSlots.maxMid ||
        projectedSlots.long > projectedSlots.maxLong) {
      console.warn("Slot capacity insufficient based on calculation!");
      alert("スロット容量が不足しています。");
      return;
    }

    // 特定のパーツ組み合わせ制限 (変更なし)
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

    setSelectedParts(prevParts => [...prevParts, part]);
  }, [selectedMs, selectedParts, calculateSlotUsage, handlePartRemove, isFullStrengthened, fullStrengtheningEffects, slotUsage]);


  const handleClearAllParts = useCallback(() => {
    setSelectedParts([]);
  }, []);

  return {
    msData,
    partData,
    selectedMs,
    selectedParts,
    hoveredPart,
    filterCategory,
    isFullStrengthened,
    expansionType,
    categories,
    allCategoryName,
    expansionOptions,
    expansionDescriptions,
    currentStats,
    slotUsage,
    usageWithPreview: getUsageWithPreview(),
    setHoveredPart,
    setFilterCategory,
    setIsFullStrengthened,
    setExpansionType,
    handleMsSelect,
    handlePartRemove,
    handlePartSelect,
    handleClearAllParts,
  };
};