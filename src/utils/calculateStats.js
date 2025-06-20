import { getBaseMSStats } from './getBaseMSStats';
import { initializeLimits } from './initializeLimits';
import { calcPartBonus } from './calcPartBonus';
import { extractLevelFromName } from './msLevelUtil';

export const calculateMSStatsLogic = (
  ms,
  parts,
  isFullStrengthened,
  expansionType,
  allPartsCacheForExpansion,
  fullStrengtheningEffectsData
) => {
  console.group("--- calculateMSStatsLogic 実行開始 ---");
  // ...（ログ出力は省略可）...

  if (!ms) {
    const defaultStatsValues = {
      hp: 0, armorRange: 0, armorBeam: 0, armorMelee: 0,
      shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0,
      turnPerformanceGround: 0, turnPerformanceSpace: 0,
    };
    const defaultLimits = {
      hp: Infinity, armorRange: 50, armorBeam: 50, armorMelee: 50,
      shoot: 100, meleeCorrection: 100, speed: 200, highSpeedMovement: Infinity,
      thruster: 100, turnPerformanceGround: Infinity, turnPerformanceSpace: Infinity,
    };
    return {
      base: defaultStatsValues, partBonus: { ...defaultStatsValues }, fullStrengthenBonus: { ...defaultStatsValues },
      expansionBonus: { ...defaultStatsValues }, total: { ...defaultStatsValues }, rawTotal: { ...defaultStatsValues },
      currentLimits: { ...defaultLimits, flags: {} },
      fullStrengthenSlotBonus: { close: 0, medium: 0, long: 0 },
      isModified: { ...defaultStatsValues }
    };
  }

  const baseStats = getBaseMSStats(ms);

  const bonusInitialState = {
    hp: 0, armorRange: 0, armorBeam: 0, armorMelee: 0,
    shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0,
    turnPerformanceGround: 0, turnPerformanceSpace: 0,
  };

  const partBonus = calcPartBonus(parts, ms, isFullStrengthened, bonusInitialState);
  const fullStrengthenBonus = { ...bonusInitialState };
  const expansionBonus = { ...bonusInitialState };
  const partLimitsIncrease = { ...bonusInitialState };
  const fullStrengthenSlotBonus = { close: 0, medium: 0, long: 0 };

  const { currentLimits, limitChangedFlags } = initializeLimits(ms);

  const displayStatKeys = [
    'hp', 'armorRange', 'armorBeam', 'armorMelee',
    'shoot', 'meleeCorrection', 'speed', 'highSpeedMovement', 'thruster',
    'turnPerformanceGround', 'turnPerformanceSpace',
  ];

  // --- ここから下は従来通り ---
  // パーツによる上限引き上げ
  parts.forEach(part => {
    if (part.limitIncreases && typeof part.limitIncreases === 'object') {
      for (const statKey in part.limitIncreases) {
        if (part.limitIncreases.hasOwnProperty(statKey) && bonusInitialState.hasOwnProperty(statKey)) {
          const value = part.limitIncreases[statKey];
          if (typeof value === 'number' && !isNaN(value)) {
            partLimitsIncrease[statKey] += value;
          }
        }
      }
    }
  });

  displayStatKeys.forEach(key => {
    if (partLimitsIncrease[key] > 0) {
      currentLimits[key] += partLimitsIncrease[key];
      limitChangedFlags[key] = true;
    }
  });

  // フル強化・拡張ボーナス・％ボーナスなど（省略せず従来通り記述）

  // ...（ここにフル強化・拡張・％ボーナスの処理を記述）...

  // 合計値計算
  const totalStats = {};
  const rawTotalStats = {};
  const isModified = {};

  displayStatKeys.forEach(key => {
    let calculatedValue = (baseStats[key] || 0) + (partBonus[key] || 0) + (fullStrengthenBonus[key] || 0) + (expansionBonus[key] || 0);
    rawTotalStats[key] = calculatedValue;

    let finalLimit = currentLimits[key];
    if (finalLimit === null || finalLimit === undefined) {
      finalLimit = Infinity;
    }

    if (finalLimit !== Infinity) {
      totalStats[key] = Math.min(calculatedValue, finalLimit);
    } else {
      totalStats[key] = calculatedValue;
    }

    isModified[key] = (baseStats[key] !== totalStats[key]) ||
      (partBonus[key] !== 0) ||
      (fullStrengthenBonus[key] !== 0) ||
      (expansionBonus[key] !== 0);

    if (totalStats[key] === 0 &&
      partBonus[key] === 0 &&
      fullStrengthenBonus[key] === 0 &&
      expansionBonus[key] === 0) {
      isModified[key] = false;
    }
  });

  // パーツ％ボーナス
  const percentKeys = {
    hp: "hp_percent",
    shoot: "shoot_percent",
    meleeCorrection: "meleeCorrection_percent",
    armorRange: "armorRange_percent",
    armorBeam: "armorBeam_percent",
    armorMelee: "armorMelee_percent"
  };

  Object.entries(percentKeys).forEach(([statKey, percentProp]) => {
    const totalPercent = parts.reduce((sum, part) => {
      return sum + (typeof part[percentProp] === "number" ? part[percentProp] : 0);
    }, 0);
    if (totalPercent > 0) {
      const before = rawTotalStats[statKey];
      const after = Math.floor(before * (1 + totalPercent / 100));
      rawTotalStats[statKey] = after;
      totalStats[statKey] = after;
      isModified[statKey] = true;
    }
  });

  const statsResult = {
    base: baseStats,
    partBonus: partBonus,
    fullStrengthenBonus: fullStrengthenBonus,
    fullStrengthenSlotBonus: fullStrengthenSlotBonus,
    currentLimits: { ...currentLimits, flags: limitChangedFlags },
    expansionBonus: expansionBonus,
    rawTotal: rawTotalStats,
    total: totalStats,
    isModified: isModified,
    partLimitBonus: partLimitsIncrease
  };
  console.groupEnd();
  return statsResult;
};