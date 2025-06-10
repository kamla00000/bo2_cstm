// src/hooks/useAppData.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { calculateMSStatsLogic } from '../utils/calculateStats';
import { calculateSlotUsage } from '../utils/calculateSlots'; // 新しく分離した関数をインポート
import { useDataLoading } from './useDataLoading'; // 新しく分離したカスタムフックをインポート
import {
  CATEGORIES, // `categories` を `CATEGORIES` に変更
  ALL_CATEGORY_NAME,
  EXPANSION_OPTIONS,
  EXPANSION_DESCRIPTIONS
} from '../constants/appConstants'; // 定数をインポート

export const useAppData = () => {
  // useDataLoading から必要なデータを取得
  const { msData, fullStrengtheningEffects, allPartsCache, isDataLoaded } = useDataLoading();

  const [partData, setPartData] = useState([]); // 表示中のパーツデータ
  const [selectedMs, setSelectedMs] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [filterCategory, setFilterCategory] = useState(ALL_CATEGORY_NAME); // 定数を使用
  const [isFullStrengthened, setIsFullStrengthened] = useState(false);
  const [expansionType, setExpansionType] = useState('無し');


  // カテゴリに基づいて表示パーツを更新 (useCallback でメモ化)
  // allPartsCache がuseRefから返されるため、依存配列に追加
  const updateDisplayedParts = useCallback((category) => {
    let loadedParts = [];
    if (category === ALL_CATEGORY_NAME) { // 定数を使用
      for (const cat of CATEGORIES) { // 定数を使用
        if (allPartsCache[cat.name]) { // ref.current ではなく直接アクセス
          loadedParts.push(...allPartsCache[cat.name]);
        }
      }
    } else {
      const targetCategory = CATEGORIES.find(cat => cat.name === category); // 定数を使用
      if (targetCategory && allPartsCache[targetCategory.name]) {
        loadedParts = allPartsCache[targetCategory.name];
      }
    }
    setPartData(loadedParts);
  }, [allPartsCache]); // allPartsCache を依存配列に追加


  // 全データロード完了後に初期表示パーツをセット
  useEffect(() => {
    if (isDataLoaded) {
      updateDisplayedParts(ALL_CATEGORY_NAME);
    }
  }, [isDataLoaded, updateDisplayedParts]); // isDataLoaded と updateDisplayedParts に依存

  // MS選択後やカテゴリ変更時にパーツリストを更新する
  useEffect(() => {
    if (selectedMs || (filterCategory === ALL_CATEGORY_NAME && isDataLoaded)) {
      updateDisplayedParts(filterCategory);
    }
  }, [filterCategory, selectedMs, updateDisplayedParts, isDataLoaded]); // isDataLoaded を依存配列に追加


  // useMemo を使用して currentStats をキャッシュ
  const currentStats = useMemo(() => {
    return calculateMSStatsLogic(
      selectedMs,
      selectedParts,
      isFullStrengthened,
      expansionType,
      allPartsCache, // ref.current ではなく直接アクセス
      fullStrengtheningEffects
    );
  }, [selectedMs, selectedParts, isFullStrengthened, expansionType, allPartsCache, fullStrengtheningEffects]);

  // ★★★ カスタムパーツによる補正値を計算する useMemo を追加 ★★★
  const partBonuses = useMemo(() => {
    if (!selectedParts || selectedParts.length === 0) {
      return {};
    }

    const bonuses = {};
    selectedParts.forEach(part => {
      // 数値として扱えるプロパティのみを対象とする
      for (const key in part) {
        // null, undefined, NaN を除外し、数値型または数値に変換可能な文字列のみを考慮
        if (typeof part[key] === 'number' || (typeof part[key] === 'string' && !isNaN(parseFloat(part[key])))) {
          const value = Number(part[key]);
          if (isFinite(value)) { // 無限大の値を避ける
            bonuses[key] = (bonuses[key] || 0) + value;
          }
        }
      }
    });
    return bonuses;
  }, [selectedParts]);


  // useMemo を使用して slotUsage をキャッシュ
  const slotUsage = useMemo(() => {
    if (!selectedMs) {
      return { close: 0, mid: 0, long: 0, maxClose: 0, maxMid: 0, maxLong: 0 };
    }
    // 分離した calculateSlotUsage を使用
    return calculateSlotUsage(selectedMs, selectedParts, isFullStrengthened, fullStrengtheningEffects);
  }, [selectedMs, selectedParts, isFullStrengthened, fullStrengtheningEffects]); // calculateSlotUsage はもはや依存配列に不要（純粋関数になったため）

  // ★★★ 追加: ホバー中のパーツが装着済みの場合、そのスロット情報を取得 ★★★
  const hoveredOccupiedSlots = useMemo(() => {
    if (!hoveredPart || !selectedMs) return null; // MSが選択されていない場合もnull
    const isAlreadySelected = selectedParts.some(p => p.name === hoveredPart.name);

    if (isAlreadySelected) {
      return {
        close: Number(hoveredPart.close || 0),
        mid: Number(hoveredPart.mid || 0),
        long: Number(hoveredPart.long || 0)
      };
    }
    return null; // 装着済みではない場合はnull
  }, [hoveredPart, selectedParts, selectedMs]);


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
  }, [selectedMs, hoveredPart, selectedParts, slotUsage]);


  // --- イベントハンドラ ---
  const handleMsSelect = useCallback((ms) => {
    setSelectedMs(ms);
    setSelectedParts([]);
    setHoveredPart(null);
    setIsFullStrengthened(false);
    setExpansionType('無し');
    setFilterCategory(ALL_CATEGORY_NAME); // 定数を使用
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
    // 分離した calculateSlotUsage を使用
    const projectedSlots = calculateSlotUsage(selectedMs, partsWithNew, isFullStrengthened, fullStrengtheningEffects);

    if (projectedSlots.close > projectedSlots.maxClose ||
        projectedSlots.mid > projectedSlots.maxMid ||
        projectedSlots.long > projectedSlots.maxLong) {
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
  }, [selectedMs, selectedParts, handlePartRemove, isFullStrengthened, fullStrengtheningEffects, calculateSlotUsage]); // calculateSlotUsage は依存配列に不要

  const handleClearAllParts = useCallback(() => {
    setSelectedParts([]);
  }, []);

  // `setIsFullStrengthened` のラッパー関数を定義
  const setFullStrengthenedWrapper = useCallback((newValue) => {
    if (!newValue && selectedParts.length > 0) {
      handleClearAllParts();
    }
    setIsFullStrengthened(newValue);
  }, [selectedParts, handleClearAllParts]);

  return {
    msData,
    partData,
    selectedMs,
    selectedParts,
    hoveredPart,
    filterCategory,
    isFullStrengthened,
    expansionType,
    categories: CATEGORIES, // 定数を公開
    allCategoryName: ALL_CATEGORY_NAME, // 定数を公開
    expansionOptions: EXPANSION_OPTIONS, // 定数を公開
    expansionDescriptions: EXPANSION_DESCRIPTIONS, // 定数を公開
    currentStats,
    slotUsage,
    usageWithPreview: getUsageWithPreview(),
    setHoveredPart,
    setFilterCategory,
    setIsFullStrengthened: setFullStrengthenedWrapper,
    setExpansionType,
    handleMsSelect,
    handlePartRemove,
    handlePartSelect,
    handleClearAllParts,
    partBonuses, // ★★★ 追加: 計算した補正値を公開 ★★★
    hoveredOccupiedSlots, // ★★★ 追加: ホバー中のパーツが占有するスロット情報を公開 ★★★
  };
};