// ngparts.js
// 併用不可（NG）パーツ判定ロジックを一元管理

export const specialTurnPartNames = [
    "運動性能強化機構",
    "コンポジットモーター"
];

// 特殊系パーツ判定
export const isSpecialTurnPart = (part) => {
    return specialTurnPartNames.some(name => part && part.name && part.name.includes(name));
};


// スピード上昇パーツ判定
export const isSpeedPart = (part) => {
    // コネクティングシステム［強襲Ⅰ型］_LV1は常にスピード上昇パーツ扱い（併用不可判定対象）
    if (part.name && part.name.includes('コネクティングシステム') && part.name.includes('強襲')) return true;
    return (typeof part.speed === 'number' && part.speed > 0);
};

// 旋回性能上昇パーツ判定
export const isTurnPart = (part) => {
    const isTurnGroundPositive = typeof part.turnPerformanceGround === 'number' && part.turnPerformanceGround > 0;
    const isTurnSpacePositive = typeof part.turnPerformanceSpace === 'number' && part.turnPerformanceSpace > 0;
    const isTurnGroundByLevelPositive = Array.isArray(part.turnPerformanceGroundByLevel) && part.turnPerformanceGroundByLevel.some(v => typeof v === 'number' && v > 0);
    const isTurnSpaceByLevelPositive = Array.isArray(part.turnPerformanceSpaceByLevel) && part.turnPerformanceSpaceByLevel.some(v => typeof v === 'number' && v > 0);
    return isTurnGroundPositive || isTurnSpacePositive || isTurnGroundByLevelPositive || isTurnSpaceByLevelPositive;
};


export const isPartDisabled = (part, selectedParts) => {
    // --- 併用不可ルール追加 ---
    // 大容量補給パックとリロード・オーバーヒート系パーツは併用不可
    const isSupplyPack = part.name && part.name.includes("大容量補給パック");
    const isReloadOrOH = part.description && (part.description.includes("リロード") || part.description.includes("兵装のオーバーヒート"));
    const hasSupplyPackSelected = Array.isArray(selectedParts) && selectedParts.some(p => p.name && p.name.includes("大容量補給パック"));
    const hasReloadOrOHSelected = Array.isArray(selectedParts) && selectedParts.some(p => p.description && (p.description.includes("リロード") || p.description.includes("兵装のオーバーヒート")));
    // 火器管制最適化システムとASL/兵装の収束時間系パーツは併用不可
    const isFireControlSystem = part.name && part.name.includes("火器管制最適化システム");
    const isASLOrConverge = part.description && (part.description.includes("ASL") || part.description.includes("兵装の集束時間"));
    const hasFireControlSystemSelected = Array.isArray(selectedParts) && selectedParts.some(p => p.name && p.name.includes("火器管制最適化システム"));
    const hasASLOrConvergeSelected = Array.isArray(selectedParts) && selectedParts.some(p => p.description && (p.description.includes("ASL") || p.description.includes("兵装の集束時間")));
    // コネクティングシステム[支援Ⅰ型]_LV1と大容量補給パック・火器管制最適化システムは併用不可
    const isConnectingSystem = part.name && part.name.includes("コネクティングシステム[支援Ⅰ型]_LV1");
    const hasConnectingSystemSelected = Array.isArray(selectedParts) && selectedParts.some(p => p.name && p.name.includes("コネクティングシステム[支援Ⅰ型]_LV1"));

    if ((isFireControlSystem && hasASLOrConvergeSelected) || (isASLOrConverge && hasFireControlSystemSelected)) {
        return true;
    }
    if ((isSupplyPack && hasReloadOrOHSelected) || (isReloadOrOH && hasSupplyPackSelected)) {
        return true;
    }
    // 新ルール：コネクティングシステム[支援Ⅰ型]_LV1と大容量補給パック・火器管制最適化システムは併用不可
    if (
        (isConnectingSystem && (hasSupplyPackSelected || hasFireControlSystemSelected)) ||
        ((isSupplyPack || isFireControlSystem) && hasConnectingSystemSelected)
    ) {
        return true;
    }

    const isAlreadySelected = Array.isArray(selectedParts) && selectedParts.some(p => p.name === part.name);
    if (isAlreadySelected) {
        return false;
    }

    const isPartSpecial = isSpecialTurnPart(part);

    const isPartSpeed = isSpeedPart(part);
    const isPartTurn = isTurnPart(part);

    const hasSpecialSelected = Array.isArray(selectedParts) && selectedParts.some(p => isSpecialTurnPart(p));
    const hasSpeedSelected = Array.isArray(selectedParts) && selectedParts.some(p => isSpeedPart(p) && !isSpecialTurnPart(p));
    const hasTurnSelected = Array.isArray(selectedParts) && selectedParts.some(p => isTurnPart(p) && !isSpecialTurnPart(p));
    const hasOtherSpecialSelected = Array.isArray(selectedParts) && selectedParts.some(p => isSpecialTurnPart(p) && p.name !== part.name);

    // kind重複判定（同種パーツの重複装備不可）
    const partKind = part.kind;
    const hasSameKindSelected = partKind && Array.isArray(selectedParts) && selectedParts.some(p => p.kind === partKind && p.name !== part.name);



    // スピード上昇パーツ同士の併用不可（双方向）
    if (isPartSpeed && hasSpeedSelected) {
        if (!isAlreadySelected) {
            return true;
        }
    }
    // 特殊系とスピード/旋回系の併用不可
    if ((isPartSpeed || isPartTurn) && hasSpecialSelected && !isPartSpecial) {
        return true;
    }
    if (isPartSpecial && (hasSpeedSelected || hasTurnSelected)) {
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