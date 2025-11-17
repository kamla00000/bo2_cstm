import { getBaseMSStats } from './getBaseMSStats';
import { initializeLimits } from './initializeLimits';

// 機体名からレベルを抽出する関数
function extractLevelFromName(msName) {
  const match = msName && msName.match(/_LV(\d+)/i);
  return match ? Number(match[1]) : 1;
}

export const calculateMSStatsLogic = (
  ms,
  parts,
  isFullStrengthened,
  expansionType,
  allPartsCacheForExpansion,
  fullStrengtheningEffectsData
) => {
  console.group("--- calculateMSStatsLogic 実行開始 ---");
  console.log("[calculateMSStatsLogic] Function called with:");
  console.log("   MS Name:", ms?.MS名);
  console.log("   Raw MS Data (partial for problematic keys):");
  console.log("     ms.HP:", ms?.HP);
  console.log("     ms.スピード:", ms?.スピード);
  console.log("     ms.高速移動:", ms?.高速移動);
  console.log("     ms['旋回_地上_通常時']:", ms?.["旋回_地上_通常時"]);
  console.log("     ms['旋回_宇宙_通常時']:", ms?.["旋回_宇宙_通常時"]);
  console.log("   Parts count:", parts.length);
  console.log("   Full Strengthened:", isFullStrengthened);
  console.log("   Expansion Type:", expansionType);
  console.log("   fullStrengtheningEffectsData exists:", !!fullStrengtheningEffectsData);
  console.log("[DEBUG] ms object full dump:", ms);

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
    console.warn("[calculateMSStatsLogic] No MS selected, returning default empty stats.");
    console.groupEnd();
    return {
      base: defaultStatsValues, partBonus: { ...defaultStatsValues }, fullStrengthenBonus: { ...defaultStatsValues },
      expansionBonus: { ...defaultStatsValues }, total: { ...defaultStatsValues }, rawTotal: { ...defaultStatsValues },
      currentLimits: { ...defaultLimits, flags: {} },
      fullStrengthenSlotBonus: { close: 0, medium: 0, long: 0 },
      isModified: { ...defaultStatsValues }
    };
  }

  const baseStats = getBaseMSStats(ms);
  console.log("[calculateMSStatsLogic] Base Stats (from getBaseMSStats):", JSON.parse(JSON.stringify(baseStats)));

  const bonusInitialState = {
    hp: 0, armorRange: 0, armorBeam: 0, armorMelee: 0,
    shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0,
    turnPerformanceGround: 0, turnPerformanceSpace: 0,
  };

  const partBonus = { ...bonusInitialState };
  const fullStrengthenBonus = { ...bonusInitialState };
  const expansionBonus = { ...bonusInitialState };
  const partLimitsIncrease = { ...bonusInitialState };
  const fullStrengthenSlotBonus = { close: 0, medium: 0, long: 0 };

  const { currentLimits, limitChangedFlags } = initializeLimits(ms);
  console.log("[calculateMSStatsLogic] currentLimits after MS-specific limits application (from initializeLimits):", JSON.parse(JSON.stringify(currentLimits)));
  console.log("[calculateMSStatsLogic] Initial limitChangedFlags:", JSON.parse(JSON.stringify(limitChangedFlags)));

  const displayStatKeys = [
    'hp', 'armorRange', 'armorBeam', 'armorMelee',
    'shoot', 'meleeCorrection', 'speed', 'highSpeedMovement', 'thruster',
    'turnPerformanceGround', 'turnPerformanceSpace',
  ];

  // ★機体レベルを機体名から取得
  const msLevel = extractLevelFromName(ms["MS名"]);
  console.log("[calculateMSStatsLogic] Extracted msLevel:", msLevel);

  // ステータスごとのByLevelプロパティ名と内部キーの対応表
  const byLevelKeys = {
    hp: "hpByLevel",
    shoot: "shootByLevel",
    meleeCorrection: "meleeCorrectionByLevel",
    armorRange: "armorRangeByLevel",
    armorBeam: "armorBeamByLevel",
    armorMelee: "armorMeleeByLevel",
    thruster: "thrusterByLevel",
    speed: "speedByLevel",
    highSpeedMovement: "highSpeedMovementByLevel",
    turnPerformanceGround: "turnPerformanceGroundByLevel",
    turnPerformanceSpace: "turnPerformanceSpaceByLevel"
  };

  // 2. カスタムパーツのボーナスと上限引き上げの収集
  parts.forEach(part => {
    // コネクティングシステム[強襲Ⅰ型]の加算ロジック（melee, armor_meleeは全属性、speedのみ強襲限定）
    if (part.name && part.name.includes('コネクティングシステム') && (part.name.includes('強襲Ⅰ型') || part.name.includes('強襲I型'))) {
      partBonus.melee += part.melee || 0;
      partBonus.meleeCorrection += part.melee || 0;
      partBonus.armorMelee += part.armor_melee || 0;
      const msCategory = ms.属性 || ms.カテゴリ || ms.category;
      if (msCategory === '強襲') {
        partBonus.speed += 7;
        console.log(`[connectingsystem-raid] ${part.name}：属性「強襲」なのでスピード+7適用`);
      } else {
        console.log(`[connectingsystem-raid] ${part.name}：属性「${msCategory}」なのでスピード+7は適用しない`);
      }
      // 通常speed加算は絶対に行わない
      return;
    }

    console.log(`[Part Debug] Processing part: ${part.name}`);
    console.log(`[Part Debug] isFullStrengthened: ${isFullStrengthened}`);
    console.log(`[Part Debug] Part has hpByLevel: ${Array.isArray(part.hpByLevel)}`);
    console.log(`[Part Debug] Part has meleeCorrectionByLevel: ${Array.isArray(part.meleeCorrectionByLevel)}`);
    console.log(`[Part Debug] FORCED UPDATE - timestamp: ${Date.now()}`); // 強制更新マーカー
    
    // 総合強化プログラム_格闘_LV1の特殊処理
    // if (part.name === "総合強化プログラム_格闘_LV1") {
    //   const levelUpTable = [1, 2, 3, 4, 5, 5];
    //   const idx = Math.max(0, Math.min(msLevel - 1, levelUpTable.length - 1));
    //   const upValue = levelUpTable[idx];
    //   partBonus.meleeCorrection += upValue;
    //   partBonus.armorMelee += upValue;
    //   partBonus.speed += upValue;
    //   partBonus.thruster += upValue;
    //   partBonus.turnPerformanceGround += upValue;
    //   partBonus.turnPerformanceSpace += upValue;
    //   console.log(`[calculateMSStatsLogic] 総合強化プログラム_格闘_LV1: msLevel=${msLevel}, upValue=${upValue}`);
    //   return;
    // }
    // console.groupCollapsed(`[calculateMSStatsLogic] Processing Part: ${part.name}`);
    // console.log(`Part data for ${part.name}:`, JSON.parse(JSON.stringify(part)));

    // レベルリンクシステムの特殊処理
    const levelLinkMatch = part.name.match(/^レベルリンクシステム\[(.+)\]_LV1$/);
    if (levelLinkMatch) {
      const systemType = levelLinkMatch[1];
      const level = msLevel || 1;
      
      switch (systemType) {
        case "格闘": {
          // LV1: melee+3, LV2: melee+5, LV3: melee+7, LV4: melee+9, LV5: melee+11...
          const meleeBase = typeof part.melee === 'number' ? part.melee : 0;
          const bonus = meleeBase + (level * 2 + 1);
          partBonus.meleeCorrection += bonus;
          console.log(`[calculateMSStatsLogic] レベルリンクシステム[格闘]_LV1: msLevel=${level}, meleeBase=${meleeBase}, bonus=${bonus}`);
          return; // 通常のmelee加算処理をスキップ
        }
        case "射撃": {
          // LV1: shoot+3, LV2: shoot+5, LV3: shoot+7, LV4: shoot+9, LV5: shoot+11...
          const shootBase = typeof part.shoot === 'number' ? part.shoot : 0;
          const bonus = shootBase + (level * 2 + 1);
          partBonus.shoot += bonus;
          console.log(`[calculateMSStatsLogic] レベルリンクシステム[射撃]_LV1: msLevel=${level}, shootBase=${shootBase}, bonus=${bonus}`);
          return; // 通常のshoot加算処理をスキップ
        }
        case "装甲": {
          // LV1: +4, LV2: +5, LV3: +6, LV4: +7, LV5: +8
          const levelBonusTable = [4, 5, 6, 7, 8]; // LV1～LV5対応
          const bonusIndex = Math.min(level - 1, levelBonusTable.length - 1);
          const levelBonus = levelBonusTable[bonusIndex];
          
          // 装甲系のベース値を取得
          const armorRangeBase = typeof part.armor_range === 'number' ? part.armor_range : 0;
          const armorBeamBase = typeof part.armor_beam === 'number' ? part.armor_beam : 0;
          const armorMeleeBase = typeof part.armor_melee === 'number' ? part.armor_melee : 0;
          
          // ベース値 + レベルボーナスを各装甲補正に加算
          partBonus.armorRange += armorRangeBase + levelBonus;
          partBonus.armorBeam += armorBeamBase + levelBonus;
          partBonus.armorMelee += armorMeleeBase + levelBonus;
          
          console.log(`[calculateMSStatsLogic] レベルリンクシステム[装甲]_LV1: msLevel=${level}, levelBonus=${levelBonus}, armorRangeBase=${armorRangeBase}, armorBeamBase=${armorBeamBase}, armorMeleeBase=${armorMeleeBase}`);
          return; // 通常の装甲加算処理をスキップ
        }
        default:
          console.warn(`[calculateMSStatsLogic] 未対応のレベルリンクシステム: ${systemType}`);
          break;
      }
    }

    // ★レベル依存パーツの処理（各ByLevelプロパティを優先）
    Object.entries(byLevelKeys).forEach(([statKey, byLevelProp]) => {
      if (Array.isArray(part[byLevelProp])) {
        const idx = Math.min(msLevel, part[byLevelProp].length) - 1;
        const bonus = part[byLevelProp][idx];
        console.log(`[calculateMSStatsLogic] ${byLevelProp}: msLevel=${msLevel}, idx=${idx}, bonus=${bonus}`);
        if (typeof bonus === "number") {
          partBonus[statKey] += bonus;
        }
      }
    });

    // HPだけはByLevelがなければ従来通り
    if (!Array.isArray(part.hpByLevel)) {
      console.log(`[HP Debug] Part: ${part.name}, isFullStrengthened: ${isFullStrengthened}`);
      console.log(`[HP Debug] hp: ${part.hp}, hp_4: ${part.hp_4}, hp_full: ${part.hp_full}`);
      
      if (isFullStrengthened === 6 && typeof part.hp_full === 'number') {
        partBonus.hp += part.hp_full;
        console.log(`[HP Debug] Applied hp_full: ${part.hp_full}`);
      } else if (isFullStrengthened === 4 && typeof part.hp_4 === 'number') {
        partBonus.hp += part.hp_4;
        console.log(`[HP Debug] Applied hp_4: ${part.hp_4}`);
      } else if (typeof part.hp === 'number') {
        partBonus.hp += part.hp;
        console.log(`[HP Debug] Applied hp: ${part.hp}`);
      }
    }
    if (!Array.isArray(part.shootByLevel)) {
      if (isFullStrengthened === 6 && typeof part.shoot_full === 'number') {
        partBonus.shoot += part.shoot_full;
      } else if (isFullStrengthened === 4 && typeof part.shoot_4 === 'number') {
        partBonus.shoot += part.shoot_4;
      } else if (typeof part.shoot === 'number') {
        partBonus.shoot += part.shoot;
      }
    }
    if (!Array.isArray(part.meleeCorrectionByLevel)) {
      console.log(`[Melee Debug] Part: ${part.name}, isFullStrengthened: ${isFullStrengthened}`);
      console.log(`[Melee Debug] melee: ${part.melee}, melee_4: ${part.melee_4}, melee_full: ${part.melee_full}`);
      
      if (isFullStrengthened === 6 && typeof part.melee_full === 'number') {
        partBonus.meleeCorrection += part.melee_full;
        console.log(`[Melee Debug] Applied melee_full: ${part.melee_full}`);
      } else if (isFullStrengthened === 4 && typeof part.melee_4 === 'number') {
        partBonus.meleeCorrection += part.melee_4;
        console.log(`[Melee Debug] Applied melee_4: ${part.melee_4}`);
      } else if (typeof part.melee === 'number') {
        partBonus.meleeCorrection += part.melee;
        console.log(`[Melee Debug] Applied melee: ${part.melee}`);
      }
    }
    if (!Array.isArray(part.armorRangeByLevel)) {
      if (isFullStrengthened === 6 && typeof part.armor_range_full === 'number') {
        partBonus.armorRange += part.armor_range_full;
      } else if (isFullStrengthened === 4 && typeof part.armor_range_4 === 'number') {
        partBonus.armorRange += part.armor_range_4;
      } else if (typeof part.armor_range === 'number') {
        partBonus.armorRange += part.armor_range;
      } else if (typeof part.shootDefense === 'number') {
        partBonus.armorRange += part.shootDefense;
      }
    }
    if (!Array.isArray(part.armorBeamByLevel)) {
      if (isFullStrengthened === 6 && typeof part.armor_beam_full === 'number') {
        partBonus.armorBeam += part.armor_beam_full;
      } else if (isFullStrengthened === 4 && typeof part.armor_beam_4 === 'number') {
        partBonus.armorBeam += part.armor_beam_4;
      } else if (typeof part.armor_beam === 'number') {
        partBonus.armorBeam += part.armor_beam;
      } else if (typeof part.beamDefense === 'number') {
        partBonus.armorBeam += part.beamDefense;
      }
    }
    if (!Array.isArray(part.armorMeleeByLevel)) {
      if (isFullStrengthened === 6 && typeof part.armor_melee_full === 'number') {
        partBonus.armorMelee += part.armor_melee_full;
      } else if (isFullStrengthened === 4 && typeof part.armor_melee_4 === 'number') {
        partBonus.armorMelee += part.armor_melee_4;
      } else if (typeof part.armor_melee === 'number') {
        partBonus.armorMelee += part.armor_melee;
      } else if (typeof part.meleeDefense === 'number') {
        partBonus.armorMelee += part.meleeDefense;
      }
    }
    if (!Array.isArray(part.thrusterByLevel)) {
      if (typeof part.thruster === 'number') partBonus.thruster += part.thruster;
    }
    if (!Array.isArray(part.speedByLevel)) {
      if (typeof part.speed === 'number') partBonus.speed += part.speed;
    }
    if (!Array.isArray(part.highSpeedMovementByLevel)) {
      if (typeof part.highSpeedMovement === 'number') partBonus.highSpeedMovement += part.highSpeedMovement;
    }
    if (typeof part.turnPerformanceGround === 'number') partBonus.turnPerformanceGround += part.turnPerformanceGround;
    if (typeof part.turnPerformanceSpace === 'number') partBonus.turnPerformanceSpace += part.turnPerformanceSpace;

    if (part.limitIncreases && typeof part.limitIncreases === 'object') {
      for (const statKey in part.limitIncreases) {
        if (part.limitIncreases.hasOwnProperty(statKey) && bonusInitialState.hasOwnProperty(statKey)) {
          const value = part.limitIncreases[statKey];
          if (typeof value === 'number' && !isNaN(value)) {
            partLimitsIncrease[statKey] += value;
            console.log(`Part '${part.name}' added ${value} to limitIncrease for '${statKey}'.`);
          } else {
            console.warn(`[calculateMSStatsLogic] Part '${part.name}' limitIncrease for '${statKey}' is not a valid number: '${value}'`);
          }
        } else {
          console.warn(`[calculateMSStatsLogic] Part '${part.name}' has unhandled limitIncrease key or not in bonusInitialState: '${statKey}'`);
        }
      }
    }
    console.groupEnd();
  });

  // 3. カスタムパーツによる上限引き上げを適用
  displayStatKeys.forEach(key => {
    if (partLimitsIncrease[key] > 0) {
      currentLimits[key] += partLimitsIncrease[key];
      limitChangedFlags[key] = true;
      console.log(`[calculateMSStatsLogic] Applied partLimitsIncrease for ${key}: +${partLimitsIncrease[key]}. New limit: ${currentLimits[key]}`);
    }
  });
  console.log("[calculateMSStatsLogic] currentLimits after MS & Part limit applications (before Expansion):", JSON.parse(JSON.stringify(currentLimits)));

  // 4. フル強化ボーナス加算（3段階対応）
  if (isFullStrengthened > 0 && ms.fullst && Array.isArray(ms.fullst) && fullStrengtheningEffectsData && Array.isArray(fullStrengtheningEffectsData)) {
    // フル強化レベル4の場合は上から4つまで、6の場合は全て適用
    const fsEntriesToProcess = isFullStrengthened === 4 ? ms.fullst.slice(0, 4) : ms.fullst;
    
    fsEntriesToProcess.forEach(fsEntry => {
      const baseFsEffect = fullStrengtheningEffectsData.find(
        fse => fse.name === fsEntry.name
      );
      if (baseFsEffect && baseFsEffect.levels && Array.isArray(baseFsEffect.levels)) {
        const foundFsEffectLevel = baseFsEffect.levels.find(
          l => Number(l.level) === Number(fsEntry.level)
        );
        if (foundFsEffectLevel) {
          for (const statNameInJson in foundFsEffectLevel.effects) {
            if (foundFsEffectLevel.effects.hasOwnProperty(statNameInJson)) {
              const value = foundFsEffectLevel.effects[statNameInJson];
              if (typeof value !== 'number' || isNaN(value)) continue;
              let internalStatKey;
              let isSlotEffect = false;
              switch (statNameInJson) {
                case "HP": internalStatKey = 'hp'; break;
                case "armor_range": internalStatKey = 'armorRange'; break;
                case "armor_beam": internalStatKey = 'armorBeam'; break;
                case "armor_melee": internalStatKey = 'armorMelee'; break;
                case "shoot": internalStatKey = 'shoot'; break;
                case "melee": internalStatKey = 'meleeCorrection'; break;
                case "speed": internalStatKey = 'speed'; break;
                case "highSpeedMovement": internalStatKey = 'highSpeedMovement'; break;
                case "thruster": internalStatKey = 'thruster'; break;
                case "turnPerformanceGround": internalStatKey = 'turnPerformanceGround'; break;
                case "turnPerformanceSpace": internalStatKey = 'turnPerformanceSpace'; break;
                case "近スロット":
                  fullStrengthenSlotBonus.close += value;
                  isSlotEffect = true;
                  break;
                case "中スロット":
                  fullStrengthenSlotBonus.medium += value;
                  isSlotEffect = true;
                  break;
                case "遠スロット":
                  fullStrengthenSlotBonus.long += value;
                  isSlotEffect = true;
                  break;
                default: internalStatKey = null; break;
              }
              if (internalStatKey && fullStrengthenBonus.hasOwnProperty(internalStatKey)) {
                fullStrengthenBonus[internalStatKey] += value;
              }
            }
          }
          if (foundFsEffectLevel.effects.limitIncreases && typeof foundFsEffectLevel.effects.limitIncreases === 'object') {
            for (const statKey in foundFsEffectLevel.effects.limitIncreases) {
              if (foundFsEffectLevel.effects.limitIncreases.hasOwnProperty(statKey) && currentLimits.hasOwnProperty(statKey)) {
                const value = foundFsEffectLevel.effects.limitIncreases[statKey];
                if (typeof value === 'number' && !isNaN(value)) {
                  currentLimits[statKey] += value;
                  limitChangedFlags[statKey] = true;
                }
              }
            }
          }
        }
      }
    });
  }

  // 5. 拡張スキルによるボーナスと上限引き上げ
  switch (expansionType) {
  case "射撃補正拡張":
    expansionBonus.shoot += 8;
    currentLimits.shoot += 8;
    limitChangedFlags.shoot = true; break;
  case "格闘補正拡張":
    expansionBonus.meleeCorrection += 8;
    currentLimits.meleeCorrection += 8;
    limitChangedFlags.meleeCorrection = true; break;
  case "耐実弾補正拡張":
    expansionBonus.armorRange += 10;
    currentLimits.armorRange += 10;
    limitChangedFlags.armorRange = true; break;
  case "耐ビーム補正拡張":
    expansionBonus.armorBeam += 10;
    currentLimits.armorBeam += 10;
    limitChangedFlags.armorBeam = true; break;
  case "耐格闘補正拡張":
    expansionBonus.armorMelee += 10;
    currentLimits.armorMelee += 10;
    limitChangedFlags.armorMelee = true; break;
  case "スラスター拡張":
  expansionBonus.thruster += 10;
  currentLimits.thruster += 20;
  limitChangedFlags.thruster = true;
  break;
  case "パーツ拡張[スラスター]": {
    const specialParts = allPartsCacheForExpansion?.['特殊'] || [];
    const specialPartsCount = parts.filter(p =>
      specialParts.some(sp => sp.name === p.name)
    ).length;
    expansionBonus.thruster += specialPartsCount * 5;
    expansionBonus.thruster = Math.max(expansionBonus.thruster, 0);
    break;
  }
  case "パーツ拡張[HP]": {
    const offensiveParts = allPartsCacheForExpansion?.['攻撃'] || [];
    const offensivePartsCountHP = parts.filter(p =>
      offensiveParts.some(op => op.name === p.name)
    ).length;
    expansionBonus.hp += offensivePartsCountHP * 400;
    expansionBonus.hp = Math.max(expansionBonus.hp, 0);
    break;
  }
  case "パーツ拡張[攻撃]": {
    const movingParts = allPartsCacheForExpansion?.['移動'] || [];
    const movingPartsCountAttack = parts.filter(p =>
      movingParts.some(mp => mp.name === p.name)
    ).length;
    expansionBonus.meleeCorrection += movingPartsCountAttack * 3;
    expansionBonus.shoot += movingPartsCountAttack * 3;
    expansionBonus.meleeCorrection = Math.max(expansionBonus.meleeCorrection, 0);
    expansionBonus.shoot = Math.max(expansionBonus.shoot, 0);
    break;
  }
  case "パーツ拡張[装甲]": {
    const supportParts = allPartsCacheForExpansion?.['補助'] || [];
    const supportPartsCountArmor = parts.filter(p =>
      supportParts.some(sp => sp.name === p.name)
    ).length;
    expansionBonus.armorRange += supportPartsCountArmor * 3;
    expansionBonus.armorBeam += supportPartsCountArmor * 3;
    expansionBonus.armorMelee += supportPartsCountArmor * 3;
    expansionBonus.armorRange = Math.max(expansionBonus.armorRange, 0);
    expansionBonus.armorBeam = Math.max(expansionBonus.armorBeam, 0);
    expansionBonus.armorMelee = Math.max(expansionBonus.armorMelee, 0);
    break;
  }
  default:
    break;
}

  currentLimits.flags = limitChangedFlags;

  const totalStats = {};
  const rawTotalStats = {};
  const isModified = {};

  // 最終的な合計値と上限適用（％加算前の値をrawTotalStatsに入れる）
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

// ★ここから追加：パーツの％上昇項目を適用
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
    const percentBonus = after - before;
    partBonus[statKey] += percentBonus; // 補正値に%分を加算
    rawTotalStats[statKey] = after;
    totalStats[statKey] = Math.min(after, currentLimits[statKey] ?? Infinity);
    isModified[statKey] = true;
    console.log(`[calculateMSStatsLogic] パーツ％効果: ${statKey}を${totalPercent}%増加 (${before}→${after})`);
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
  console.log("[calculateMSStatsLogic] Returning final statsResult:", JSON.parse(JSON.stringify(statsResult)));
  console.groupEnd();
  return statsResult;
};