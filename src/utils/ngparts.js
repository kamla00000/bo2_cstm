// ngparts.js
// 併用不可（NG）パーツ判定ロジックを一元管理

export const specialTurnPartNames = [
    "運動性能強化機構",
    "コンポジットモーター"
];

export const isSpecialTurnPart = (part) => {
    const result = specialTurnPartNames.some(name => part.name && part.name.includes(name));
    return result;
};

export const isSpeedOrTurnPart = (part) => {
    const isSpeedPositive = typeof part.speed === 'number' && part.speed > 0;
    const isTurnGroundPositive = typeof part.turnPerformanceGround === 'number' && part.turnPerformanceGround > 0;
    const isTurnSpacePositive = typeof part.turnPerformanceSpace === 'number' && part.turnPerformanceSpace > 0;

    // レベル依存の旋回性能上昇パーツも判定
    const isTurnGroundByLevelPositive = Array.isArray(part.turnPerformanceGroundByLevel) && part.turnPerformanceGroundByLevel.some(v => typeof v === 'number' && v > 0);
    const isTurnSpaceByLevelPositive = Array.isArray(part.turnPerformanceSpaceByLevel) && part.turnPerformanceSpaceByLevel.some(v => typeof v === 'number' && v > 0);

    const result = isSpeedPositive || isTurnGroundPositive || isTurnSpacePositive || isTurnGroundByLevelPositive || isTurnSpaceByLevelPositive;
    return result;
};

export const isPartDisabled = (part, selectedParts) => {
    // --- 併用不可ルール追加 ---
    // 大容量補給パックとリロード・オーバーヒート系パーツは併用不可
    const isSupplyPack = part.name && part.name.includes("大容量補給パック");
    const isReloadOrOH = part.description && (part.description.includes("リロード") || part.description.includes("兵装のオーバーヒート"));
    const hasSupplyPackSelected = Array.isArray(selectedParts) && selectedParts.some(p => p.name && p.name.includes("大容量補給パック"));
    const hasReloadOrOHSelected = Array.isArray(selectedParts) && selectedParts.some(p => p.description && (p.description.includes("リロード") || p.description.includes("オーバーヒート")));

    if ((isSupplyPack && hasReloadOrOHSelected) || (isReloadOrOH && hasSupplyPackSelected)) {
        return true;
    }
    const isAlreadySelected = Array.isArray(selectedParts) && selectedParts.some(p => p.name === part.name);
    if (isAlreadySelected) {
        return false;
    }

    const isPartSpecial = isSpecialTurnPart(part);
    const isPartSpeedOrTurn = isSpeedOrTurnPart(part);

    const hasSpecialSelected = Array.isArray(selectedParts) && selectedParts.some(p => isSpecialTurnPart(p));
    const hasSpeedOrTurnSelected = Array.isArray(selectedParts) && selectedParts.some(p => isSpeedOrTurnPart(p) && !isSpecialTurnPart(p));
    const hasOtherSpecialSelected = Array.isArray(selectedParts) && selectedParts.some(p => isSpecialTurnPart(p) && p.name !== part.name);

    // kind重複判定（同種パーツの重複装備不可）
    const partKind = part.kind;
    const hasSameKindSelected = partKind && Array.isArray(selectedParts) && selectedParts.some(p => p.kind === partKind && p.name !== part.name);

    if (isPartSpeedOrTurn && hasSpecialSelected && !isPartSpecial) {
        return true;
    }
    if (isPartSpecial && hasSpeedOrTurnSelected) {
        return true;
    }
    if (isPartSpecial && hasOtherSpecialSelected) {
        return true;
    }
    if (hasSameKindSelected) {
        return true;
    }

    return false;
};