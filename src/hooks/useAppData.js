import { useState, useEffect, useCallback, useMemo } from 'react';
import { calculateMSStatsLogic } from '../utils/calculateStats';
import { calculateSlotUsage } from '../utils/calculateSlots_temp';
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
    const [filterCategory, setFilterCategory] = useState(ALL_CATEGORY_NAME);
    const [isFullStrengthened, setIsFullStrengthened] = useState(false);
    const [expansionType, setExpansionType] = useState('無し');

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
        console.log('DEBUG: slotUsage useMemo is calculating. selectedMs content:', selectedMs);
    console.log('DEBUG: slotUsage useMemo - MS近スロット:', selectedMs?.["近スロット"]);
    console.log('DEBUG: slotUsage useMemo - MS中スロット:', selectedMs?.["中スロット"]);
    console.log('DEBUG: slotUsage useMemo - MS遠スロット:', selectedMs?.["遠スロット"]);

        return calculateSlotUsage(selectedMs, selectedParts, isFullStrengthened, fullStrengtheningEffects);
    }, [selectedMs, selectedParts, isFullStrengthened, fullStrengtheningEffects]);

    // ホバーされた「装着済みパーツ」が占めるスロット量を計算
    // この値はSlotSelectorに渡され、スロットゲージ上の黄色点滅部分を表示するために使われる
     const hoveredOccupiedSlots = useMemo(() => {
        // ホバー中のパーツがなく、または hoverSource が設定されていない場合は空のオブジェクトを返す
        if (!hoveredPart || !hoverSource) {
            return { close: 0, mid: 0, long: 0 };
        }

        // ホバー元が 'selectedParts' であるか、
        // またはホバー元が 'partList' であり、かつホバー中のパーツが実際に selectedParts に含まれる場合
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
    }, [hoveredPart, hoverSource, selectedParts]); // 依存配列に selectedParts を追加


    // スロットゲージのプレビュー表示用に使用する現在のスロット使用量
    // (未装着パーツをホバーした場合に、そのパーツのスロット量を追加した仮の値)
    const calculateUsageWithPreview = useCallback(() => {
        if (!selectedMs) {
            return { close: 0, mid: 0, long: 0, maxClose: 0, maxMid: 0, maxLong: 0 };
        }
        const current = slotUsage; // 現在の確定スロット使用量と最大スロット量

        const newUsed = {
            close: current.close,
            mid: current.mid,
            long: current.long,
        };

        // hoveredPartが存在し、かつそれが選択済みパーツリストに含まれていない（未装着）パーツであり、
        // かつホバー元が'partList'である場合にプレビューを適用
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
            // 最大スロット数は current (slotUsage) から引き継ぐ
            maxClose: current.maxClose,
            maxMid: current.maxMid,
            maxLong: current.maxLong,
        };
    }, [selectedMs, hoveredPart, selectedParts, slotUsage, hoverSource]);

    // calculateUsageWithPreview の結果を useMemo でメモ化する
    const usageWithPreview = useMemo(() => {
        return calculateUsageWithPreview();
    }, [calculateUsageWithPreview]);


    // --- イベントハンドラ ---
    const handleMsSelect = useCallback((ms) => {
         console.log('DEBUG: handleMsSelect called with MS object:', ms);
    console.log('DEBUG: MS近スロット (handleMsSelect):', ms?.["近スロット"]);
    console.log('DEBUG: MS中スロット (handleMsSelect):', ms?.["中スロット"]);
    console.log('DEBUG: MS遠スロット (handleMsSelect):', ms?.["遠スロット"]);

        setSelectedMs(ms);
        setSelectedParts([]);
        setHoveredPart(null);
        setHoverSource(null);
        setIsFullStrengthened(false);
        setExpansionType('無し');
        setFilterCategory(ALL_CATEGORY_NAME);
    }, []);

    const handlePartRemove = useCallback((partToRemove) => {
        setSelectedParts(prevParts => prevParts.filter(part => part.name !== partToRemove.name));
        setHoveredPart(null); // ホバー状態をクリア
        setHoverSource(null); // ホバー元をクリア
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

        // 駆動系強化機構/コンポジットモーター と他のスピード/旋回パーツの同時装備制限
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
            // 同じ名前のパーツがすでに存在する場合は削除してから追加 (更新の意図)
            const filteredPrevParts = prevParts.filter(p => p.name !== part.name);
            return [...filteredPrevParts, part];
        });

    }, [selectedMs, selectedParts, handlePartRemove, isFullStrengthened, fullStrengtheningEffects]);

    const handleClearAllParts = useCallback(() => {
        setSelectedParts([]);
        setHoveredPart(null);
        setHoverSource(null);
    }, []);

    const setFullStrengthenedWrapper = useCallback((newValue) => {
        // フル強化を解除する際にパーツが装着されている場合、全パーツ解除を促す
        if (!newValue && selectedParts.length > 0) {
            if (window.confirm("フル強化を解除すると、装着中のカスタムパーツは全て外されます。続行しますか？")) {
                handleClearAllParts();
            } else {
                // ユーザーがキャンセルした場合、状態を元に戻す
                setIsFullStrengthened(true); // 元の状態に戻す
                return; // 処理を中断
            }
        }
        setIsFullStrengthened(newValue);
    }, [selectedParts, handleClearAllParts]);


    const handlePartHover = useCallback((part, source) => {
        setHoveredPart(part);
        setHoverSource(source);
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
    };
};