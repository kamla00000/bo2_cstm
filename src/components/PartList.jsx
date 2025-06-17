import React from 'react';

// 画像パスを生成する関数をコンポーネントの外に定義
const getBaseImagePath = (partName) => `/images/parts/${encodeURIComponent(partName)}`;
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'bmp']; // 試す拡張子の優先順位

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
                <div className="absolute bottom-0 right-0 bg-gray-900 bg-opacity-75 text-white text-xs font-bold px-1 py-0.5 rounded-tl-lg z-10 pointer-events-none">
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
        return <p className="text-gray-400">パーツデータがありません。</p>;
    }

    const willCauseSlotOverflow = (part) => {
        if (!selectedMs || !currentSlotUsage) {
            return false;
        }

        const maxClose = currentSlotUsage.maxClose || 0;
        const maxMid = currentSlotUsage.maxMid || 0;
        const maxLong = currentSlotUsage.maxLong || 0;

        const currentClose = currentSlotUsage.close || 0;
        const currentMid = currentSlotUsage.mid || 0;
        const currentLong = currentSlotUsage.long || 0;

        const partClose = Number(part.close || 0);
        const partMid = Number(part.mid || 0);
        const partLong = Number(part.long || 0);

        const overflow = (
            (currentClose + partClose > maxClose) ||
            (currentMid + partMid > maxMid) ||
            (currentLong + partLong > maxLong)
        );
        return overflow;
    };

    return (
        <div className="overflow-y-auto pr-2 custom-scrollbar h-[500px]">
            {parts.length === 0 ? (
                <p className="text-gray-400 text-center py-4">選択されたカテゴリのパーツはありません。</p>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-16 gap-0">
                    {parts.map((part) => {
                        const isSelected = selectedParts.some(p => p.name === part.name);
                        const isPartHovered = hoveredPart && hoveredPart.name === part.name;

                        const isOverflowing = (selectedMs && currentSlotUsage) ? willCauseSlotOverflow(part) : false;
                        const isPartLimitReached = selectedParts.length >= 8;
                        const isNotSelectable = (isOverflowing || isPartLimitReached) && !isSelected; // 選択中の場合は「不可」としない

                        const levelMatch = part.name.match(/_LV(\d+)/);
                        const partLevel = levelMatch ? parseInt(levelMatch[1], 10) : undefined;

                        return (
                            <button
                                key={part.name}
                                className={`relative transition-all duration-200 p-0 rounded-lg overflow-hidden
                                    w-16 h-16 aspect-square
                                    ${isSelected ? 'bg-green-700' : 'bg-gray-800'}
                                    outline outline-1 outline-gray-900
                                    cursor-pointer
                                    ${isPartHovered ? 'outline-yellow-400 outline-2 z-30' : ''}
                                `}
                                onClick={() => {
                                    if (!isNotSelectable || isSelected) {
                                        onSelect(part);
                                    }
                                    // プレビュー固定
                                    onPreviewSelect?.(part);
                                }}
                                onMouseEnter={() => {
                                    if (isSelected) {
                                        onHover?.(part, 'selectedParts');
                                    } else if (isNotSelectable) {
                                        onHover?.(part, 'partListOverflow');
                                    }
                                    else {
                                        onHover?.(part, 'partList');
                                    }
                                }}
                                onMouseLeave={() => {
                                    onHover?.(null, null);
                                }}
                            >
                                <ImageWithFallback partName={part.name} level={partLevel} className="pointer-events-none" />

                                {/* 「装備」表示 (縦書き) とグレーアウト */}
                                {isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-green-400 font-bold text-base z-20 writing-mode-vertical-rl pointer-events-none">
                                        装<br />備
                                    </div>
                                )}

                                {/* 「不可」表示 (縦書き) とグレーアウト */}
                                {isNotSelectable && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-red-500 font-bold text-base z-20 cursor-not-allowed writing-mode-vertical-rl pointer-events-none">
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