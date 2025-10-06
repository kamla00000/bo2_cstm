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
            
            // 5. 括弧の種類を統一して検索 [Type-A] vs ［Type-A］
            if (!foundPart) {
                const normalizedPartName = partName.replace(/［/g, '[').replace(/］/g, ']');
                foundPart = allPartsFlat.find(p => {
                    const normalizedPName = p.name.replace(/［/g, '[').replace(/］/g, ']');
                    return normalizedPName === normalizedPartName;
                });
                if (foundPart) {
                    console.log(`[restorePartsSequentially] 括弧統一一致で発見: "${foundPart.name}"`);
                }
            }
            
            // 6. 括弧統一+トリム+大文字小文字無視
            if (!foundPart) {
                const normalizedPartName = partName.replace(/［/g, '[').replace(/］/g, ']').trim().toLowerCase();
                foundPart = allPartsFlat.find(p => {
                    const normalizedPName = p.name.replace(/［/g, '[').replace(/］/g, ']').trim().toLowerCase();
                    return normalizedPName === normalizedPartName;
                });
                if (foundPart) {
                    console.log(`[restorePartsSequentially] 括弧統一+正規化一致で発見: "${foundPart.name}"`);
                }
            }
            
            // 7. 部分一致（前方一致）
            if (!foundPart) {
                foundPart = allPartsFlat.find(p => p.name.startsWith(partName) || partName.startsWith(p.name));
                if (foundPart) {
                    console.log(`[restorePartsSequentially] 前方一致で発見: "${foundPart.name}"`);
                }
            }
            
            // 8. 部分一致（包含）
            if (!foundPart) {
                foundPart = allPartsFlat.find(p => p.name.includes(partName) || partName.includes(p.name));
                if (foundPart) {
                    console.log(`[restorePartsSequentially] 包含一致で発見: "${foundPart.name}"`);
                }
            }
            
            // 9. レーベンシュタイン距離による類似度検索
            if (!foundPart) {
                const levenshteinDistance = (a, b) => {
                    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
                    for (let i = 0; i <= a.length; i += 1) {
                        matrix[0][i] = i;
                    }
                    for (let j = 0; j <= b.length; j += 1) {
                        matrix[j][0] = j;
                    }
                    for (let j = 1; j <= b.length; j += 1) {
                        for (let i = 1; i <= a.length; i += 1) {
                            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
                            matrix[j][i] = Math.min(
                                matrix[j][i - 1] + 1,
                                matrix[j - 1][i] + 1,
                                matrix[j - 1][i - 1] + indicator,
                            );
                        }
                    }
                    return matrix[b.length][a.length];
                };
                
                const maxDistance = Math.max(3, Math.floor(partName.length * 0.2)); // 20%以下の差異
                let bestMatch = null;
                let bestDistance = Infinity;
                
                allPartsFlat.forEach(p => {
                    const distance = levenshteinDistance(partName.toLowerCase(), p.name.toLowerCase());
                    if (distance <= maxDistance && distance < bestDistance) {
                        bestDistance = distance;
                        bestMatch = p;
                    }
                });
                
                if (bestMatch) {
                    foundPart = bestMatch;
                    console.log(`[restorePartsSequentially] 類似度検索で発見: "${foundPart.name}" (距離: ${bestDistance})`);
                }
            }

            if (foundPart) {
                // リトライ機能付きでパーツ装備を実行
                let retryCount = 0;
                const maxRetries = 3;
                let success = false;
                
                while (retryCount < maxRetries && !success) {
                    try {
                        if (retryCount > 0) {
                            console.log(`[restorePartsSequentially] パーツ装備リトライ ${retryCount}回目: "${foundPart.name}"`);
                            await new Promise(resolve => setTimeout(resolve, 200 * retryCount)); // リトライ間隔を増加
                        } else {
                            console.log(`[restorePartsSequentially] パーツ装備実行: "${foundPart.name}"`);
                        }
                        
                        // パーツ装備実行
                        handlePartSelect(foundPart);
                        
                        success = true;
                        successCount++;
                        processedParts.push({ 
                            original: partName, 
                            found: foundPart.name, 
                            status: 'success',
                            retries: retryCount 
                        });
                        
                        // 装備処理後の安定化待機
                        await new Promise(resolve => setTimeout(resolve, 150));
                        
                    } catch (error) {
                        retryCount++;
                        console.error(`[restorePartsSequentially] パーツ装備エラー (試行${retryCount}/${maxRetries}): "${foundPart.name}"`, error);
                        
                        if (retryCount >= maxRetries) {
                            failedParts.push({ original: partName, found: foundPart.name, error: error.message });
                            processedParts.push({ 
                                original: partName, 
                                found: foundPart.name, 
                                status: 'error', 
                                error: error.message,
                                retries: retryCount 
                            });
                        }
                    }
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
        
        // 復元結果の詳細統計
        const statistics = {
            total: partsToRestore.length,
            successful: successCount,
            failed: failedParts.length,
            successRate: Math.round((successCount / partsToRestore.length) * 100),
            retriedCount: processedParts.filter(p => p.retries > 0).length
        };
        
        console.log('[restorePartsSequentially] 復元統計:', statistics);
        
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