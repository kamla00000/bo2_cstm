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
            // 全ての拡張子を試しても画像が見つからない場合
            setCurrentExtIndex(IMAGE_EXTENSIONS.length);
        }
    };

    const handleLoad = () => {
        setHasLoaded(true);
    };

    React.useEffect(() => {
        // partNameが変わったら状態をリセット
        setCurrentExtIndex(0);
        setHasLoaded(false);
    }, [partName]);

    let src;
    if (currentExtIndex < IMAGE_EXTENSIONS.length) {
        const currentExt = IMAGE_EXTENSIONS[currentExtIndex];
        src = `${getBaseImagePath(partName)}.${currentExt}`;
    } else {
        src = '/images/parts/default.webp'; // デフォルト画像
    }

    return (
        <div className="relative w-full h-full">
            <img
                src={src}
                alt={partName}
                className={`w-full h-full object-cover ${className || ''}`}
                // 画像がロード済みでない場合にのみエラーハンドラを呼び出す
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

const PartList = ({
    selectedParts,
    onSelect,
    parts,
    onHover,
    hoveredPart,
    selectedMs,
    currentSlotUsage,
    onPreviewSelect,
    isPartDisabled, // useAppDataから渡されるisPartDisabled関数
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

    // カテゴリ特攻プログラム_汎用/支援の装備可否（_LV以降を除いた名称で判定）
    const isCategorySpecificPartDisabled = (part) => {
        const basePartName = part.name ? part.name.replace(/_LV\d+$/, '') : '';
        if (basePartName === "カテゴリ特攻プログラム_汎用" && selectedMs && selectedMs["属性"] !== "汎用") return true;
        if (basePartName === "カテゴリ特攻プログラム_支援" && selectedMs && selectedMs["属性"] !== "支援") return true;
        if (basePartName === "カテゴリ特攻プログラム_強襲" && selectedMs && selectedMs["属性"] !== "強襲") return true;
        return false;
    };

    // 装備可能（未装備）判定
    const isEquipable = (part) => {
        if (isSelected(part)) return false; // 既に選択されている場合は装備可能ではない
        // isPartDisabled は useAppData で定義されている総合的な併用不可判定
        // isPartDisabled が関数として渡されていることを確認
        if (typeof isPartDisabled === 'function' && isPartDisabled(part, selectedParts)) return false; // 併用不可の場合
        if (willCauseSlotOverflow(part)) return false; // スロットオーバーの場合
        if (isPartLimitReached) return false; // パーツ数上限の場合
        if (hasSameKind(part)) return false; // kind重複の場合
        if (isCategorySpecificPartDisabled(part)) return false; // カテゴリ特攻の制限
        return true;
    };

    // 装備不能判定 (selectedPartsに含まれておらず、isEquipableでないもの)
    const isNotEquipable = (part) => !isSelected(part) && !isEquipable(part);

    // 使用スロット合計
    const getSlotSum = (part) =>
        Number(part.close || 0) + Number(part.mid || 0) + Number(part.long || 0);

    // 属性取得
    const getCategory = (part) => part.category || '';

    // ソートのためのグループ分け
    const equipableParts = parts
        .filter(part => isEquipable(part))
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

    // 「併用不可」と「装備不可」を明確に区別し、優先度を付けてソート
    const getNotEquipablePriority = (part) => {
        if (isSelected(part)) return 3; // 選択済みは最後
        // isPartDisabled が関数として渡されていることを確認
        if (typeof isPartDisabled === 'function' && isPartDisabled(part)) return 0; // useAppDataのisPartDisabledで不可とされたものが最優先（併用不可扱い）
        if (willCauseSlotOverflow(part)) return 1; // スロットオーバー
        if (isPartLimitReached) return 1; // 装備数上限
        if (hasSameKind(part)) return 0; // kind重複も併用不可扱い (isPartDisabledでカバーされる場合もあるが、明示的に)
        if (isCategorySpecificPartDisabled(part)) return 1; // カテゴリ特攻の制限
        return 2; // その他の装備不可
    };

    const notEquipableParts = parts
        .filter(part => !isSelected(part) && !isEquipable(part)) // 装備可能でなく、かつ選択されていないパーツ
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
        <div className="flex-grow w-full partlist-card-shape">
            {/* パーツリスト */}
            <div className="overflow-y-auto pr-2" style={{ maxHeight: '195px' }}>
                {sortedParts.length === 0 ? (
                    <p className="text-gray-200 text-center py-4">パーツデータがありません。</p>
                ) : (
                    <div className="w-full grid" style={{ gridTemplateColumns: 'repeat(auto-fit, 64px)' }}>
                        {sortedParts.map((part) => {
                            const selected = isSelected(part);
                            const partHovered = hoveredPart && hoveredPart.name === part.name;
                            // isPartDisabledで併用不可を判定（selectedPartsを渡す）
                            const disabledByCombination = typeof isPartDisabled === 'function' && isPartDisabled(part, selectedParts) && !selected;
                            const disabledByKind = hasSameKind(part) && !selected;
                            const disabledByOtherReasons = !selected && !isEquipable(part) && !disabledByCombination && !disabledByKind;

                            const levelMatch = part.name.match(/_LV(\d+)/);
                            const partLevel = levelMatch ? parseInt(levelMatch[1], 10) : undefined;

                            // 「併用不可」または「装備不可」の場合にボタンを無効化
                            const showMutualExclusiveOverlay = disabledByCombination || disabledByKind;
                            const showNotEquipableOverlay = disabledByOtherReasons;
                            const reallyDisabled = selected ? false : (showMutualExclusiveOverlay || showNotEquipableOverlay);

                            return (
                                <button
                                    key={part.name}
                                    className={`relative transition-all duration-200 p-0 m-0 overflow-hidden
                                        w-16 h-16 aspect-square
                                        bg-gray-800
                                        ${reallyDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                    onClick={() => {
                                        if (!reallyDisabled || selected) {
                                            onSelect(part);
                                        }
                                        // ホバー・装備不可でもプレビューは有効
                                        onPreviewSelect?.(part);
                                    }}
                                    onMouseEnter={() => {
                                        // ホバー・装備不可でもプレビューは有効
                                        if (selected) {
                                            onHover?.(part, 'selectedParts');
                                        } else {
                                            onHover?.(part, 'partList');
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        onHover?.(null, null);
                                    }}
                                >
                                    <ImageWithFallback partName={part.name} level={partLevel} className="pointer-events-none" />

                                    {/* 併用不可の表示（disabledByCombination優先） */}
                                    {disabledByCombination && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-70 text-red-400 text-base z-20 pointer-events-none">
                                            <span className="[text-shadow:1px_1px_2px_black] flex flex-col items-center justify-center leading-tight space-y-1">
                                                <span>併 用</span>
                                                <span>不 可</span>
                                            </span>
                                        </div>
                                    )}

                                    {/* 装備不可の表示（disabledByCombinationでない場合のみ） */}
                                    {!disabledByCombination && showNotEquipableOverlay && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-70 text-neon-orange text-base z-20 pointer-events-none">
                                            <span className="[text-shadow:1px_1px_2px_black] flex flex-col items-center justify-center leading-tight space-y-1">
                                                <span>装 備</span>
                                                <span>不 可</span>
                                            </span>
                                        </div>
                                    )}

                                    {/* ホバー時のオレンジ半透明レイヤー */}
                                    {partHovered && !selected && !showNotEquipableOverlay && !showMutualExclusiveOverlay && (
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