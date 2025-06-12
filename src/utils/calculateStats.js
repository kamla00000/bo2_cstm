// src/utils/calculateStats.js

// デフォルトの上限値定義
const defaultLimits = {
    hp: Infinity,
    armorRange: 50,
    armorBeam: 50,
    armorMelee: 50,
    shoot: 100,
    meleeCorrection: 100,
    speed: 200,
    highSpeedMovement: Infinity,
    thruster: 100,
    turnPerformanceGround: Infinity,
    turnPerformanceSpace: Infinity,
};

export const calculateMSStatsLogic = (ms, parts, isFullStrengthened, expansionType, allPartsCacheForExpansion, fullStrengtheningEffectsData) => {
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

    if (!ms) {
        const defaultStatsValues = {
            hp: 0, armorRange: 0, armorBeam: 0, armorMelee: 0,
            shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0,
            turnPerformanceGround: 0, turnPerformanceSpace: 0,
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

    const baseStats = {
        hp: Number(ms.HP || 0),
        armorRange: Number(ms.耐実弾補正 || 0),
        armorBeam: Number(ms.耐ビーム補正 || 0),
        armorMelee: Number(ms.耐格闘補正 || 0),
        shoot: Number(ms.射撃補正 || 0),
        meleeCorrection: Number(ms.格闘補正 || 0),
        speed: Number(ms.スピード || 0),
        highSpeedMovement: Number(ms.高速移動 || 0),
        thruster: Number(ms.スラスター || 0),
        turnPerformanceGround: Number(ms["旋回_地上_通常時"] || 0),
        turnPerformanceSpace: Number(ms["旋回_宇宙_通常時"] || 0),
    };
    console.log("[calculateMSStatsLogic] Base Stats (after Number() conversion from MS data):", JSON.parse(JSON.stringify(baseStats)));

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

    const currentLimits = JSON.parse(JSON.stringify(defaultLimits));
    const limitChangedFlags = {};
    const displayStatKeys = [
        'hp', 'armorRange', 'armorBeam', 'armorMelee',
        'shoot', 'meleeCorrection', 'speed', 'highSpeedMovement', 'thruster',
        'turnPerformanceGround', 'turnPerformanceSpace',
    ];

    // 1. MS固有の上限値を適用
    displayStatKeys.forEach(key => {
        let msLimitKey;
        switch(key) {
            case 'hp': msLimitKey = 'HP上限'; break;
            case 'armorRange': msLimitKey = '耐実弾補正上限'; break;
            case 'armorBeam': msLimitKey = '耐ビーム補正上限'; break;
            case 'armorMelee': msLimitKey = '耐格闘補正上限'; break;
            case 'shoot': msLimitKey = '射撃補正上限'; break;
            case 'meleeCorrection': msLimitKey = '格闘補正上限'; break;
            case 'speed': msLimitKey = 'スピード上限'; break;
            case 'highSpeedMovement': msLimitKey = '高速移動上限'; break;
            case 'thruster': msLimitKey = 'スラスター上限'; break;
            case 'turnPerformanceGround': msLimitKey = '旋回_地上_通常時上限'; break;
            case 'turnPerformanceSpace': msLimitKey = '旋回_宇宙_通常時上限'; break;
            default: msLimitKey = null; break;
        }

        if (msLimitKey && ms[msLimitKey] !== undefined && ms[msLimitKey] !== null) {
            const parsedMsLimitValue = Number(ms[msLimitKey]);
            if (!isNaN(parsedMsLimitValue)) {
                currentLimits[key] = parsedMsLimitValue;
                limitChangedFlags[key] = true;
                console.log(`[calculateMSStatsLogic] MS has specific limit for ${key} ('${msLimitKey}'): ${parsedMsLimitValue}. Applying.`);
            } else {
                console.warn(`[calculateMSStatsLogic] MS limit for ${key} ('${msLimitKey}') is not a valid number: '${ms[msLimitKey]}'. Value type: ${typeof ms[msLimitKey]}`);
            }
        }
    });
    console.log("[calculateMSStatsLogic] currentLimits after MS-specific limits application (before parts):", JSON.parse(JSON.stringify(currentLimits)));

    // 2. カスタムパーツのボーナスと上限引き上げの収集
    parts.forEach(part => {
        console.groupCollapsed(`[calculateMSStatsLogic] Processing Part: ${part.name}`);
        console.log(`Part data for ${part.name}:`, JSON.parse(JSON.stringify(part)));

        // 各ステータスの加算処理
        if (typeof part.hp === 'number') partBonus.hp += part.hp;
        if (typeof part.shootDefense === 'number') partBonus.armorRange += part.shootDefense;
        else if (typeof part.armor_range === 'number') partBonus.armorRange += part.armor_range;
        if (typeof part.beamDefense === 'number') partBonus.armorBeam += part.beamDefense;
        else if (typeof part.armor_beam === 'number') partBonus.armorBeam += part.armor_beam;
        if (typeof part.meleeDefense === 'number') partBonus.armorMelee += part.meleeDefense;
        else if (typeof part.armor_melee === 'number') partBonus.armorMelee += part.armor_melee;

        if (typeof part.shoot === 'number') partBonus.shoot += part.shoot;
        if (typeof part.melee === 'number') partBonus.meleeCorrection += part.melee;
        if (typeof part.speed === 'number') partBonus.speed += part.speed;
        if (typeof part.highSpeedMovement === 'number') partBonus.highSpeedMovement += part.highSpeedMovement;
        if (typeof part.thruster === 'number') partBonus.thruster += part.thruster;
        if (typeof part.turnPerformanceGround === 'number') partBonus.turnPerformanceGround += part.turnPerformanceGround;
        if (typeof part.turnPerformanceSpace === 'number') partBonus.turnPerformanceSpace += part.turnPerformanceSpace;

        console.log(`Current partBonus after processing ${part.name}:`, JSON.parse(JSON.stringify(partBonus)));

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
    console.log("[calculateMSStatsLogic] Final partBonus after loop:", JSON.parse(JSON.stringify(partBonus)));
    console.log("[calculateMSStatsLogic] Final partLimitsIncrease after loop:", JSON.parse(JSON.stringify(partLimitsIncrease)));

    // 3. カスタムパーツによる上限引き上げを適用
    displayStatKeys.forEach(key => {
        if (partLimitsIncrease[key] > 0) {
            currentLimits[key] += partLimitsIncrease[key];
            limitChangedFlags[key] = true;
            console.log(`[calculateMSStatsLogic] Applied partLimitsIncrease for ${key}: +${partLimitsIncrease[key]}. New limit: ${currentLimits[key]}`);
        }
    });
    console.log("[calculateMSStatsLogic] currentLimits after MS & Part limit applications (before Expansion):", JSON.parse(JSON.stringify(currentLimits)));

    // 4. フル強化ボーナス加算
    if (isFullStrengthened && ms.fullst && Array.isArray(ms.fullst) && fullStrengtheningEffectsData && Array.isArray(fullStrengtheningEffectsData)) {
        console.log("[calculateMSStatsLogic] Full strengthening is enabled and MS has 'fullst' data.");
        console.log("[calculateMSStatsLogic] MS.fullst data:", JSON.parse(JSON.stringify(ms.fullst)));

        ms.fullst.forEach(fsEntry => {
            console.groupCollapsed(`[calculateMSStatsLogic] Processing MS Full Strengthen Entry: ${fsEntry.name} LV${fsEntry.level}`);

            const baseFsEffect = fullStrengtheningEffectsData.find(
                fse => fse.name === fsEntry.name
            );

            if (baseFsEffect && baseFsEffect.levels && Array.isArray(baseFsEffect.levels)) {
                const foundFsEffectLevel = baseFsEffect.levels.find(
                    l => Number(l.level) === Number(fsEntry.level)
                );

                if (foundFsEffectLevel) {
                    console.log(`   Found matching full strengthening effect: ${baseFsEffect.name} LV${foundFsEffectLevel.level}`);
                    console.log(`   Effects:`, JSON.parse(JSON.stringify(foundFsEffectLevel.effects)));

                    for (const statNameInJson in foundFsEffectLevel.effects) {
                        if (foundFsEffectLevel.effects.hasOwnProperty(statNameInJson)) {
                            const value = foundFsEffectLevel.effects[statNameInJson];

                            if (typeof value !== 'number' || isNaN(value)) {
                                console.log(`   Skipping non-numeric or NaN effect for ${statNameInJson}: ${value}`);
                                if (typeof value === 'string') {
                                    console.log(`   Special effect (string value) "${statNameInJson}" with value "${value}" will be handled elsewhere or displayed.`);
                                }
                                continue;
                            }

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
                                    console.log(`   Added ${value} to fullStrengthenSlotBonus.close. Current: ${fullStrengthenSlotBonus.close}`);
                                    break;
                                case "中スロット":
                                    fullStrengthenSlotBonus.medium += value;
                                    isSlotEffect = true;
                                    console.log(`   Added ${value} to fullStrengthenSlotBonus.medium. Current: ${fullStrengthenSlotBonus.medium}`);
                                    break;
                                case "遠スロット":
                                    fullStrengthenSlotBonus.long += value;
                                    isSlotEffect = true;
                                    console.log(`   Added ${value} to fullStrengthenSlotBonus.long. Current: ${fullStrengthenSlotBonus.long}`);
                                    break;
                                default: internalStatKey = null; break;
                            }

                            if (internalStatKey && fullStrengthenBonus.hasOwnProperty(internalStatKey)) {
                                fullStrengthenBonus[internalStatKey] += value;
                                console.log(`   Added ${value} to fullStrengthenBonus.${internalStatKey}. Current: ${fullStrengthenBonus[internalStatKey]}`);
                            } else if (isSlotEffect) {
                                // Do nothing, already handled
                            } else if (statNameInJson.includes("時間短縮") || statNameInJson.includes("ダメージ") || statNameInJson.includes("シールドHP") || statNameInJson.includes("鹵獲時間延長") || statNameInJson.includes("再出撃無視") || statNameInJson.includes("再出撃時HP減少")) {
                                console.log(`   Special effect (non-slot) "${statNameInJson}" with value "${value}" will be handled elsewhere or displayed.`);
                            } else {
                                console.warn(`   Unknown or unhandled full strengthening effect key: ${statNameInJson}. Value: ${value}. Not added to fullStrengthenBonus.`);
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
                                    console.log(`   Full strengthen part increased limit for ${statKey} by ${value}. New limit: ${currentLimits[statKey]}`);
                                }
                            } else {
                                console.warn(`   Full strengthen effect has unhandled limitIncrease key: '${statKey}'`);
                            }
                        }
                    }
                } else {
                    console.warn(`   Full strengthening part "${fsEntry.name}" found, but level ${fsEntry.level} not found in its 'levels' array.`);
                }
            } else {
                console.warn(`   Full strengthening part "${fsEntry.name}" not found in fullst.json data or it does not have a 'levels' array.`);
            }
            console.groupEnd();
        });
    } else {
        console.log("[calculateMSStatsLogic] Full strengthening is either disabled, MS has no 'fullst' data, or fullst.json data is not provided/empty.");
    }
    console.log("[calculateMSStatsLogic] Full Strengthen Bonus (final):", JSON.parse(JSON.stringify(fullStrengthenBonus)));
    console.log("[calculateMSStatsLogic] Full Strengthen Slot Bonus (final):", JSON.parse(JSON.stringify(fullStrengthenSlotBonus)));
    console.log("[calculateMSStatsLogic] Current Limits (after full strengthen effects):", JSON.parse(JSON.stringify(currentLimits)));

    // 5. 拡張スキルによるボーナスと上限引き上げ
    console.log(`[calculateMSStatsLogic] Checking Expansion Type: ${expansionType}`);
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
            limitChangedFlags.thruster = true; break;
        case "カスタムパーツ拡張[HP]":
            const offensiveParts = allPartsCacheForExpansion?.['攻撃'] || [];
            const offensivePartsCountHP = parts.filter(p =>
                offensiveParts.some(op => op.name === p.name)
            ).length;
            expansionBonus.hp += offensivePartsCountHP * 400;
            console.log(`[calculateMSStatsLogic] Custom Part Expansion [HP]: ${offensivePartsCountHP} offensive parts found. HP bonus: ${offensivePartsCountHP * 400}`);
            break;
        case "カスタムパーツ拡張[攻撃]":
            const movingParts = allPartsCacheForExpansion?.['移動'] || [];
            const movingPartsCountAttack = parts.filter(p =>
                movingParts.some(mp => mp.name === p.name)
            ).length;
            expansionBonus.meleeCorrection += movingPartsCountAttack * 3;
            expansionBonus.shoot += movingPartsCountAttack * 3;
            console.log(`[calculateMSStatsLogic] Custom Part Expansion [Attack]: ${movingPartsCountAttack} moving parts found. Melee/Shoot bonus: ${movingPartsCountAttack * 3}`);
            break;
        case "カスタムパーツ拡張[装甲]":
            const supportParts = allPartsCacheForExpansion?.['補助'] || [];
            const supportPartsCountArmor = parts.filter(p =>
                supportParts.some(sp => sp.name === p.name)
            ).length;
            expansionBonus.armorRange += supportPartsCountArmor * 3;
            expansionBonus.armorBeam += supportPartsCountArmor * 3;
            expansionBonus.armorMelee += supportPartsCountArmor * 3;
            console.log(`[calculateMSStatsLogic] Custom Part Expansion [Armor]: ${supportPartsCountArmor} support parts found. Armor/Beam/Melee bonus: ${supportPartsCountArmor * 3}`);
            break;
        case "カスタムパーツ拡張[スラスター]":
            const specialParts = allPartsCacheForExpansion?.['特殊'] || [];
            const specialPartsCountThruster = parts.filter(p =>
                specialParts.some(spp => spp.name === p.name)
            ).length;
            expansionBonus.thruster += specialPartsCountThruster * 5;
            console.log(`[calculateMSStatsLogic] Custom Part Expansion [Thruster]: ${specialPartsCountThruster * 5} special parts found. Thruster bonus: ${specialPartsCountThruster * 5}`);
            break;
        default:
            console.log("[calculateMSStatsLogic] No specific expansion type applied or handled in switch.");
            break;
    }
    currentLimits.flags = limitChangedFlags;
    console.log("[calculateMSStatsLogic] Current Limits (after Expansion application (final currentLimits):", JSON.parse(JSON.stringify(currentLimits)));
    console.log("[calculateMSStatsLogic] Final limitChangedFlags:", JSON.parse(JSON.stringify(limitChangedFlags)));

    const totalStats = {};
    const rawTotalStats = {};
    const isModified = {};

    // 最終的な合計値と上限適用
    displayStatKeys.forEach(key => {
        let calculatedValue = (baseStats[key] || 0) + (partBonus[key] || 0) + (fullStrengthenBonus[key] || 0) + (expansionBonus[key] || 0);
        rawTotalStats[key] = calculatedValue;

        let finalLimit = currentLimits[key]; 
        // finalLimit が null または undefined の場合、Infinity にフォールバックさせる
        if (finalLimit === null || finalLimit === undefined) {
            finalLimit = Infinity;
        }
        
        if (finalLimit !== Infinity) {
            totalStats[key] = Math.min(calculatedValue, finalLimit);
        } else {
            totalStats[key] = calculatedValue;
        }
        console.log(`[calculateMSStatsLogic] Final ${key}: base=${baseStats[key]}, partBonus=${partBonus[key]}, fullStrengthenBonus=${fullStrengthenBonus[key]}, expansionBonus=${expansionBonus[key]}, rawTotal=${calculatedValue}, finalLimit=${finalLimit}, total=${totalStats[key]}`);

        // isModified の判定ロジックを改善
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

    const statsResult = {
        base: baseStats,
        partBonus: partBonus,
        fullStrengthenBonus: fullStrengthenBonus,
        fullStrengthenSlotBonus: fullStrengthenSlotBonus,
        currentLimits: { ...currentLimits, flags: limitChangedFlags },
        expansionBonus: expansionBonus,
        rawTotal: rawTotalStats,
        total: totalStats,
        isModified: isModified
    };
    console.log("[calculateMSStatsLogic] Returning final statsResult:", JSON.parse(JSON.stringify(statsResult)));
    console.groupEnd(); // --- calculateMSStatsLogic 実行終了 ---
    return statsResult;
};