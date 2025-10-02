// パーツ復元ユーティリティ - パーツの検索と復元処理

const DEBUG_PARTS_LOADING = true; // デバッグフラグ

// パーツを順次復元する関数
export const restorePartsSequentially = async (
    partsToRestore, 
    source, 
    allPartsCache, 
    handlePartSelect,
    setLoadingStatus,
    restorationInProgressRef,
    setIsRestoring
) => {
    // より厳密な空チェック
    if (!partsToRestore || !Array.isArray(partsToRestore) || partsToRestore.length === 0) {
        console.log('[restorePartsSequentially] 復元対象なし - パーツ配列が空または無効');
        // 空の場合でも確実にクリーンアップ
        if (restorationInProgressRef && restorationInProgressRef.current) {
            restorationInProgressRef.current = false;
        }
        if (setIsRestoring) setIsRestoring(false);
        if (setLoadingStatus) setLoadingStatus('');
        return { successCount: 0, failedParts: [], processedParts: [] };
    }

    if (restorationInProgressRef.current) {
        console.log('[restorePartsSequentially] 復元処理が既に実行中のためスキップ');
        return;
    }

    console.log(`[restorePartsSequentially] ===== パーツ復元開始 (${source}) =====`);
    console.log('[restorePartsSequentially] 復元対象パーツ:', partsToRestore);
    console.log('[restorePartsSequentially] allPartsCache存在:', !!allPartsCache);

    restorationInProgressRef.current = true;
    setIsRestoring(true);
    setLoadingStatus(`パーツ復元中 (${source})...`);

    try {
        if (!allPartsCache || Object.keys(allPartsCache).length === 0) {
            console.error('[restorePartsSequentially] allPartsCacheが利用できません');
            return;
        }

        // allPartsCacheから全パーツを平坦化
        const allPartsFlat = [];
        Object.values(allPartsCache).forEach(categoryParts => {
            if (Array.isArray(categoryParts)) {
                allPartsFlat.push(...categoryParts);
            }
        });

        console.log('[restorePartsSequentially] 利用可能パーツ総数:', allPartsFlat.length);
        console.log('[restorePartsSequentially] 利用可能パーツ一覧（最初の10個）:', allPartsFlat.slice(0, 10).map(p => p.name));
        
        let successCount = 0;
        let failedParts = [];
        let processedParts = [];

        for (let index = 0; index < partsToRestore.length; index++) {
            const partName = partsToRestore[index];
            
            console.log(`[restorePartsSequentially] パーツ検索 ${index + 1}/${partsToRestore.length}: "${partName}"`);
            
            // より柔軟なパーツ検索
            let foundPart = null;
            
            // 1. 完全一致
            foundPart = allPartsFlat.find(p => p.name === partName);
            if (foundPart) {
                console.log(`[restorePartsSequentially] 完全一致で発見: "${foundPart.name}"`);
            }
            
            // 2. トリム後の完全一致
            if (!foundPart) {
                foundPart = allPartsFlat.find(p => p.name.trim() === partName.trim());
                if (foundPart) {
                    console.log(`[restorePartsSequentially] トリム一致で発見: "${foundPart.name}"`);
                }
            }
            
            // 3. 大文字小文字を無視した一致
            if (!foundPart) {
                foundPart = allPartsFlat.find(p => p.name.toLowerCase() === partName.toLowerCase());
                if (foundPart) {
                    console.log(`[restorePartsSequentially] 大文字小文字無視一致で発見: "${foundPart.name}"`);
                }
            }
            
            // 4. トリム+大文字小文字無視
            if (!foundPart) {
                foundPart = allPartsFlat.find(p => p.name.trim().toLowerCase() === partName.trim().toLowerCase());
                if (foundPart) {
                    console.log(`[restorePartsSequentially] トリム+大文字小文字無視一致で発見: "${foundPart.name}"`);
                }
            }
            
            // 5. 部分一致（前方一致）
            if (!foundPart) {
                foundPart = allPartsFlat.find(p => p.name.startsWith(partName) || partName.startsWith(p.name));
                if (foundPart) {
                    console.log(`[restorePartsSequentially] 前方一致で発見: "${foundPart.name}"`);
                }
            }
            
            // 6. 部分一致（包含）
            if (!foundPart) {
                foundPart = allPartsFlat.find(p => p.name.includes(partName) || partName.includes(p.name));
                if (foundPart) {
                    console.log(`[restorePartsSequentially] 包含一致で発見: "${foundPart.name}"`);
                }
            }

            if (foundPart) {
                try {
                    console.log(`[restorePartsSequentially] パーツ装備実行: "${foundPart.name}"`);
                    handlePartSelect(foundPart);
                    successCount++;
                    processedParts.push({ original: partName, found: foundPart.name, status: 'success' });
                    
                    // 装備処理の間隔を少し空ける
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    console.error(`[restorePartsSequentially] パーツ装備エラー: "${foundPart.name}"`, error);
                    failedParts.push({ original: partName, error: error.message });
                    processedParts.push({ original: partName, found: foundPart.name, status: 'error', error: error.message });
                }
            } else {
                console.warn(`[restorePartsSequentially] パーツ未発見: "${partName}"`);
                
                // 類似パーツを検索してログに出力
                const similarParts = allPartsFlat.filter(p => {
                    const similarity = partName.toLowerCase().split('').filter(char => 
                        p.name.toLowerCase().includes(char)
                    ).length / partName.length;
                    return similarity > 0.5;
                }).slice(0, 3);
                
                if (similarParts.length > 0) {
                    console.log(`[restorePartsSequentially] 類似パーツ候補:`, similarParts.map(p => p.name));
                }
                
                failedParts.push({ original: partName, error: 'not found' });
                processedParts.push({ original: partName, status: 'not_found' });
            }
        }
        
        // 復元完了処理
        console.log('[restorePartsSequentially] ===== パーツ復元完了 =====');
        console.log(`[restorePartsSequentially] 成功: ${successCount}/${partsToRestore.length}`);
        console.log('[restorePartsSequentially] 処理詳細:', processedParts);
        
        if (failedParts.length > 0) {
            console.warn('[restorePartsSequentially] 復元に失敗したパーツ:', failedParts);
            
            const failedNames = failedParts.map(f => f.original);
            if (failedParts.length < partsToRestore.length) {
                console.warn(`一部のパーツ (${failedParts.length}個) が見つかりませんでした:`, failedNames);
            } else {
                console.error('すべてのパーツが見つかりませんでした。データが古い可能性があります。');
            }
        }

        return { successCount, failedParts, processedParts };
        
    } catch (error) {
        console.error('[restorePartsSequentially] パーツ復元処理でエラー:', error);
        throw error;
    }
};

// パーツ復元処理のクリーンアップ関数
export const cleanupRestoration = (
    restorationInProgressRef,
    setIsRestoring,
    setPendingLoadParts,
    setPendingRestoreParts,
    setPartsRestored,
    onUrlRestoreComplete,
    setLoadingStatus
) => {
    console.log('[cleanupRestoration] クリーンアップ開始');
    restorationInProgressRef.current = false;
    setIsRestoring(false);
    if (setPendingLoadParts) setPendingLoadParts(null);
    if (typeof setPendingRestoreParts === 'function') {
        setPendingRestoreParts(null);
    }
    if (typeof setPartsRestored === 'function') {
        setPartsRestored(true);
    }
    if (typeof onUrlRestoreComplete === 'function') {
        onUrlRestoreComplete();
    }
    setLoadingStatus('');
    console.log('[cleanupRestoration] クリーンアップ完了');
};

// パーツ復元条件をチェックする関数
export const checkRestorationConditions = (
    selectedMs,
    allPartsCache,
    handlePartSelect,
    restorationInProgressRef
) => {
    if (DEBUG_PARTS_LOADING) {
        console.log('[checkRestorationConditions] 復元条件チェック:');
        console.log('- selectedMs:', selectedMs?.["MS名"]);
        console.log('- allPartsCache存在:', !!allPartsCache);
        console.log('- allPartsCacheKeys:', allPartsCache ? Object.keys(allPartsCache).length : 0);
        console.log('- handlePartSelectType:', typeof handlePartSelect);
        console.log('- restorationInProgress:', restorationInProgressRef.current);
    }

    return !!(
        selectedMs && 
        allPartsCache && 
        Object.keys(allPartsCache).length > 0 && 
        typeof handlePartSelect === 'function' &&
        !restorationInProgressRef.current
    );
};

// URL生成用のパーツデータ取得関数
export const generatePartsDataForUrl = (selectedParts) => {
    if (!selectedParts || selectedParts.length === 0) {
        return [];
    }
    
    return selectedParts.map(part => part.name).filter(name => name && name.trim());
};

// ビルドデータを生成する関数
export const generateBuildData = (selectedMs, selectedParts, isFullStrengthened, expansionType) => {
    if (!selectedMs) {
        throw new Error('MSが選択されていません');
    }

    const partsNames = generatePartsDataForUrl(selectedParts);
    
    return {
        msName: selectedMs["MS名"],
        parts: partsNames,
        isFullStrengthened: !!isFullStrengthened,
        expansionType: expansionType || 'なし',
        // 追加のメタデータ
        timestamp: new Date().toISOString(),
        version: '1.5', // バージョン情報
        msData: {
            cost: selectedMs["コスト"],
            type: selectedMs["属性"]
        }
    };
};