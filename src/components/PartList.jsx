import React from 'react';
import { ALL_CATEGORY_NAME } from '../constants/appConstants';

// 画像パスを生成する関数をコンポーネントの外に定義
const getBaseImagePath = (partName) => `/images/parts/${encodeURIComponent(partName)}`;
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'bmp']; // 試す拡張子の優先順位

// 属性の並び順を定義
const CATEGORY_ORDER = ['防御', '攻撃', '移動', '補助', '特殊', ALL_CATEGORY_NAME];

const getCategoryOrder = (category) => {
    const idx = CATEGORY_ORDER.indexOf(category);
    return idx === -1 ? CATEGORY_ORDER.length : idx;
};

// 画像の拡張子フォールバック付き表示
const ImageWithFallback = ({ partName, level, className }) => {
    const [currentExtIndex, setCurrentExtIndex] = React.useState(0);
    const [hasLoaded, setHasLoaded] = React.useState(false);

    const handleError = () => {
        const nextExtIndex = currentExtIndex + 1;
        if (nextExtIndex < IMAGE_EXTENSIONS.length) {
            setCurrentExtIndex(nextExtIndex);
        } else {
            setCurrentExtIndex(IMAGE_EXTENSIONS.length);
        }
    };

    const handleLoad = () => {
        setHasLoaded(true);
    };

    let src;
    if (currentExtIndex < IMAGE_EXTENSIONS.length) {
        const currentExt = IMAGE_EXTENSIONS[currentExtIndex];
        src = `${getBaseImagePath(partName)}.${currentExt}`;
    } else {
        src = '/images/parts/default.jpg';
    }

    return (
        <div className="relative w-full h-full">
            <img
                src={src}
                alt={partName}
                className={`w-full h-full object-cover ${className || ''}`}
                onError={hasLoaded ? null : handleError}
                onLoad={handleLoad}
            />
            {level !== undefined && level !== null && (
                <div className="absolute bottom-0 right-0 bg-gray-900 bg-opacity-75 text-gray-200 text-xs px-1 py-0.5 z-10 pointer-events-none">
                    LV{level}
                </div>
            )}
        </div>
    );
};

const isMutuallyExclusive = (part, selectedParts) => {
    // フィールドモーター系
    const isFieldMotor = part.name && part.name.startsWith("フィールドモーター");
    // コンポジットモーター系
    const isCompositeMotor = part.name && part.name.startsWith("コンポジットモーター");

    // 装備中にフィールドモーター系があるか
    const hasFieldMotor = selectedParts.some(p => p.name && p.name.startsWith("フィールドモーター"));
    // 装備中にコンポジットモーター系があるか
    const hasCompositeMotor = selectedParts.some(p => p.name && p.name.startsWith("コンポジットモーター"));

    // どちらかが装備中で、もう一方を選ぼうとした場合は併用不可
    if (isCompositeMotor && hasFieldMotor) return true;
    if (isFieldMotor && hasCompositeMotor) return true;

    return false;
};

const PartList = ({
    selectedParts,
    onSelect,
    parts,
    onHover,
    hoveredPart,
    selectedMs,
    currentSlotUsage,
    onPreviewSelect,
    categories = [],
    filterCategory,
    setFilterCategory,
}) => {
    if (!parts || !Array.isArray(parts)) {
        return <p className="text-gray-200">パーツデータがありません。</p>;
    }

    // 装備中判定
    const isSelected = (part) => selectedParts.some(p => p.name === part.name);

    // スロットオーバー判定
    const willCauseSlotOverflow = (part) => {
        if (!selectedMs || !currentSlotUsage) return false;
        const maxClose = currentSlotUsage.maxClose || 0;
        const maxMid = currentSlotUsage.maxMid || 0;
        const maxLong = currentSlotUsage.maxLong || 0;
        const currentClose = currentSlotUsage.close || 0;
        const currentMid = currentSlotUsage.mid || 0;
        const currentLong = currentSlotUsage.long || 0;
        const partClose = Number(part.close || 0);
        const partMid = Number(part.mid || 0);
        const partLong = Number(part.long || 0);
        return (
            (currentClose + partClose > maxClose) ||
            (currentMid + partMid > maxMid) ||
            (currentLong + partLong > maxLong)
        );
    };

    // kind重複判定
    const hasSameKind = (part) => {
        if (!part.kind) return false;
        return selectedParts.some(p => p.kind && p.kind === part.kind && p.name !== part.name);
    };

    // 装備数上限
    const isPartLimitReached = selectedParts.length >= 8;

    // 装備可能（未装備）判定
    const isEquipable = (part) => {
        if (isSelected(part)) return false;
        if (isMutuallyExclusive(part, selectedParts)) return false;
        const isOverflowing = selectedMs && currentSlotUsage ? willCauseSlotOverflow(part) : false;
        return !isOverflowing && !isPartLimitReached && !hasSameKind(part);
    };

    // 装備不能判定
    const isNotEquipable = (part) => {
        if (isSelected(part)) return false;
        return !isEquipable(part);
    };

    // 併用不可のみ判定（kind重複も含む）
    const isMutuallyExclusiveOnly = (part) => {
        if (isSelected(part)) return false;
        // 併用不可 or kind重複
        return isMutuallyExclusive(part, selectedParts) || hasSameKind(part);
    };

    // 使用スロット合計
    const getSlotSum = (part) =>
        Number(part.close || 0) + Number(part.mid || 0) + Number(part.long || 0);

    // 属性取得
    const getCategory = (part) => part.category || '';

    // グループ分け
    const equipableParts = parts
        .filter(part => !isSelected(part) && isEquipable(part))
        .sort((a, b) => {
            const slotDiff = getSlotSum(b) - getSlotSum(a);
            if (slotDiff !== 0) return slotDiff;
            return getCategoryOrder(getCategory(a)) - getCategoryOrder(getCategory(b));
        });

    const selectedPartsGroup = parts
        .filter(part => isSelected(part))
        .sort((a, b) => {
            const slotDiff = getSlotSum(b) - getSlotSum(a);
            if (slotDiff !== 0) return slotDiff;
            return getCategoryOrder(getCategory(a)) - getCategoryOrder(getCategory(b));
        });

    // 併用不可＞装備不可 の優先ソート
    const getNotEquipablePriority = (part) => {
        if (isMutuallyExclusiveOnly(part)) return 0; // 併用不可が最優先
        if (isNotEquipable(part)) return 1; // 装備不可
        return 2;
    };
    const notEquipableParts = parts
        .filter(part => !isSelected(part) && isNotEquipable(part))
        .sort((a, b) => {
            const priorityDiff = getNotEquipablePriority(a) - getNotEquipablePriority(b);
            if (priorityDiff !== 0) return priorityDiff;
            const slotDiff = getSlotSum(b) - getSlotSum(a);
            if (slotDiff !== 0) return slotDiff;
            return getCategoryOrder(getCategory(a)) - getCategoryOrder(getCategory(b));
        });

    // 結合
    const sortedParts = [...equipableParts, ...selectedPartsGroup, ...notEquipableParts];

    return (
        <div>
            {/* パーツリスト */}
            <div className="overflow-y-auto pr-2" style={{ maxHeight: '195px' }}>
                {sortedParts.length === 0 ? (
                    <p className="text-gray-200 text-center py-4">パーツデータがありません。</p>
                ) : (
                    <div className="w-full grid" style={{ gridTemplateColumns: 'repeat(auto-fit, 64px)' }}>
                        {sortedParts.map((part) => {
                            const selected = isSelected(part);
                            const partHovered = hoveredPart && hoveredPart.name === part.name;
                            const mutuallyExclusive = isMutuallyExclusiveOnly(part) && !selected;
                            const notEquipable = isNotEquipable(part) && !selected && !mutuallyExclusive;

                            const levelMatch = part.name.match(/_LV(\d+)/);
                            const partLevel = levelMatch ? parseInt(levelMatch[1], 10) : undefined;

                            return (
                                <button
                                    key={part.name}
                                    className={`relative transition-all duration-200 p-0 m-0 overflow-hidden
                                        w-16 h-16 aspect-square
                                        ${selected ? 'bg-green-700' : 'bg-gray-800'}
                                        cursor-pointer
                                    `}
                                    onClick={() => {
                                        if ((!notEquipable && !mutuallyExclusive) || selected) {
                                            onSelect(part);
                                        }
                                        onPreviewSelect?.(part);
                                    }}
                                    onMouseEnter={() => {
                                        if (selected) {
                                            onHover?.(part, 'selectedParts');
                                        } else if (mutuallyExclusive) {
                                            onHover?.(part, 'partListMutualExclusive');
                                        } else if (notEquipable) {
                                            onHover?.(part, 'partListOverflow');
                                        } else {
                                            onHover?.(part, 'partList');
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        onHover?.(null, null);
                                    }}
                                >
                                    <ImageWithFallback partName={part.name} level={partLevel} className="pointer-events-none" />

                                    {/* 併用不可の表示（kind重複も含む、優先） */}
                                    {mutuallyExclusive && !selected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-70 text-red-400 text-base z-20 cursor-not-allowed pointer-events-none">
                                            <span className="[text-shadow:1px_1px_2px_black] flex flex-col items-center justify-center leading-tight space-y-1">
                                                <span>併 用</span>
                                                <span>不 可</span>
                                            </span>
                                        </div>
                                    )}

                                    {/* 不可の表示（mutuallyExclusiveと重複時は非表示） */}
                                    {notEquipable && !selected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-70 text-neon-orange text-base z-20 cursor-not-allowed pointer-events-none">
                                            <span className="[text-shadow:1px_1px_2px_black] flex flex-col items-center justify-center leading-tight space-y-1">
                                                <span>装 備</span>
                                                <span>不 可</span>
                                            </span>
                                        </div>
                                    )}

                                    {/* ホバー時のオレンジ半透明レイヤー */}
                                    {partHovered && !selected && !notEquipable && !mutuallyExclusive && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-orange-500 bg-opacity-60 text-gray-200 text-base z-20 pointer-events-none">
                                            <span className="[text-shadow:1px_1px_2px_black] flex flex-col items-center justify-center leading-tight space-y-1">
                                                <span>装 備</span>
                                                <span>可 能</span>
                                            </span>
                                        </div>
                                    )}

                                    {/* 装備中の表示 */}
                                    {selected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-70 text-neon-offwhite text-base z-20 pointer-events-none">
                                            <span className="[text-shadow:1px_1px_2px_black] flex flex-col items-center justify-center leading-tight space-y-1">
                                                <span>装 備</span>
                                                <span>完 了</span>
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartList;