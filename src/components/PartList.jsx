import React from 'react';

// 画像パスを生成する関数をコンポーネントの外に定義
const getBaseImagePath = (partName) => `/images/parts/${encodeURIComponent(partName)}`;
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'bmp']; // 試す拡張子の優先順位

// 属性の並び順を定義
const CATEGORY_ORDER = ['防御', '攻撃', '移動', '補助', '特殊'];
const getCategoryOrder = (category) => {
    const idx = CATEGORY_ORDER.indexOf(category);
    return idx === -1 ? CATEGORY_ORDER.length : idx;
};

// PartList.jsx の中に ImageWithFallback を定義する
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
                <div className="absolute bottom-0 right-0 bg-gray-900 bg-opacity-75 text-gray-200 text-xs font-bold px-1 py-0.5 z-10 pointer-events-none">
                    LV{level}
                </div>
            )}
        </div>
    );
};

const PartList = ({
    selectedParts,
    onSelect,
    parts,
    onHover,
    hoveredPart,
    selectedMs,
    currentSlotUsage,
    onPreviewSelect
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
        const isOverflowing = selectedMs && currentSlotUsage ? willCauseSlotOverflow(part) : false;
        return !isOverflowing && !isPartLimitReached && !hasSameKind(part);
    };

    // 装備不能判定
    const isNotEquipable = (part) => {
        if (isSelected(part)) return false;
        return !isEquipable(part);
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

    const notEquipableParts = parts
        .filter(part => !isSelected(part) && isNotEquipable(part))
        .sort((a, b) => {
            const slotDiff = getSlotSum(b) - getSlotSum(a);
            if (slotDiff !== 0) return slotDiff;
            return getCategoryOrder(getCategory(a)) - getCategoryOrder(getCategory(b));
        });

    // 結合
    const sortedParts = [...equipableParts, ...selectedPartsGroup, ...notEquipableParts];

    return (
        <div className="overflow-y-auto pr-2">
            {sortedParts.length === 0 ? (
                <p className="text-gray-200 text-center py-4">パーツデータがありません。</p>
            ) : (
                <div className="w-full grid" style={{ gridTemplateColumns: 'repeat(auto-fit, 64px)' }}>
                    {sortedParts.map((part) => {
                        const selected = isSelected(part);
                        const partHovered = hoveredPart && hoveredPart.name === part.name;
                        const notEquipable = isNotEquipable(part) && !selected;

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
                                    if (!notEquipable || selected) {
                                        onSelect(part);
                                    }
                                    onPreviewSelect?.(part);
                                }}
                                onMouseEnter={() => {
                                    if (selected) {
                                        onHover?.(part, 'selectedParts');
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

                                {/* ホバー時のオレンジ半透明レイヤー */}
                                {partHovered && !selected && !notEquipable && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-orange-500 bg-opacity-60 text-gray-200 font-bold text-base z-20 writing-mode-vertical-rl pointer-events-none">
                                        装<br />備
                                    </div>
                                )}

                                {/* 装備中の表示 */}
                                {selected && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-70 text-green-400 font-bold text-base z-20 writing-mode-vertical-rl pointer-events-none">
                                        装<br />備<br />中
                                    </div>
                                )}

                                {/* 不可の表示 */}
                                {notEquipable && !selected && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-70 text-red-500 font-bold text-base z-20 cursor-not-allowed writing-mode-vertical-rl pointer-events-none">
                                        不<br />可
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PartList;