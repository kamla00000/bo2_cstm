// 併用不可（NG）パーツ判定ロジックを一元管理

// 併用不可対象パーツ名（部分一致）
export const specialTurnPartNames = [
    "運動性能強化機構",
    "コンポジットモーター"
];

// 特殊パーツかどうか判定
export const isSpecialTurnPart = (part) => {
    return specialTurnPartNames.some(name => part.name && part.name.includes(name));
};

// スピード・旋回性能上昇パーツか判定
export const isSpeedOrTurnPart = (part) => {
    return part.speed > 0 || part.turnPerformanceGround > 0 || part.turnPerformanceSpace > 0;
};

// 併用不可判定（グレーアウト用）
export const isPartDisabled = (part, selectedParts) => {
    // 既に装備済みならfalse
    if (selectedParts.some(p => p.name === part.name)) return false;

    // 特殊パーツ装備時、他のスピード/旋回補正パーツはグレーアウト
    if (
        isSpecialTurnPart(part) &&
        selectedParts.some(p => isSpeedOrTurnPart(p) && !isSpecialTurnPart(p))
    ) return true;

    if (
        isSpeedOrTurnPart(part) &&
        selectedParts.some(p => isSpecialTurnPart(p))
    ) return true;

    return false;
};
