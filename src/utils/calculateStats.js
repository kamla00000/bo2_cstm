// src/utils/calculateStats.js

// デフォルトの上限値定義
// HPはMSごとに上限が異なるため、ここでは設定せず、MSデータに依存させる。
// それ以外のステータスも、MS固有の上限が設定されていない場合の「ゲームの基本的に上限」を想定。
const defaultLimits = {
    hp: Infinity, // HPはMSごとに異なるため、ここでは無限として扱い、MSデータの上限を優先
    armor: 50,
    beam: 50,
    melee: 50,
    shoot: 100,
    meleeCorrection: 100,
    speed: 200,
    highSpeedMovement: Infinity, // 高速移動に一般的な上限はない
    thruster: 100,
    turnPerformanceGround: Infinity, // 旋回性能に一般的な上限はない
    turnPerformanceSpace: Infinity, // 旋回性能に一般的な上限はない
};

// MSステータス計算関数
// allPartsCacheForExpansion はカスタムパーツ拡張スキルを計算する際に必要
export const calculateMSStatsLogic = (ms, parts, isFullStrengthened, expansionType, allPartsCacheForExpansion, fullStrengtheningEffectsData) => { // fullStrengtheningEffectsData を引数に追加
    console.log("--- calculateMSStatsLogic 実行開始 ---");
    console.log("[calculateMSStatsLogic] Function called with MS:", ms?.MS名, "Parts count:", parts.length, "Full Strengthened:", isFullStrengthened, "Expansion Type:", expansionType);
    console.log("[calculateMSStatsLogic] Initial defaultLimits:", JSON.parse(JSON.stringify(defaultLimits)));
    console.log("[calculateMSStatsLogic] fullStrengtheningEffectsData 存在:", !!fullStrengtheningEffectsData); // fullStrengtheningEffectsData が渡されているか確認

    if (!ms) {
        const defaultStatsValues = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
        console.log("[calculateMSStatsLogic] No MS selected, returning default empty stats.");
        return {
            base: defaultStatsValues, partBonus: { ...defaultStatsValues }, fullStrengthenBonus: { ...defaultStatsValues },
            expansionBonus: { ...defaultStatsValues }, total: { ...defaultStatsValues }, rawTotal: { ...defaultStatsValues },
            currentLimits: { ...defaultStatsValues, flags: {} },
            fullStrengthenSlotBonus: { close: 0, medium: 0, long: 0 } // MSが選択されていない場合も返す
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
    console.log("[calculateMSStatsLogic] Base Stats (from MS data):", JSON.parse(JSON.stringify(baseStats)));

    const partBonus = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
    const fullStrengthenBonus = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
    const expansionBonus = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };
    const partLimitsIncrease = { hp: 0, armor: 0, beam: 0, melee: 0, shoot: 0, meleeCorrection: 0, speed: 0, highSpeedMovement: 0, thruster: 0, turnPerformanceGround: 0, turnPerformanceSpace: 0 };

    // フル強化によるスロットボーナスを管理する新しいオブジェクト
    const fullStrengthenSlotBonus = { close: 0, medium: 0, long: 0 }; // 例: 近/中/遠スロット

    // currentLimits を defaultLimits で初期化
    const currentLimits = { ...defaultLimits };
    const limitChangedFlags = {};
    const statKeys = ['hp', 'armor', 'beam', 'melee', 'shoot', 'meleeCorrection', 'speed', 'highSpeedMovement', 'thruster', 'turnPerformanceGround', 'turnPerformanceSpace'];

    // 1. MS固有の上限値を適用（JSONに「HP上限」などのキーがある場合）
    statKeys.forEach(key => {
        const msLimitKey = `${key}上限`; // 例: "hp上限", "armor上限"
        const msLimitValue = ms[msLimitKey]; // 直接アクセス
        
        if (msLimitValue !== undefined && msLimitValue !== null) {
            const parsedMsLimitValue = Number(msLimitValue);
            if (!isNaN(parsedMsLimitValue)) { // NaNでないことを確認
                currentLimits[key] = parsedMsLimitValue;
                limitChangedFlags[key] = true; // MS固有上限はフラグを立てる
                console.log(`[calculateMSStatsLogic] MS has specific limit for ${key}: ${parsedMsLimitValue}. Applying.`);
            } else {
                console.warn(`[calculateMSStatsLogic] MS limit for ${key} is not a valid number: '${msLimitValue}'`);
            }
        }
    });
    console.log("[calculateMSStatsLogic] currentLimits after MS-specific limits application (before parts):", JSON.parse(JSON.stringify(currentLimits)));

    // 2. カスタムパーツのボーナスと上限引き上げの収集
    parts.forEach(part => {
        console.group(`[calculateMSStatsLogic] Processing Part: ${part.name}`);
        console.log(`Part data for ${part.name}:`, JSON.parse(JSON.stringify(part)));

        // カスタムパーツの通常のステータスボーナス加算
        // 優先順位: 存在する新しいキー (例: shootDefense) -> 既存のキー (例: armor_range)
        if (typeof part.hp === 'number') partBonus.hp += part.hp;

        // 耐実弾補正
        if (typeof part.shootDefense === 'number') {
            partBonus.armor += part.shootDefense;
        } else if (typeof part.armor_range === 'number') {
            partBonus.armor += part.armor_range;
        }
        // 耐ビーム補正
        if (typeof part.beamDefense === 'number') {
            partBonus.beam += part.beamDefense;
        } else if (typeof part.armor_beam === 'number') {
            partBonus.beam += part.armor_beam;
        }
        // 耐格闘補正
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

        // 上限引き上げプロパティの処理 (新しい 'limitIncreases' プロパティ)
        if (part.limitIncreases && typeof part.limitIncreases === 'object') {
            for (const statKey in part.limitIncreases) {
                if (part.limitIncreases.hasOwnProperty(statKey) && partLimitsIncrease.hasOwnProperty(statKey)) {
                    const value = part.limitIncreases[statKey];
                    if (typeof value === 'number' && !isNaN(value)) {
                        partLimitsIncrease[statKey] += value;
                        console.log(`Part '${part.name}' added ${value} to limitIncrease for '${statKey}'.`);
                    }
                }
            }
        }
        console.groupEnd();
    });
    console.log("[calculateMSStatsLogic] Final partBonus after loop:", JSON.parse(JSON.stringify(partBonus)));
    console.log("[calculateMSStatsLogic] Final partLimitsIncrease after loop:", JSON.parse(JSON.stringify(partLimitsIncrease)));

    // 3. カスタムパーツによる上限引き上げを適用
    statKeys.forEach(key => {
        if (partLimitsIncrease[key] > 0) {
            // 現在の上限がInfinityでなければ加算
            if (currentLimits[key] !== Infinity) {
                currentLimits[key] += partLimitsIncrease[key];
                limitChangedFlags[key] = true; // パーツによる上限変更もフラグを立てる
                console.log(`[calculateMSStatsLogic] Applied partLimitsIncrease for ${key}: +${partLimitsIncrease[key]}. New limit: ${currentLimits[key]}`);
            } else {
                console.log(`[calculateMSStatsLogic] Limit for ${key} is Infinity, not adding part increase from parts.`);
            }
        }
    });
    console.log("[calculateMSStatsLogic] currentLimits after MS & Part limit applications (before Expansion):", JSON.parse(JSON.stringify(currentLimits)));


    // 4. フル強化ボーナス加算 (MSのfullst配列を読み込む)
    // fullStrengtheningEffectsData は useAppData.js で fullst.json から読み込まれたデータ全体を指す
    if (isFullStrengthened && ms.fullst && Array.isArray(ms.fullst) && fullStrengtheningEffectsData && Array.isArray(fullStrengtheningEffectsData)) {
        console.log("[calculateMSStatsLogic] Full strengthening is enabled and MS has 'fullst' data.");
        console.log("[calculateMSStatsLogic] MS.fullst data:", JSON.parse(JSON.stringify(ms.fullst)));

        ms.fullst.forEach(fsEntry => { // fsEntry は { name: "...", level: N } の形式
            console.group(`[calculateMSStatsLogic] Processing MS Full Strengthen Entry: ${fsEntry.name} LV${fsEntry.level}`);
            
            // まず、MSのfullstエントリーの名前で、fullStrengtheningEffectsDataから親オブジェクトを探す
            // fullStrengtheningEffectsDataの各要素が name と levels を持つことを想定
            const baseFsEffect = fullStrengtheningEffectsData.find(
                fse => fse.name === fsEntry.name
            );

            if (baseFsEffect && baseFsEffect.levels && Array.isArray(baseFsEffect.levels)) {
                // 次に、親オブジェクトの'levels'配列から、該当レベルのエフェクトを探す
                const foundFsEffectLevel = baseFsEffect.levels.find(
                    l => Number(l.level) === Number(fsEntry.level) // level も数値として比較
                );

                if (foundFsEffectLevel) {
                    console.log(`  Found matching full strengthening effect: ${baseFsEffect.name} LV${foundFsEffectLevel.level}`);
                    console.log(`  Effects:`, JSON.parse(JSON.stringify(foundFsEffectLevel.effects)));

                    // 見つかったパーツのステータスボーナスを fullStrengthenBonus に加算
                    // foundFsEffectLevel.effects オブジェクトのプロパティをループ
                    for (const statNameInJson in foundFsEffectLevel.effects) {
                        if (foundFsEffectLevel.effects.hasOwnProperty(statNameInJson)) {
                            const value = foundFsEffectLevel.effects[statNameInJson];
                            
                            // 数値でない、またはNaNである場合はスキップ
                            if (typeof value !== 'number' || isNaN(value)) {
                                console.log(`    Skipping non-numeric or NaN effect for ${statNameInJson}: ${value}`);
                                // 特殊な文字列値（"3%"など）の処理
                                if (typeof value === 'string') {
                                    // 例えば「スラスター回復時間短縮」のように、表示だけする項目
                                    console.log(`    Special effect (string value) "${statNameInJson}" with value "${value}" will be handled elsewhere or displayed.`);
                                }
                                continue; 
                            }
                            
                            let internalStatKey;
                            let isSlotEffect = false; // スロット効果であるかを示すフラグを追加

                            switch (statNameInJson) {
                                case "HP": internalStatKey = 'hp'; break;
                                case "armor_range": internalStatKey = 'armor'; break; // '耐実弾装甲補強' は 'armor' にマッピング
                                case "armor_beam": internalStatKey = 'beam'; break;   // '耐ビーム装甲補強' は 'beam' にマッピング
                                case "armor_melee": internalStatKey = 'melee'; break; // '耐格闘装甲補強' は 'melee' にマッピング
                                case "shoot": internalStatKey = 'shoot'; break;
                                case "melee": internalStatKey = 'meleeCorrection'; break; // 'AD-PA' の "melee" は 'meleeCorrection' にマッピング
                                case "speed": internalStatKey = 'speed'; break;
                                case "highSpeedMovement": internalStatKey = 'highSpeedMovement'; break;
                                case "thruster": internalStatKey = 'thruster'; break;
                                case "turnPerformanceGround": internalStatKey = 'turnPerformanceGround'; break;
                                case "turnPerformanceSpace": internalStatKey = 'turnPerformanceSpace'; break;
                                // ここからスロット拡張の処理
                                case "近スロット":
                                    fullStrengthenSlotBonus.close += value;
                                    isSlotEffect = true; // スロット効果であることをマーク
                                    console.log(`    Added ${value} to fullStrengthenSlotBonus.close. Current: ${fullStrengthenSlotBonus.close}`);
                                    break;
                                case "中スロット":
                                    fullStrengthenSlotBonus.medium += value;
                                    isSlotEffect = true;
                                    console.log(`    Added ${value} to fullStrengthenSlotBonus.medium. Current: ${fullStrengthenSlotBonus.medium}`);
                                    break;
                                case "遠スロット":
                                    fullStrengthenSlotBonus.long += value;
                                    isSlotEffect = true;
                                    console.log(`    Added ${value} to fullStrengthenSlotBonus.long. Current: ${fullStrengthenSlotBonus.long}`);
                                    break;
                                default: internalStatKey = null; break;
                            }
                            
                            // 既存のステータス加算ロジック (isSlotEffect が true の場合はスキップ)
                            if (internalStatKey && fullStrengthenBonus.hasOwnProperty(internalStatKey)) {
                                fullStrengthenBonus[internalStatKey] += value;
                                console.log(`    Added ${value} to fullStrengthenBonus.${internalStatKey}. Current: ${fullStrengthenBonus[internalStatKey]}`);
                            } else if (isSlotEffect) {
                                // スロット効果は既に上で処理されているので、ここでは何もしない
                                // 特にログも出力しない
                            } else if (statNameInJson.includes("時間短縮") || statNameInJson.includes("ダメージ") || statNameInJson.includes("シールドHP") || statNameInJson.includes("鹵獲時間延長") || statNameInJson.includes("再出撃無視") || statNameInJson.includes("再出撃時HP減少")) {
                                // その他の特殊効果は引き続き別途処理（ここではログのみ）
                                console.log(`    Special effect (non-slot) "${statNameInJson}" with value "${value}" will be handled elsewhere or displayed.`);
                            } else {
                                console.warn(`    Unknown or unhandled full strengthening effect key: ${statNameInJson}. Value: ${value}. Not added to fullStrengthenBonus.`);
                            }
                        }
                    }

                    // フル強化パーツ自体による上限引き上げも考慮する場合、ここに追加
                    // fullst.json の effects 内に limitIncreases がある場合
                    if (foundFsEffectLevel.effects.limitIncreases && typeof foundFsEffectLevel.effects.limitIncreases === 'object') {
                        for (const statKey in foundFsEffectLevel.effects.limitIncreases) {
                            if (foundFsEffectLevel.effects.limitIncreases.hasOwnProperty(statKey) && currentLimits.hasOwnProperty(statKey)) {
                                const value = foundFsEffectLevel.effects.limitIncreases[statKey];
                                if (typeof value === 'number' && !isNaN(value) && currentLimits[statKey] !== Infinity) {
                                    currentLimits[statKey] += value;
                                    limitChangedFlags[statKey] = true;
                                    console.log(`    Full strengthen part increased limit for ${statKey} by ${value}. New limit: ${currentLimits[statKey]}`);
                                }
                            }
                        }
                    }
                } else {
                    console.warn(`  Full strengthening part "${fsEntry.name}" found, but level ${fsEntry.level} not found in its 'levels' array.`);
                }
            } else {
                console.warn(`  Full strengthening part "${fsEntry.name}" not found in fullst.json data or it does not have a 'levels' array.`);
            }
            console.groupEnd();
        });
    } else {
        console.log("[calculateMSStatsLogic] Full strengthening is either disabled, MS has no 'fullst' data, or fullst.json data is not provided/empty.");
    }
    console.log("[calculateMSStatsLogic] Full Strengthen Bonus (final):", JSON.parse(JSON.stringify(fullStrengthenBonus)));
    console.log("[calculateMSStatsLogic] Full Strengthen Slot Bonus (final):", JSON.parse(JSON.stringify(fullStrengthenSlotBonus))); // 追加したログ
    console.log("[calculateMSStatsLogic] Current Limits (after full strengthen effects):", JSON.parse(JSON.stringify(currentLimits)));


    // 5. 拡張スキルによるボーナスと上限引き上げ
    console.log(`[calculateMSStatsLogic] Checking Expansion Type: ${expansionType}`);
    switch (expansionType) {
        case "射撃補正拡張":
            expansionBonus.shoot += 8;
            if (currentLimits.shoot !== Infinity) currentLimits.shoot += 8;
            limitChangedFlags.shoot = true; break;
        case "格闘補正拡張":
            expansionBonus.meleeCorrection += 8;
            if (currentLimits.meleeCorrection !== Infinity) currentLimits.meleeCorrection += 8;
            limitChangedFlags.meleeCorrection = true; break;
        case "耐実弾補正拡張":
            expansionBonus.armor += 10;
            if (currentLimits.armor !== Infinity) currentLimits.armor += 10;
            limitChangedFlags.armor = true; break;
        case "耐ビーム補正拡張":
            expansionBonus.beam += 10;
            if (currentLimits.beam !== Infinity) currentLimits.beam += 10;
            limitChangedFlags.beam = true; break;
        case "耐格闘補正拡張":
            expansionBonus.melee += 10;
            if (currentLimits.melee !== Infinity) currentLimits.melee += 10;
            limitChangedFlags.melee = true; break;
        case "スラスター拡張":
            expansionBonus.thruster += 10;
            if (currentLimits.thruster !== Infinity) currentLimits.thruster += 20; // スラスター上限は+20
            limitChangedFlags.thruster = true; break;
        case "カスタムパーツ拡張[HP]":
            // allPartsCacheForExpansion が '攻撃' カテゴリのパーツを確実に含むことを確認
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
            expansionBonus.armor += supportPartsCountArmor * 3;
            expansionBonus.beam += supportPartsCountArmor * 3;
            expansionBonus.melee += supportPartsCountArmor * 3;
            console.log(`[calculateMSStatsLogic] Custom Part Expansion [Armor]: ${supportPartsCountArmor} support parts found. Armor/Beam/Melee bonus: ${supportPartsCountArmor * 3}`);
            break;
        case "カスタムパーツ拡張[スラスター]":
            const specialParts = allPartsCacheForExpansion?.['特殊'] || [];
            const specialPartsCountThruster = parts.filter(p =>
                specialParts.some(spp => spp.name === p.name)
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

    // 最終的な合計値と上限適用
    displayStatKeys.forEach(key => {
        let calculatedValue = (baseStats[key] || 0) + (partBonus[key] || 0) + (fullStrengthenBonus[key] || 0) + (expansionBonus[key] || 0);
        rawTotalStats[key] = calculatedValue;

        // HPの上限はms.HP上限を優先し、それがなければInfinity
        let finalLimit = currentLimits[key];
        if (key === 'hp' && ms['HP上限'] !== undefined && ms['HP上限'] !== null) {
             finalLimit = Number(ms['HP上限']);
        }

        // Infinityでない場合に上限を適用
        if (finalLimit !== Infinity) {
            totalStats[key] = Math.min(calculatedValue, finalLimit);
        } else {
            totalStats[key] = calculatedValue;
        }
        console.log(`[calculateMSStatsLogic] Final ${key}: rawTotal=${calculatedValue}, finalLimit=${finalLimit}, total=${totalStats[key]}`);
    });

    const statsResult = {
        base: baseStats,
        partBonus: partBonus,
        fullStrengthenBonus: fullStrengthenBonus,
        fullStrengthenSlotBonus: fullStrengthenSlotBonus, // ここを追加
        currentLimits: currentLimits, // 計算後の上限値を返す
        expansionBonus: expansionBonus,
        rawTotal: rawTotalStats,
        total: totalStats,
    };
    console.log("[calculateMSStatsLogic] Returning final statsResult:", JSON.parse(JSON.stringify(statsResult)));
    console.log("--- calculateMSStatsLogic 実行終了 ---");
    return statsResult;
};