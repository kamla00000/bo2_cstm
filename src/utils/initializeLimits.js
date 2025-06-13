// src/utils/initializeLimits.js

// デフォルトの上限値定義はここに移動
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

/**
 * MSのデフォルト上限値とMS固有の上限値フラグを初期化します。
 * @param {object} ms - 選択されたMSデータ。
 * @returns {object} 初期化された上限値とフラグのオブジェクト。
 */
export const initializeLimits = (ms) => {
    const currentLimits = JSON.parse(JSON.stringify(defaultLimits));
    const limitChangedFlags = {};

    const displayStatKeys = [ // calculateStats.jsから移動
        'hp', 'armorRange', 'armorBeam', 'armorMelee',
        'shoot', 'meleeCorrection', 'speed', 'highSpeedMovement', 'thruster',
        'turnPerformanceGround', 'turnPerformanceSpace',
    ];

    // MS固有の上限値を適用
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
            } else {
                console.warn(`[initializeLimits] MS limit for ${key} ('${msLimitKey}') is not a valid number: '${ms[msLimitKey]}'. Value type: ${typeof ms[msLimitKey]}`);
            }
        }
    });

    currentLimits.flags = limitChangedFlags; // フラグを limits オブジェクトに追加
    return { currentLimits, limitChangedFlags };
};