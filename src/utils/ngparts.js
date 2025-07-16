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

    const result = isSpeedPositive || isTurnGroundPositive || isTurnSpacePositive;
    return result;
};

export const isPartDisabled = (part, selectedParts) => {
    const isAlreadySelected = Array.isArray(selectedParts) && selectedParts.some(p => p.name === part.name);
    if (isAlreadySelected) {
        return false;
    }

    const isPartSpecial = isSpecialTurnPart(part);
    const isPartSpeedOrTurn = isSpeedOrTurnPart(part);

    const hasSpecialSelected = Array.isArray(selectedParts) && selectedParts.some(p => isSpecialTurnPart(p));
    const hasSpeedOrTurnSelected = Array.isArray(selectedParts) && selectedParts.some(p => isSpeedOrTurnPart(p) && !isSpecialTurnPart(p));
    
    const hasOtherSpecialSelected = Array.isArray(selectedParts) && selectedParts.some(p => isSpecialTurnPart(p) && p.name !== part.name);

    if (isPartSpeedOrTurn && hasSpecialSelected && !isPartSpecial) {
        return true;
    }

    if (isPartSpecial && hasSpeedOrTurnSelected) {
        return true;
    }

    if (isPartSpecial && hasOtherSpecialSelected) {
        return true;
    }

    return false;
};