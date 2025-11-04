import { useState, useEffect, useCallback, useMemo } from 'react';
import { startTransition } from 'react';
import { calculateMSStatsLogic } from '../utils/calculateStats';
import { calculateSlotUsage } from '../utils/calculateSlots';
import { useDataLoading } from './useDataLoading';
import {
    CATEGORIES,
    ALL_CATEGORY_NAME,
    EXPANSION_OPTIONS,
    EXPANSION_DESCRIPTIONS
} from '../constants/appConstants';
import { isPartDisabled as ngIsPartDisabled } from '../utils/ngparts';

export const useAppData = () => {
    const { msData, fullStrengtheningEffects, allPartsCache, isDataLoaded } = useDataLoading();

    // 復元検証用の状態
    const [restorationValidation, setRestorationValidation] = useState({
        expectedParts: [],
        actualParts: [],
        isValidating: false
    });

    const [partData, setPartData] = useState([]);
    const [selectedMs, setSelectedMs] = useState(null);
    const [selectedParts, setSelectedParts] = useState([]);
    const [hoveredPart, setHoveredPart] = useState(null);
    const [hoverSource, setHoverSource] = useState(null); 
    const [filterCategory, setFilterCategory] = useState('防御');
    const [isFullStrengthened, setIsFullStrengthened] = useState(0);
    const [expansionType, setExpansionType] = useState('無し');
    const [selectedPreviewPart, setSelectedPreviewPart] = useState(null);

    const isPartDisabled = useCallback(
        ngIsPartDisabled,
        []
    );

    const updateDisplayedParts = useCallback((category) => {
        let loadedParts = [];
        if (category === ALL_CATEGORY_NAME) {
            for (const cat of CATEGORIES) {
                if (allPartsCache[cat.name]) {
                    loadedParts.push(...allPartsCache[cat.name]);
                }
            }
        } else {
            const targetCategory = CATEGORIES.find(cat => cat.name === category);
            if (targetCategory && allPartsCache[targetCategory.name]) {
                loadedParts = allPartsCache[targetCategory.name];
            }
        }
        setPartData(loadedParts);
    }, [allPartsCache]);

    useEffect(() => {
        if (isDataLoaded) {
            updateDisplayedParts(filterCategory);
        }
    }, [isDataLoaded, filterCategory, updateDisplayedParts]);


    const currentStats = useMemo(() => {
        return calculateMSStatsLogic(
            selectedMs,
            selectedParts,
            isFullStrengthened,
            expansionType,
            allPartsCache,
            fullStrengtheningEffects
        );
    }, [selectedMs, selectedParts, isFullStrengthened, expansionType, allPartsCache, fullStrengtheningEffects]);

    // ホバー時の仮ステータス計算（パーツリストからのホバー時）
    const previewStats = useMemo(() => {
        console.log('[previewStats] 条件チェック:', {
            hoveredPart: hoveredPart?.name || 'なし',
            selectedMs: selectedMs?.["MS名"] || 'なし',
            hoverSource: hoverSource || 'なし',
            selectedPartsCount: selectedParts?.length || 0,
            condition1: !hoveredPart,
            condition2: !selectedMs,
            condition3: hoverSource !== 'partList',
            finalConditionResult: !hoveredPart || !selectedMs || hoverSource !== 'partList'
        });

        if (!hoveredPart || !selectedMs || hoverSource !== 'partList') {
            return null;
        }

        // 既に装備済みのパーツの場合はプレビューしない
        const isAlreadyEquipped = selectedParts.some(part => part.name === hoveredPart.name);
        if (isAlreadyEquipped) {
            console.log('[previewStats] 既に装備済みのため、プレビューをスキップ');
            return null;
        }

        console.log('[previewStats] パーツリストからのホバー検出:', {
            hoveredPart: hoveredPart?.name,
            hoverSource,
            selectedPartsCount: selectedParts?.length
        });

        // 現在のパーツにホバー中のパーツを追加
        const partsWithHovered = [...selectedParts, hoveredPart];
        
        console.log('[previewStats] パーツ追加後:', {
            original: selectedParts?.length,
            withHovered: partsWithHovered?.length,
            addedPart: hoveredPart?.name
        });

        const result = calculateMSStatsLogic(
            selectedMs,
            partsWithHovered,
            isFullStrengthened,
            expansionType,
            allPartsCache,
            fullStrengtheningEffects
        );

        console.log('[previewStats] 計算結果:', result);
        return result;
    }, [hoveredPart, hoverSource, selectedMs, selectedParts, isFullStrengthened, expansionType, allPartsCache, fullStrengtheningEffects]);

    const partBonuses = useMemo(() => {
        if (!selectedParts || selectedParts.length === 0) {
            return {};
        }
        const bonuses = {};
        selectedParts.forEach(part => {
            for (const key in part) {
                if (typeof part[key] === 'number' || (typeof part[key] === 'string' && !isNaN(parseFloat(part[key])))) {
                    const value = Number(part[key]);
                    if (isFinite(value)) {
                        bonuses[key] = (bonuses[key] || 0) + value;
                    }
                }
            }
        });
        return bonuses;
    }, [selectedParts]);

    const slotUsage = useMemo(() => {
        if (!selectedMs) {
            return { close: 0, mid: 0, long: 0, maxClose: 0, maxMid: 0, maxLong: 0 };
        }
        return calculateSlotUsage(selectedMs, selectedParts, isFullStrengthened, fullStrengtheningEffects);
    }, [selectedMs, selectedParts, isFullStrengthened, fullStrengtheningEffects]);

    const hoveredOccupiedSlots = useMemo(() => {
        if (!hoveredPart || !hoverSource) {
            return { close: 0, mid: 0, long: 0 };
        }

        const isHoveredPartAnOccupiedSlot =
            hoverSource === 'selectedParts' ||
            (hoverSource === 'partList' && selectedParts.some(p => p.name === hoveredPart.name));

        if (isHoveredPartAnOccupiedSlot) {
            return {
                close: Number(hoveredPart.close || 0),
                mid: Number(hoveredPart.mid || 0),
                long: Number(hoveredPart.long || 0)
            };
        }
        return { close: 0, mid: 0, long: 0 };
    }, [hoveredPart, hoverSource, selectedParts]);

    const calculateUsageWithPreview = useCallback(() => {
        if (!selectedMs) {
            return { close: 0, mid: 0, long: 0, maxClose: 0, maxMid: 0, maxLong: 0 };
        }
        const current = slotUsage;

        const newUsed = {
            close: current.close,
            mid: current.mid,
            long: current.long,
        };

        const isHoveringUnselectedPartFromPartList = hoveredPart &&
            hoverSource === 'partList' &&
            !selectedParts.some(p => p.name === hoveredPart.name);

        if (isHoveringUnselectedPartFromPartList) {
            newUsed.close += Number(hoveredPart.close || 0);
            newUsed.mid += Number(hoveredPart.mid || 0);
            newUsed.long += Number(hoveredPart.long || 0);
        }

        return {
            close: newUsed.close,
            mid: newUsed.mid,
            long: newUsed.long,
            maxClose: current.maxClose,
            maxMid: current.maxMid,
            maxLong: current.maxLong,
        };
    }, [selectedMs, hoveredPart, selectedParts, slotUsage, hoverSource]);

    const usageWithPreview = useMemo(() => {
        return calculateUsageWithPreview();
    }, [calculateUsageWithPreview]);

    const handleMsSelect = useCallback((ms) => {
        startTransition(() => {
            setSelectedMs(ms);
            setSelectedParts([]);
            setHoveredPart(null);
            setHoverSource(null);
            setIsFullStrengthened(6); // デフォルトを完に設定
            setExpansionType('無し');
            setFilterCategory('防御');
            setSelectedPreviewPart(null);
        });
    }, []);

    const handlePartRemove = useCallback((partToRemove) => {
        console.log('[handlePartRemove] パーツを削除:', partToRemove?.name);
        // パーツ削除前にホバー状態をクリア（重要：previewStatsをnullにするため）
        setHoveredPart(null);
        setHoverSource(null);
        setSelectedPreviewPart(null);
        
        startTransition(() => {
            setSelectedParts(prevParts => prevParts.filter(part => part.name !== partToRemove.name));
        });
    }, []);

    const handlePartSelect = useCallback((part) => {
        if (!selectedMs) return;
        if (selectedParts.some(p => p.name === part.name)) {
            handlePartRemove(part);
            return;
        }
        if (selectedParts.length >= 8) return;
        if (isPartDisabled(part, selectedParts)) return; // ここもisPartDisabled(part)から修正しました
        const partsWithNew = [...selectedParts, part];
        const projectedSlots = calculateSlotUsage(selectedMs, partsWithNew, isFullStrengthened, fullStrengtheningEffects);
        if (projectedSlots.close > projectedSlots.maxClose ||
            projectedSlots.mid > projectedSlots.maxMid ||
            projectedSlots.long > projectedSlots.maxLong) return;
        
        startTransition(() => {
            setSelectedParts(prevParts => {
                const filteredPrevParts = prevParts.filter(p => p.name !== part.name);
                return [...filteredPrevParts, part];
            });
        });
    }, [selectedMs, selectedParts, handlePartRemove, isFullStrengthened, fullStrengtheningEffects, isPartDisabled]);

    const handleClearAllParts = useCallback(() => {
        startTransition(() => {
            setSelectedParts([]);
            setHoveredPart(null);
            setHoverSource(null);
            setSelectedPreviewPart(null);
        });
    }, []);

    const setFullStrengthenedWrapper = useCallback((newValue) => {
        setIsFullStrengthened(Number(newValue));
    }, []);

    const handlePartHover = useCallback((part, source) => {
        setHoveredPart(part);
        setHoverSource(source);
        // プレビュー解除はパーツ一覧・装着中パーツ一覧のパーツをタップした時のみ
        // ここではsetSelectedPreviewPart(null)を呼ばない
    }, []);
    
    // プレビュー固定用
    const handlePartPreviewSelect = useCallback((part) => {
        setSelectedPreviewPart(part);
    }, []);

    return {
        msData,
        partData,
        selectedMs,
        selectedParts,
        hoveredPart,
        hoveredOccupiedSlots,
        filterCategory,
        setFilterCategory,
        isFullStrengthened,
        expansionType,
        categories: CATEGORIES,
        allCategoryName: ALL_CATEGORY_NAME,
        expansionOptions: EXPANSION_OPTIONS,
        expansionDescriptions: EXPANSION_DESCRIPTIONS,
        currentStats,
        previewStats,
        slotUsage,
        usageWithPreview,
        handlePartHover,
        setIsFullStrengthened: setFullStrengthenedWrapper,
        setExpansionType,
        handleMsSelect,
        handlePartRemove,
        handlePartSelect,
        handleClearAllParts,
        partBonuses,
        selectedPreviewPart,
        handlePartPreviewSelect,
        isPartDisabled, 
        allPartsCache,
        isDataLoaded,
        hoverSource,
        fullStrengtheningEffects,
    };
};