import { usePartFlick } from '../hooks/usePartFlick';
import { useRemoveFlick } from '../hooks/useRemoveFlick';
import { useGlobalPartFlick } from '../hooks/useGlobalPartFlick';
import { useGlobalRemoveFlick } from '../hooks/useGlobalRemoveFlick';
import React from 'react';
import { ALL_CATEGORY_NAME } from '../constants/appConstants';
import styles from './PickedMs.module.css';
import { shouldShowFlickGuide, shouldInstantAction, getDeviceType } from '../utils/deviceDetection';

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
            setCurrentExtIndex(IMAGE_EXTENSIONS.length);
        }
    };

    const handleLoad = () => {
        setHasLoaded(true);
    };

    React.useEffect(() => {
        setCurrentExtIndex(0);
        setHasLoaded(false);
    }, [partName]);

    let src;
    if (currentExtIndex < IMAGE_EXTENSIONS.length) {
        src = `${getBaseImagePath(partName)}.webp`;
    } else {
        src = '/images/parts/default.webp';
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
    const [previewPart, setPreviewPart] = React.useState(null);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            window.globalPreviewPart = previewPart;
            window.dispatchEvent(new CustomEvent('previewPartChanged'));
        }
    }, [previewPart]);

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

    useRemoveFlick(
        (partName) => {
            const part = parts.find(p => p.name === partName);
            if (part && isSelected(part)) {
                handleSelect(part);
            }
        },
        selectedParts.map(p => p.name)
    );

    useGlobalPartFlick(
        (partName) => {
            const part = parts.find(p => p.name === partName);
            if (part && isEquipable(part)) {
                handleSelect(part);
            }
        },
        parts ? parts.map(p => p.name) : []
    );

    useGlobalRemoveFlick(
        (partName) => {
            const part = parts.find(p => p.name === partName);
            if (part && isSelected(part)) {
                handleSelect(part);
            }
        },
        selectedParts ? selectedParts.map(p => p.name) : []
    );

    const isSelected = (part) => selectedParts.some(p => p.name === part.name);

    // 「装備完了」直後のパーツを記録
    const [fixedPartInfo, setFixedPartInfo] = React.useState(null);
    const [lastSelectedPartsLength, setLastSelectedPartsLength] = React.useState(0);
    // 現在のソート済み配列をrefで保持（固定位置計算用）
    const currentSortedPartsRef = React.useRef([]);

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

    const hasSameKind = (part) => {
        if (!part.kind) return false;
        return selectedParts.some(p => p.kind && p.kind === part.kind && p.name !== part.name);
    };

    const isPartLimitReached = selectedParts.length >= 8;

    const isCategorySpecificPartDisabled = (part) => {
        const basePartName = part.name ? part.name.replace(/_LV\d+$/, '') : '';
        if (basePartName === "カテゴリ特攻プログラム_汎用" && selectedMs && selectedMs["属性"] !== "汎用") return true;
        if (basePartName === "カテゴリ特攻プログラム_支援" && selectedMs && selectedMs["属性"] !== "支援") return true;
        if (basePartName === "カテゴリ特攻プログラム_強襲" && selectedMs && selectedMs["属性"] !== "強襲") return true;
        return false;
    };

    const isEquipable = (part) => {
        if (isSelected(part)) return false;
        if (typeof isPartDisabled === 'function' && isPartDisabled(part, selectedParts)) return false;
        if (willCauseSlotOverflow(part)) return false;
        if (isPartLimitReached) return false;
        if (hasSameKind(part)) return false;
        if (isCategorySpecificPartDisabled(part)) return false;
        return true;
    };

    const getSlotSum = (part) =>
        Number(part.close || 0) + Number(part.mid || 0) + Number(part.long || 0);

    const getCategory = (part) => part.category || '';

    const getNotEquipablePriority = (part) => {
        if (isSelected(part)) return -1;
        if (typeof isPartDisabled === 'function' && isPartDisabled(part, selectedParts)) return 0;
        if (hasSameKind(part)) return 0;
        if (willCauseSlotOverflow(part) || isCategorySpecificPartDisabled(part) || isPartLimitReached) return 1;
        return 2;
    };

    // 装備/解除時の処理
    const handleSelect = (part) => {
        const currentlySelected = isSelected(part);
        if (!currentlySelected) {
            // 現在のソート済み配列での位置を取得（装備前の表示順）
            const currentIndex = currentSortedPartsRef.current.findIndex(p => p.name === part.name);
            
            // 新しいパーツ装備時は前の固定を解除してから新しい固定を設定
            const newFixedInfo = {
                name: part.name,
                index: currentIndex,
            };
            setFixedPartInfo(newFixedInfo);
        } else {
            setFixedPartInfo(null);
        }
        onSelect(part);
        if (window.innerWidth <= 1279) {
            if (typeof window.setSelectedPreviewPart === 'function') {
                window.setSelectedPreviewPart(null);
            }
        }
    };

    // selectedPartsの変化を監視
    React.useEffect(() => {
        const currentLength = selectedParts.length;

        // 全パーツが外された場合
        if (currentLength === 0) {
            if (fixedPartInfo !== null) {
                setFixedPartInfo(null);
            }
        } 
        // パーツが新たに装備された場合（長さが増加）
        else if (currentLength > lastSelectedPartsLength) {
            // 新しくパーツが装備された時点で、前回の固定は既にhandleSelectで解除済み
        }
        // パーツが外された場合（長さが減少）
        else if (currentLength < lastSelectedPartsLength) {
            // 固定中のパーツが外された場合は固定を解除
            if (fixedPartInfo && !selectedParts.some(p => p.name === fixedPartInfo.name)) {
                setFixedPartInfo(null);
            }
        }

        setLastSelectedPartsLength(currentLength);
    }, [selectedParts]); // fixedPartInfoは依存配列から除外

    // ソートロジック - 固定パーツがある場合は固定パーツを除外してソートし、後で挿入
    const sortedParts = React.useMemo(() => {
        const partsList = parts || [];
        if (!Array.isArray(partsList) || partsList.length === 0) {
            return [];
        }
        
        // 「装備完了」直後のパーツを完全にソート対象外にする
        let fixedPart = null;
        let fixedIndex = -1;
        let partsToSort = partsList;
        
        if (fixedPartInfo && fixedPartInfo.name) {
            fixedPart = partsList.find(p => p.name === fixedPartInfo.name);
            fixedIndex = fixedPartInfo.index;
            // 固定パーツをソート対象から完全に除外
            partsToSort = partsList.filter(p => p.name !== fixedPartInfo.name);
        }
        
        // 固定パーツ以外のみをソート
        const sorted = partsToSort.sort((a, b) => {
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
        
        // 固定パーツを元の位置に挿入
        if (fixedPart && fixedIndex !== -1) {
            // 元の位置が配列範囲内に収まるように調整
            const insertIndex = Math.min(fixedIndex, sorted.length);
            sorted.splice(insertIndex, 0, fixedPart);
        }
        
        // 現在のソート結果をrefに保存（次回のhandleSelectで使用）
        currentSortedPartsRef.current = [...sorted];
        
        return sorted;
    }, [
        parts, 
        // selectedPartsは除外して、装備状態が変わってもソートが再実行されないようにする
        // 代わりにselectedParts.lengthのみ監視してソートタイミングを制御
        selectedParts.length > 0 ? selectedParts.map(p => p.name).sort().join(',') : '', 
        fixedPartInfo, 
        isSelected, 
        isEquipable, 
        getSlotSum, 
        getCategory, 
        getNotEquipablePriority
    ]);

    return (
        <div className="flex-grow w-full partlist-card-shape">
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

                            // fixedPartInfoが一致する場合は「装備完了」直後
                            const showOneShotEffect = fixedPartInfo && fixedPartInfo.name === part.name;

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
                                        const isInstantAction = shouldInstantAction();
                                        const deviceType = getDeviceType();
                                        
                                        if (isInstantAction) {
                                            if (!reallyDisabled || selected) {
                                                handleSelect(part);
                                            }
                                            onPreviewSelect?.(part);
                                        } else if (deviceType === 'touch' || window.innerWidth <= 1024) {
                                            setPreviewPart(part.name);
                                            onPreviewSelect?.(part);
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
                                        // モバイル（768px未満）ではonMouseLeaveでhoverをクリアしない
                                        if (window.innerWidth >= 768) {
                                            onHover?.(null, null);
                                        }
                                    }}
                                >
                                    <ImageWithFallback partName={part.name} level={partLevel} className="pointer-events-none" />

                                    {disabledByCombination && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-70 text-red-400 text-base z-20 pointer-events-none">
                                            <span className="[text-shadow:1px_1px_2px_black] flex flex-col items-center justify-center leading-tight space-y-1">
                                                <span>併 用</span>
                                                <span>不 可</span>
                                            </span>
                                        </div>
                                    )}

                                    {!disabledByCombination && showNotEquipableOverlay && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-70 text-neon-orange text-base z-20 pointer-events-none">
                                            <span className="[text-shadow:1px_1px_2px_black] flex flex-col items-center justify-center leading-tight space-y-1">
                                                <span>装 備</span>
                                                <span>不 可</span>
                                            </span>
                                        </div>
                                    )}

                                    {((partHovered && window.innerWidth > 1024) || (previewPart === part.name && window.innerWidth <= 1024)) && !selected && !showNotEquipableOverlay && !showMutualExclusiveOverlay && !showOneShotEffect && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-orange-500 bg-opacity-60 text-gray-200 text-base z-20 pointer-events-none">
                                            <span className="[text-shadow:1px_1px_2px_black] flex flex-col items-center justify-center leading-tight space-y-1">
                                                <span>装 備</span>
                                                <span>可 能</span>
                                            </span>
                                        </div>
                                    )}

                                    {selected && (
                                        <div 
                                            className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-70 text-neon-offwhite text-base z-20"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const isInstantAction = shouldInstantAction();
                                                const showGuide = shouldShowFlickGuide();
                                                const deviceType = getDeviceType();
                                                
                                                if (isInstantAction) {
                                                    handleSelect(part);
                                                } else if (showGuide && (deviceType === 'touch' || window.innerWidth <= 1024)) {
                                                    const element = e.currentTarget;
                                                    element.classList.add('show-swipe-hint');
                                                    setTimeout(() => {
                                                        element.classList.remove('show-swipe-hint');
                                                    }, 1500);
                                                }
                                            }}
                                            style={{ 
                                                cursor: shouldInstantAction() ? 'pointer' : 
                                                       (shouldShowFlickGuide() && window.innerWidth <= 1024) ? 'pointer' : 'default' 
                                            }}
                                        >
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