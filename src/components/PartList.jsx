import { usePartFlick } from '../hooks/usePartFlick';
import { useRemoveFlick } from '../hooks/useRemoveFlick';
import { useGlobalPartFlick } from '../hooks/useGlobalPartFlick';
import { useGlobalRemoveFlick } from '../hooks/useGlobalRemoveFlick';
import React from 'react';
import { ALL_CATEGORY_NAME } from '../constants/appConstants';
import styles from './PickedMs.module.css';

// 画像パスを生成する関数をコンポーネントの外に定義
const getBaseImagePath = (partName) => `/images/parts/${encodeURIComponent(partName)}`;
const IMAGE_EXTENSIONS = ['webp']; // webpのみ対応

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
        src = `${getBaseImagePath(partName)}.webp`;
    } else {
        src = '/images/parts/default.webp'; // デフォルト画像
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

const PartList = ({
    selectedParts,
    onSelect,
    parts,
    onHover,
    hoveredPart,
    selectedMs,
    currentSlotUsage,
    onPreviewSelect,
    isPartDisabled,
}) => {
    // プレビュー中パーツ名をstateで管理
    const [previewPart, setPreviewPart] = React.useState(null);

    // プレビュー状態をグローバルに共有（装備解除レイヤーとの排他制御用）
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            window.globalPreviewPart = previewPart;
            // イベント発火で他コンポーネントに通知
            window.dispatchEvent(new CustomEvent('previewPartChanged'));
        }
    }, [previewPart]);

    // 装備解除レイヤー変更を監視してプレビューをクリア
    React.useEffect(() => {
        const handleRemoveLayerChange = () => {
            if (typeof window !== 'undefined' && window.globalRemoveLayerPart) {
                setPreviewPart(null);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('removeLayerChanged', handleRemoveLayerChange);
            return () => window.removeEventListener('removeLayerChanged', handleRemoveLayerChange);
        }
    }, []);

    // 右フリックで装着（プレビュー中パーツ）
    usePartFlick(
        null,
        (partName) => {
            const part = parts.find(p => p.name === partName);
            if (part && !isSelected(part)) {
                handleSelect(part);
            }
        },
        previewPart
    );

    // 右フリックで装備解除（選択中パーツ）
    useRemoveFlick(
        (partName) => {
            const part = parts.find(p => p.name === partName);
            if (part && isSelected(part)) {
                handleSelect(part); // 装備済みパーツをもう一度選択すると解除される
            }
        },
        selectedParts.map(p => p.name) // 選択中の全パーツ名の配列を渡す
    );

    // 全パーツボタンで「タップせずにフリック」装着を許可
    useGlobalPartFlick(
        (partName) => {
            const part = parts.find(p => p.name === partName);
            if (part && isEquipable(part)) {
                handleSelect(part);
            }
        },
        parts ? parts.map(p => p.name) : []
    );

    // 全装備済みパーツで「タップせずにフリック」解除を許可
    useGlobalRemoveFlick(
        (partName) => {
            const part = parts.find(p => p.name === partName);
            if (part && isSelected(part)) {
                handleSelect(part); // 装備済みパーツをもう一度選択すると解除される
            }
        },
        selectedParts ? selectedParts.map(p => p.name) : []
    );
    // 装備中判定
    const isSelected = (part) => selectedParts.some(p => p.name === part.name);

    // ワンクッション用state
    const [lastActionedPartName, setLastActionedPartName] = React.useState(null);
    const [actionType, setActionType] = React.useState(null); // 'equip' or 'unequip'
    const [lastActionedPartIndex, setLastActionedPartIndex] = React.useState(null); // 装備直前の表示インデックス

    // ★ 追加: selectedPartsが空になったらワンクッション状態をリセット
    React.useEffect(() => {
        if (selectedParts.length === 0 && lastActionedPartName !== null) {
            setLastActionedPartName(null);
            setActionType(null);
            setLastActionedPartIndex(null);
        }
    }, [selectedParts, lastActionedPartName]);

    // 装備時の処理をラップ（ワンクッション動作対応）
    const handleSelect = (part) => {
        const currentlySelected = isSelected(part);
        // 装備直前の表示インデックスを記録
        if (!currentlySelected) {
            // parts配列の現在の並びでインデックスを取得
            const currentIndex = sortedParts.findIndex(p => p.name === part.name);
            setLastActionedPartIndex(currentIndex);
            setLastActionedPartName(part.name);
            setActionType('equip');
        } else {
            setLastActionedPartName(null);
            setActionType(null);
            setLastActionedPartIndex(null);
        }
        onSelect(part);
        if (window.innerWidth <= 1279) {
            if (typeof window.setSelectedPreviewPart === 'function') {
                window.setSelectedPreviewPart(null);
            }
        }
    };

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
        if (isSelected(part)) return false; // 装備済みの場合は装備可能ではない
        if (typeof isPartDisabled === 'function' && isPartDisabled(part, selectedParts)) return false;
        if (willCauseSlotOverflow(part)) return false;
        if (isPartLimitReached) return false;
        if (hasSameKind(part)) return false;
        if (isCategorySpecificPartDisabled(part)) return false;
        return true;
    };

    // 使用スロット合計
    const getSlotSum = (part) =>
        Number(part.close || 0) + Number(part.mid || 0) + Number(part.long || 0);

    // 属性取得
    const getCategory = (part) => part.category || '';

    // 「併用不可」と「装備不可」の優先度付け
    const getNotEquipablePriority = (part) => {
        // isSelected(part)の場合はこの関数が呼ばれない前提だが、念のため
        if (isSelected(part)) return -1; // 装備中は優先度を無視（このソートでは装備済みは別のグループになるため）

        // 併用不可が最も高い優先度（最も下に表示される）
        if (typeof isPartDisabled === 'function' && isPartDisabled(part, selectedParts)) return 0;
        if (hasSameKind(part)) return 0; // kind重複も併用不可と同等に扱う

        // スロットオーバー、カテゴリ特攻プログラムは次に高い優先度
        if (willCauseSlotOverflow(part) || isCategorySpecificPartDisabled(part) || isPartLimitReached) return 1;

        // それ以外（装備可能ではないが上記理由でないもの）は低い優先度
        return 2;
    };


    // 最終的なソートロジック (useMemoでメモ化)
    const sortedParts = React.useMemo(() => {
        if (!Array.isArray(parts) || parts.length === 0) {
            return [];
        }
        // ワンクッションパーツのインデックスをlastActionedPartIndexで固定
        const fixedIndex = (lastActionedPartName && actionType === 'equip' && lastActionedPartIndex !== null) ? lastActionedPartIndex : -1;
        const fixedPart = (fixedIndex !== -1) ? parts.find(p => p.name === lastActionedPartName) : null;
        // ワンクッションパーツ以外をソート
        const filtered = parts.filter(p => !(fixedPart && p.name === fixedPart.name));
        const sorted = filtered.sort((a, b) => {
            const aSelected = isSelected(a);
            const bSelected = isSelected(b);
            const aEquipable = isEquipable(a);
            const bEquipable = isEquipable(b);
            let aGroup, bGroup;
            if (aEquipable) {
                aGroup = 1;
            } else if (aSelected) {
                aGroup = 2;
            } else {
                aGroup = 3;
            }
            if (bEquipable) {
                bGroup = 1;
            } else if (bSelected) {
                bGroup = 2;
            } else {
                bGroup = 3;
            }
            if (aGroup !== bGroup) {
                return aGroup - bGroup;
            }
            if (aGroup === 1 || aGroup === 2) {
                const slotDiff = getSlotSum(b) - getSlotSum(a);
                if (slotDiff !== 0) return slotDiff;
                const categoryDiff = getCategoryOrder(getCategory(a)) - getCategoryOrder(getCategory(b));
                if (categoryDiff !== 0) return categoryDiff;
                return a.name.localeCompare(b.name);
            }
            if (aGroup === 3) {
                const priorityDiff = getNotEquipablePriority(a) - getNotEquipablePriority(b);
                if (priorityDiff !== 0) return priorityDiff;
                const slotDiff = getSlotSum(b) - getSlotSum(a);
                if (slotDiff !== 0) return slotDiff;
                const categoryDiff = getCategoryOrder(getCategory(a)) - getCategoryOrder(getCategory(b));
                if (categoryDiff !== 0) return categoryDiff;
                return a.name.localeCompare(b.name);
            }
            return 0;
        });
        // ワンクッションパーツを装備直前の位置に挿入
        if (fixedPart && fixedIndex !== -1) {
            sorted.splice(fixedIndex, 0, fixedPart);
        }
        return sorted;
    }, [parts, selectedParts, lastActionedPartName, actionType, lastActionedPartIndex, isSelected, isEquipable, getSlotSum, getCategory, getNotEquipablePriority]);


    return (
        <div className="flex-grow w-full partlist-card-shape">
            {/* パーツリスト */}
            <div className="overflow-y-auto pr-2" style={{ maxHeight: '195px' }}>
                {sortedParts.length === 0 ? (
                    <p className="text-gray-200 text-center py-4">パーツデータがありません。</p>
                ) : (
                    <div className={styles.partListGrid}>
                        {sortedParts.map((part) => {
                            const selected = isSelected(part);
                            const partHovered = hoveredPart && hoveredPart.name === part.name;
                            const disabledByCombination = typeof isPartDisabled === 'function' && isPartDisabled(part, selectedParts) && !selected;
                            const disabledByKind = hasSameKind(part) && !selected;
                            const disabledByOtherReasons = !selected && !isEquipable(part) && !disabledByCombination && !disabledByKind;

                            const levelMatch = part.name.match(/_LV(\d+)/);
                            const partLevel = levelMatch ? parseInt(levelMatch[1], 10) : undefined;

                            // ワンクッション表示の条件: 最後に装備したパーツであり、かつ「装備」アクションだった場合
                            const showOneShotEffect = lastActionedPartName === part.name && actionType === 'equip';

                            const showMutualExclusiveOverlay = disabledByCombination || disabledByKind;
                            const showNotEquipableOverlay = disabledByOtherReasons;
                            const reallyDisabled = selected ? false : (showMutualExclusiveOverlay || showNotEquipableOverlay);

                            return (
                                <button
                                    key={part.name}
                                    data-part-name={part.name}
                                    data-selected-part-name={selected ? part.name : undefined}
                                    className={`${styles.partListButton} relative transition-all duration-200 p-0 m-0 overflow-hidden bg-gray-800
                                        ${reallyDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                                        ${showOneShotEffect ? 'animate-pulse border-2 border-orange-400' : ''}
                                        ${selected && !showOneShotEffect ? '' : ''}
                                    `}
                                    onClick={() => {
                                        if (window.innerWidth <= 1024) {
                                            setPreviewPart(part.name);
                                            onPreviewSelect?.(part);
                                            // タップでは装着しない
                                        } else {
                                            if (!reallyDisabled || selected) {
                                                handleSelect(part);
                                            }
                                            onPreviewSelect?.(part);
                                        }
                                    }}
                                    onMouseEnter={() => {
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

                                    {/* ホバー時のオレンジ半透明レイヤー (ワンクッション表示と重複しないように調整) */}
                                    {((partHovered && window.innerWidth > 1024) || (previewPart === part.name && window.innerWidth <= 1024)) && !selected && !showNotEquipableOverlay && !showMutualExclusiveOverlay && !showOneShotEffect && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-orange-500 bg-opacity-60 text-gray-200 text-base z-20 pointer-events-none">
                                            <span className="[text-shadow:1px_1px_2px_black] flex flex-col items-center justify-center leading-tight space-y-1">
                                                <span>装 備</span>
                                                <span>可 能</span>
                                            </span>
                                        </div>
                                    )}

                                    {/* 装備中の表示 (ワンクッション表示と重ねて表示) */}
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