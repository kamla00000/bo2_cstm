// src/utils/calculateStats.js

// デフォルトの上限値定義
const defaultLimits = {
    hp: 30000, armor: 50, beam: 50, melee: 50, shoot: 100, meleeCorrection: 100,
    speed: 200, highSpeedMovement: Infinity, thruster: 100,
    turnPerformanceGround: Infinity, turnPerformanceSpace: Infinity,
};

// MSステータス計算関数
// allPartsCacheForExpansion はカスタムパーツ拡張スキルを計算する際に必要
export const calculateMSStatsLogic = (ms, parts, isFullStrengthened, expansionType, allPartsCacheForExpansion) => {
    console.log("[calculateMSStatsLogic] Function called with MS:", ms?.MS名, "Parts count:", parts.length, "Full:", isFullStrengthened, "Exp:", expansionType);
    console.log("[calculateMSStatsLogic] Current defaultLimits:", JSON.parse(JSON.stringify(defaultLimits)));

    if (!ms) {
        const defaultStatsValues = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
        console.log("[calculateMSStatsLogic] No MS selected, returning default empty stats.");
        return {
            base: defaultStatsValues, partBonus: { ...defaultStatsValues }, fullStrengthenBonus: { ...defaultStatsValues },
            expansionBonus: { ...defaultStatsValues }, total: { ...defaultStatsValues }, rawTotal: { ...defaultStatsValues },
            currentLimits: { ...defaultStatsValues, flags: {} }
        };
    }

    const baseStats = {
        hp: Number(ms.HP || 0), armor: Number(ms.耐実弾補正 || 0), beam: Number(ms.耐ビーム補正 || 0),
        melee: Number(ms.耐格闘補正 || 0), shoot: Number(ms.射撃補正 || 0), meleeCorrection: Number(ms.格闘補正 || 0),
        speed: Number(ms.スピード || 0), highSpeedMovement: Number(ms.高速移動 || 0), thruster: Number(ms.スラスター || 0),
        turnPerformanceGround: Number(ms["旋回_地上_通常時"] || 0),
        turnPerformanceSpace: Number(ms["旋回_宇宙_通常時"] || 0)
    };
    console.log("[calculateMSStatsLogic] Base Stats (from MS data):", JSON.parse(JSON.stringify(baseStats)));

    const partBonus = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
    const fullStrengthenBonus = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
    const expansionBonus = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
    const partLimitsIncrease = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };

    console.log("[calculateMSStatsLogic] Initial partLimitsIncrease (all zeros):", JSON.parse(JSON.stringify(partLimitsIncrease)));
    console.log("[calculateMSStatsLogic] Processing parts for bonuses and limits. Number of parts:", parts.length);

    // MSの固有上限値を初期値として currentLimits に設定
    const currentLimits = { ...defaultLimits };
    const limitChangedFlags = {};
    const statKeys = ['hp', 'armor', 'beam', 'melee', 'shoot', 'meleeCorrection', 'speed', 'highSpeedMovement', 'thruster', 'turnPerformanceGround', 'turnPerformanceSpace'];

    statKeys.forEach(key => {
        // MS固有の上限がある場合（JSONに「HP上限」などのキーがある場合）
        if (ms[`${key}上限`] !== undefined && ms[`${key}上限`] !== null) {
            console.log(`[calculateMSStatsLogic] MS has specific limit for ${key} (from JSON): ${ms[`${key}上限`]}. Applying.`);
            currentLimits[key] = Number(ms[`${key}上限`]);
            limitChangedFlags[key] = true; // MS固有上限はフラグを立てる
        } else {
             console.log(`[calculateMSStatsLogic] MS has no specific limit for ${key}. Using default: ${defaultLimits[key]}`);
        }
    });
    console.log("[calculateMSStatsLogic] currentLimits after MS-specific limits application (before parts):", JSON.parse(JSON.stringify(currentLimits)));


    parts.forEach((part, index) => {
        console.group(`[calculateMSStatsLogic] Part ${index + 1}/${parts.length}: ${part.name}`);
        console.log(`Full data for part "${part.name}":`, JSON.parse(JSON.stringify(part)));
        console.log(`Keys in this part object for ${part.name}:`, Object.keys(part));

        // カスタムパーツの通常のステータスボーナス加算
        // ここをJSONのキー名に合わせて修正
        if (typeof part.hp === 'number') partBonus.hp += part.hp;
        // 耐実弾補正: shootDefense または armor_range を参照
        if (typeof part.shootDefense === 'number') {
            partBonus.armor += part.shootDefense;
        } else if (typeof part.armor_range === 'number') {
            partBonus.armor += part.armor_range;
        }
        // 耐ビーム補正: beamDefense または armor_beam を参照
        if (typeof part.beamDefense === 'number') {
            partBonus.beam += part.beamDefense;
        } else if (typeof part.armor_beam === 'number') {
            partBonus.beam += part.armor_beam;
        }
        // 耐格闘補正: meleeDefense または armor_melee を参照
        if (typeof part.meleeDefense === 'number') {
            partBonus.melee += part.meleeDefense;
        } else if (typeof part.armor_melee === 'number') {
            partBonus.melee += part.armor_melee;
        }
        
        if (typeof part.shoot === 'number') partBonus.shoot += part.shoot;
        if (typeof part.melee === 'number') partBonus.meleeCorrection += part.melee;
        if (typeof part.speed === 'number') partBonus.speed += part.speed;
        if (typeof part.highSpeedMovement === 'number') partBonus.highSpeedMovement += part.highSpeedMovement;
        if (typeof part.thruster === 'number') partBonus.thruster += part.thruster;
        if (typeof part.turnPerformanceGround === 'number') partBonus.turnPerformanceGround += part.turnPerformanceGround;
        if (typeof part.turnPerformanceSpace === 'number') partBonus.turnPerformanceSpace += part.turnPerformanceSpace;

        console.log(`Current partBonus after processing ${part.name}:`, JSON.parse(JSON.stringify(partBonus)));


        // 上限引き上げプロパティの処理
        console.log(`Checking limit increases (new 'limitIncreases' property) for ${part.name}:`);
        if (part.limitIncreases && typeof part.limitIncreases === 'object') {
            let limitIncreasedThisPart = false;
            for (const statKey in part.limitIncreases) {
                if (part.limitIncreases.hasOwnProperty(statKey)) {
                    if (partLimitsIncrease.hasOwnProperty(statKey)) {
                        const value = part.limitIncreases[statKey];
                        const type = typeof value;

                        console.log(`Part ${part.name} HAS limitIncreases property for '${statKey}'. Value: ${value}, Type: ${type}`);
                        if (type === 'number' && !isNaN(value)) {
                            console.log(`>>> Condition MET for 'limitIncreases.${statKey}'. Adding ${value} to partLimitsIncrease.${statKey}`);
                            partLimitsIncrease[statKey] += value;
                            limitIncreasedThisPart = true;
                        } else {
                            console.log(`Condition NOT MET for 'limitIncreases.${statKey}': Value or Type is incorrect (Expected number, got ${type}). Value: ${value}`);
                        }
                    } else {
                        console.warn(`Warning: Part '${part.name}' has limitIncrease for unknown statKey '${statKey}' in partLimitsIncrease. Skipping.`);
                    }
                }
            }
            if (limitIncreasedThisPart) {
                console.log(`After processing ${part.name}, partLimitsIncrease is now:`, JSON.parse(JSON.stringify(partLimitsIncrease)));
            }
        } else {
            console.log(`No 'limitIncreases' property or it's not an object for ${part.name}.`);
        }
        console.groupEnd();
    });
    console.log("[calculateMSStatsLogic] Final partLimitsIncrease after loop:", JSON.parse(JSON.stringify(partLimitsIncrease)));

    // カスタムパーツによる上限引き上げを適用
    statKeys.forEach(key => {
        if (partLimitsIncrease[key] > 0) {
            console.log(`[calculateMSStatsLogic] Applying collected partLimitsIncrease for ${key}: ${partLimitsIncrease[key]}. Current limit before part increase: ${currentLimits[key]}`);
            if (currentLimits[key] !== Infinity) {
                currentLimits[key] = (currentLimits[key] || defaultLimits[key] || 0) + partLimitsIncrease[key];
                console.log(`[calculateMSStatsLogic] Limit for ${key} after part increase: ${currentLimits[key]}`);
            } else {
                console.log(`[calculateMSStatsLogic] Limit for ${key} is Infinity, not adding part increase from parts.`);
            }
            // limitIncreasesによる上限変更もフラグを立てる
            if (currentLimits[key] !== Infinity) {
                limitChangedFlags[key] = true;
            }
        }
    });
    console.log("[calculateMSStatsLogic] currentLimits after MS & Part limit applications (before Expansion):", JSON.parse(JSON.stringify(currentLimits)));


    // フル強化ボーナス加算
    if (isFullStrengthened) {
        fullStrengthenBonus.hp = 2500; fullStrengthenBonus.armor = 5; fullStrengthenBonus.beam = 5;
        fullStrengthenBonus.melee = 5; fullStrengthenBonus.shoot = 5; fullStrengthenBonus.meleeCorrection = 5;
        fullStrengthenBonus.speed = 5; fullStrengthenBonus.highSpeedMovement = 5; fullStrengthenBonus.thruster = 5;
        fullStrengthenBonus.turnPerformanceGround = 5; fullStrengthenBonus.turnPerformanceSpace = 5;
    }
    console.log("[calculateMSStatsLogic] Full Strengthen Bonus:", JSON.parse(JSON.stringify(fullStrengthenBonus)));

    // 拡張スキルによるボーナスと上限引き上げ
    console.log(`[calculateMSStatsLogic] Checking Expansion Type: ${expansionType}`);
    switch (expansionType) {
        case "射撃補正拡張":
            console.log(`[calculateMSStatsLogic] Applying Shot Correction Expansion: +8. Current limit for shoot: ${currentLimits.shoot}`);
            expansionBonus.shoot += 8;
            if (currentLimits.shoot !== Infinity) currentLimits.shoot = (currentLimits.shoot || defaultLimits.shoot || 0) + 8;
            limitChangedFlags.shoot = true; break;
        case "格闘補正拡張":
            console.log(`[calculateMSStatsLogic] Applying Melee Correction Expansion: +8. Current limit for meleeCorrection: ${currentLimits.meleeCorrection}`);
            expansionBonus.meleeCorrection += 8;
            if (currentLimits.meleeCorrection !== Infinity) currentLimits.meleeCorrection = (currentLimits.meleeCorrection || defaultLimits.meleeCorrection || 0) + 8;
            limitChangedFlags.meleeCorrection = true; break;
        case "耐実弾補正拡張":
            expansionBonus.armor += 10;
            if (currentLimits.armor !== Infinity) currentLimits.armor = (currentLimits.armor || defaultLimits.armor || 0) + 10;
            limitChangedFlags.armor = true; break;
        case "耐ビーム補正拡張":
            expansionBonus.beam += 10;
            if (currentLimits.beam !== Infinity) currentLimits.beam = (currentLimits.beam || defaultLimits.beam || 0) + 10;
            limitChangedFlags.beam = true; break;
        case "耐格闘補正拡張":
            expansionBonus.melee += 10;
            if (currentLimits.melee !== Infinity) currentLimits.melee = (currentLimits.melee || defaultLimits.melee || 0) + 10;
            limitChangedFlags.melee = true; break;
        case "スラスター拡張":
            expansionBonus.thruster += 10;
            if (currentLimits.thruster !== Infinity) currentLimits.thruster = (currentLimits.thruster || defaultLimits.thruster || 0) + 20; // スラスター上限は+20
            limitChangedFlags.thruster = true; break;
        case "カスタムパーツ拡張[HP]":
            const offensivePartsCountHP = parts.filter(p => 
                (allPartsCacheForExpansion['攻撃'] || []).some(op => op.name === p.name)
            ).length;
            expansionBonus.hp += offensivePartsCountHP * 400;
            console.log(`[calculateMSStatsLogic] Custom Part Expansion [HP]: ${offensivePartsCountHP} offensive parts found. HP bonus: ${offensivePartsCountHP * 400}`);
            break;
        case "カスタムパーツ拡張[攻撃]":
            const movingPartsCountAttack = parts.filter(p => 
                (allPartsCacheForExpansion['移動'] || []).some(mp => mp.name === p.name)
            ).length;
            expansionBonus.meleeCorrection += movingPartsCountAttack * 3;
            expansionBonus.shoot += movingPartsCountAttack * 3;
            console.log(`[calculateMSStatsLogic] Custom Part Expansion [Attack]: ${movingPartsCountAttack} moving parts found. Melee/Shoot bonus: ${movingPartsCountAttack * 3}`);
            break;
        case "カスタムパーツ拡張[装甲]":
            const supportPartsCountArmor = parts.filter(p => 
                (allPartsCacheForExpansion['補助'] || []).some(sp => sp.name === p.name)
            ).length;
            expansionBonus.armor += supportPartsCountArmor * 3;
            expansionBonus.beam += supportPartsCountArmor * 3;
            expansionBonus.melee += supportPartsCountArmor * 3;
            console.log(`[calculateMSStatsLogic] Custom Part Expansion [Armor]: ${supportPartsCountArmor} support parts found. Armor/Beam/Melee bonus: ${supportPartsCountArmor * 3}`);
            break;
        case "カスタムパーツ拡張[スラスター]":
            const specialPartsCountThruster = parts.filter(p => 
                (allPartsCacheForExpansion['特殊'] || []).some(spp => spp.name === p.name)
            ).length;
            expansionBonus.thruster += specialPartsCountThruster * 5;
            console.log(`[calculateMSStatsLogic] Custom Part Expansion [Thruster]: ${specialPartsCountThruster} special parts found. Thruster bonus: ${specialPartsCountThruster * 5}`);
            break;
        default:
            console.log("[calculateMSStatsLogic] No specific expansion type applied or handled in switch.");
            break;
    }
    currentLimits.flags = limitChangedFlags;
    console.log("[calculateMSStatsLogic] currentLimits after Expansion application (final currentLimits):", JSON.parse(JSON.stringify(currentLimits)));
    console.log("[calculateMSStatsLogic] Final limitChangedFlags:", JSON.parse(JSON.stringify(limitChangedFlags)));

    const totalStats = {};
    const rawTotalStats = {};
    const displayStatKeys = ['hp', 'armor', 'beam', 'melee', 'shoot', 'meleeCorrection', 'speed', 'highSpeedMovement', 'thruster', 'turnPerformanceGround', 'turnPerformanceSpace'];

    displayStatKeys.forEach(key => {
        let calculatedValue = (baseStats[key] || 0) + (partBonus[key] || 0) + (fullStrengthenBonus[key] || 0) + (expansionBonus[key] || 0);
        rawTotalStats[key] = calculatedValue;
        let finalLimit = currentLimits[key];
        
        // currentLimits[key] が undefined または null の場合、defaultLimits から取得
        // defaultLimits にもない場合は Infinity
        if (finalLimit === undefined || finalLimit === null) {
            console.log(`[calculateMSStatsLogic] Final limit for ${key} was undefined/null. Using defaultLimit: ${defaultLimits[key]}`);
            finalLimit = defaultLimits[key];
            if (finalLimit === undefined || finalLimit === null) {
                finalLimit = Infinity;
                console.log(`[calculateMSStatsLogic] Final limit for ${key} is now Infinity.`);
            }
        }
        console.log(`[calculateMSStatsLogic] Calculating total for ${key}: rawTotal=${calculatedValue}, finalLimit=${finalLimit}`);
        totalStats[key] = Math.min(calculatedValue, finalLimit);
    });

    const statsResult = {
        base: baseStats, partBonus: partBonus, fullStrengthenBonus: fullStrengthenBonus,
        currentLimits: currentLimits, expansionBonus: expansionBonus, rawTotal: rawTotalStats, total: totalStats,
    };
    console.log("[calculateMSStatsLogic] Returning final statsResult:", JSON.parse(JSON.stringify(statsResult)));
    return statsResult;
};