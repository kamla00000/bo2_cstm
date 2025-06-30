import { useState, useEffect, useCallback, useMemo } from 'react';
import { calculateMSStatsLogic } from '../utils/calculateStats';
import { calculateSlotUsage } from '../utils/calculateSlots';
import { useDataLoading } from './useDataLoading';
import {
    CATEGORIES,
    ALL_CATEGORY_NAME,
    EXPANSION_OPTIONS,
    EXPANSION_DESCRIPTIONS
} from '../constants/appConstants';

export const useAppData = () => {
    const { msData, fullStrengtheningEffects, allPartsCache, isDataLoaded } = useDataLoading();

    const [partData, setPartData] = useState([]);
    const [selectedMs, setSelectedMs] = useState(null);
    const [selectedParts, setSelectedParts] = useState([]);
    const [hoveredPart, setHoveredPart] = useState(null);
    const [hoverSource, setHoverSource] = useState(null); // 'partList' または 'selectedParts'
    const [filterCategory, setFilterCategory] = useState('防御');
    const [isFullStrengthened, setIsFullStrengthened] = useState(false);
    const [expansionType, setExpansionType] = useState('無し');
    // プレビュー固定用
    const [selectedPreviewPart, setSelectedPreviewPart] = useState(null);

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
        setSelectedMs(ms);
        setSelectedParts([]);
        setHoveredPart(null);
        setHoverSource(null);
        setIsFullStrengthened(false);
        setExpansionType('無し');
        setFilterCategory('防御');
        setSelectedPreviewPart(null);
    }, []);

    const handlePartRemove = useCallback((partToRemove) => {
        setSelectedParts(prevParts => prevParts.filter(part => part.name !== partToRemove.name));
        setHoveredPart(null);
        setHoverSource(null);
        setSelectedPreviewPart(null);
    }, []);

    const handlePartSelect = useCallback((part) => {
        if (!selectedMs) {
            alert("先にモビルスーツを選択してください。");
            return;
        }

        if (selectedParts.some(p => p.name === part.name)) {
            handlePartRemove(part);
            return;
        }

        if (selectedParts.length >= 8) {
            alert("カスタムパーツは最大8つまでしか装着できません。");
            return;
        }

        if (part.name.startsWith("高性能走行制御機構") && selectedParts.some(p => p.name.startsWith("高性能走行制御機構"))) {
            alert("「高性能走行制御機構」系パーツは複数装備できません。");
            return;
        }

        const partsWithNew = [...selectedParts, part];
        const projectedSlots = calculateSlotUsage(selectedMs, partsWithNew, isFullStrengthened, fullStrengtheningEffects);

        if (projectedSlots.close > projectedSlots.maxClose ||
            projectedSlots.mid > projectedSlots.maxMid ||
            projectedSlots.long > projectedSlots.maxLong) {
            alert("スロット容量が不足しています。");
            return;
        }

        const isSpeedOrTurnPart = (p) => (p.speed > 0 || p.turnPerformanceGround > 0 || p.turnPerformanceSpace > 0);
        const isDriveOrComposite = (p) => p.name === "駆動系強化機構" || p.name === "コンポジットモーター";

        if (isDriveOrComposite(part) && selectedParts.some(p => isSpeedOrTurnPart(p) && !isDriveOrComposite(p))) {
            alert("「駆動系強化機構」または「コンポジットモーター」は、スピードまたは旋回性能が上昇する他のパーツと同時装備できません。");
            return;
        }
        if (isSpeedOrTurnPart(part) && selectedParts.some(p => isDriveOrComposite(p))) {
            alert("スピードまたは旋回性能が上昇するパーツは、「駆動系強化機構」または「コンポジットモーター」と同時装備できません。");
            return;
        }

        setSelectedParts(prevParts => {
            const filteredPrevParts = prevParts.filter(p => p.name !== part.name);
            return [...filteredPrevParts, part];
        });

    }, [selectedMs, selectedParts, handlePartRemove, isFullStrengthened, fullStrengtheningEffects]);

    const handleClearAllParts = useCallback(() => {
        setSelectedParts([]);
        setHoveredPart(null);
        setHoverSource(null);
        setSelectedPreviewPart(null);
    }, []);

    const setFullStrengthenedWrapper = useCallback((newValue) => {
        if (!newValue && selectedParts.length > 0) {
            if (window.confirm("フル強化を解除すると、装着中のカスタムパーツは全て外されます。続行しますか？")) {
                handleClearAllParts();
            } else {
                setIsFullStrengthened(true);
                return;
            }
        }
        setIsFullStrengthened(newValue);
    }, [selectedParts, handleClearAllParts]);

    const handlePartHover = useCallback((part, source) => {
    setHoveredPart(part);
    setHoverSource(source);
    if (!part) {
        setSelectedPreviewPart(null); // ホバーを外したらプレビューも消す
    }
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
    };
};