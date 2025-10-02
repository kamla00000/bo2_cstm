import { useFlick } from '../hooks/useFlick';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MSSelector from './MSSelector';
import StatusDisplay from './StatusDisplay';
import pickedMsStyles from './PickedMs.module.css';
import SlotSelector from './SlotSelector';
import SelectedPartDisplay from './SelectedPartDisplay';
import MsInfoDisplay from './MsInfoDisplay';
import PartPreview from './PartPreview';
import InfoModal from './InfoModal';
import { EXPANSION_OPTIONS, EXPANSION_DESCRIPTIONS } from '../constants/appConstants';
import styles from './PickedMs.module.css';

const MAX_SAVED_BUILDS_PER_MS = 10; // MS別の最大保存数を10に変更
const LOCAL_KEY_PREFIX = 'gbo2cstm_builds_'; // MS別にキーを分ける
const DEBUG_PARTS_LOADING = true; // デバッグフラグ

// MS名からストレージキーを生成する関数
const getMsStorageKey = (msName) => {
    if (!msName) return null;
    // MS名を正規化してキーに使用
    const normalized = msName
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_') // 特殊文字をアンダースコアに変換
        .replace(/_+/g, '_') // 連続するアンダースコアを1つに
        .replace(/^_+|_+$/g, ''); // 先頭末尾のアンダースコアを削除
    return `${LOCAL_KEY_PREFIX}${normalized}`;
};

function saveBuildToLocal(build, msName) {
    try {
        const storageKey = getMsStorageKey(msName);
        if (!storageKey) {
            console.error('[saveBuildToLocal] 無効なMS名:', msName);
            return false;
        }

        let builds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // 新しいビルドを先頭に追加
        builds.unshift(build);
        
        // MS別の最大数を超えた場合は古いものを削除
        if (builds.length > MAX_SAVED_BUILDS_PER_MS) {
            builds = builds.slice(0, MAX_SAVED_BUILDS_PER_MS);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(builds));
        console.log('[saveBuildToLocal] 保存成功:', {
            msName: msName,
            storageKey: storageKey,
            totalBuilds: builds.length,
            maxBuilds: MAX_SAVED_BUILDS_PER_MS,
            partsCount: build.parts?.length || 0,
            parts: build.parts
        });
        
        return true;
    } catch (error) {
        console.error('[saveBuildToLocal] 保存失敗:', error);
        return false;
    }
}

function loadBuildsFromLocal(msName) {
    try {
        const storageKey = getMsStorageKey(msName);
        if (!storageKey) {
            console.error('[loadBuildsFromLocal] 無効なMS名:', msName);
            return [];
        }

        const builds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        console.log('[loadBuildsFromLocal] ロード成功:', {
            msName: msName,
            storageKey: storageKey,
            totalBuilds: builds.length,
            maxBuilds: MAX_SAVED_BUILDS_PER_MS,
            builds: builds.map(b => ({ 
                partsCount: b.parts?.length || 0,
                parts: b.parts 
            }))
        });
        return builds;
    } catch (error) {
        console.error('[loadBuildsFromLocal] ロード失敗:', error);
        return [];
    }
}

// 全MSのビルド数を取得する関数（デバッグ用）
function getAllBuildsCount() {
    try {
        let totalCount = 0;
        const msBuilds = {};
        
        // localStorageの全キーをチェック
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(LOCAL_KEY_PREFIX)) {
                const msKey = key.replace(LOCAL_KEY_PREFIX, '');
                const builds = JSON.parse(localStorage.getItem(key) || '[]');
                msBuilds[msKey] = builds.length;
                totalCount += builds.length;
            }
        }
        
        console.log('[getAllBuildsCount] 全ビルド数:', { totalCount, msBuilds });
        return { totalCount, msBuilds };
    } catch (error) {
        console.error('[getAllBuildsCount] エラー:', error);
        return { totalCount: 0, msBuilds: {} };
    }
}

// パーツ画像表示（LVレイヤー付き）: 関数コンポーネント化
const RenderPartImage = ({ partName }) => {
    const lvMatch = String(partName).match(/_LV(\d+)/i);
    const baseName = partName.replace(/_LV\d+$/, '');
    const lv = lvMatch ? lvMatch[1] : '';
    const lvImgSrc = `/images/parts/${partName}.webp`;
    const baseImgSrc = `/images/parts/${baseName}.webp`;
    const defaultImgSrc = '/images/parts/default.webp';

    const [imgSrc, setImgSrc] = React.useState(lvImgSrc);

    const handleError = () => {
        if (imgSrc === lvImgSrc) {
            setImgSrc(baseImgSrc);
        } else if (imgSrc === baseImgSrc) {
            setImgSrc(defaultImgSrc);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block', width: 32, height: 32, marginRight: 2 }}>
            <img
                src={imgSrc}
                alt={partName}
                style={{
                    width: 32,
                    height: 32,
                    objectFit: 'cover',
                    borderRadius: 4,
                    background: '#333',
                    opacity: 0.95,
                }}
                onError={handleError}
            />
            {lv && (
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'rgba(0,0,0,0.8)',
                    color: '#fff',
                    fontSize: '0.7em',
                    padding: '1px 3px',
                    borderRadius: '0 0 4px 0',
                    pointerEvents: 'none',
                }}>
                    LV{lv}
                </div>
            )}
        </div>
    );
};

const PickedMs = React.forwardRef(({
    msData,
    selectedMs,
    selectedParts,
    hoveredPart,
    selectedPreviewPart,
    isFullStrengthened,
    expansionType,
    currentStats,
    slotUsage,
    usageWithPreview,
    hoveredOccupiedSlots,
    setIsFullStrengthened,
    setExpansionType,
    handleMsSelect,
    handlePartSelect,
    handlePartRemove,
    handleClearAllParts,
    allPartsCache,
    className,
    onSelectedPartDisplayHover,
    onSelectedPartDisplayLeave,
    showSelector,
    setShowSelector,
    filterType,
    setFilterType,
    filterCost,
    setFilterCost,
    filterLv,
    setFilterLv,
    bgVideo,
    videoRef,
    handleBuildShare,
    pendingRestoreParts,
    setPendingRestoreParts,
    setPartsRestored,
    urlBuildData,
    onUrlRestoreComplete,
}, ref) => {
    const navigate = useNavigate();

    // 右カラムの表示状態管理（767px以下のみ）
    const [showRightColumn, setShowRightColumn] = useState(false);
    const [isHiding, setIsHiding] = useState(false);

    // ステータスヒント表示状態を追加
    const [showStatusHint, setShowStatusHint] = useState(false);
    const [hasShownHintForCurrentMs, setHasShownHintForCurrentMs] = useState(false);

    // セーブ＆ロード機能
    const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
    const [savedBuilds, setSavedBuilds] = useState([]);
    const [saveError, setSaveError] = useState('');

    // 追加: ロード用フラグと一時保存
    const [pendingLoadParts, setPendingLoadParts] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(''); // ロード状況表示用
    
    // パーツ復元処理の重複実行防止用フラグ
    const [isRestoring, setIsRestoring] = useState(false);
    const restorationInProgressRef = useRef(false);

    // MSリストの絞り込み
    const filteredMsData = msData
        ? msData.filter(ms => {
            let typeMatch = !filterType || ms["属性"] === filterType;
            let costMatch = true;
            if (filterCost && filterCost !== '') {
                if (filterCost === 'low') {
                    costMatch = Number(ms["コスト"]) <= 400;
                } else {
                    costMatch = String(ms["コスト"]) === filterCost;
                }
            }
            let lvMatch = true;
            if (filterLv && filterLv !== '') {
                lvMatch = ms["MS名"].endsWith(`_LV${filterLv}`);
            }
            return typeMatch && costMatch && lvMatch;
        })
        : [];

    // アニメーション付きで右カラムを表示
    const showRightColumnWithAnimation = () => {
        setIsHiding(false);
        setShowRightColumn(true);
        setShowStatusHint(false);
    };

    // アニメーション付きで右カラムを非表示
    const hideRightColumnWithAnimation = () => {
        setIsHiding(true);
        setTimeout(() => {
            setShowRightColumn(false);
            setIsHiding(false);
        }, 100);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 767) {
                setShowRightColumn(false);
                setIsHiding(false);
                setShowStatusHint(false);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedMs, showSelector, showRightColumn]);

    useEffect(() => {
        if (selectedMs && !showSelector && window.innerWidth <= 767 && !hasShownHintForCurrentMs) {
            setShowStatusHint(true);
            setHasShownHintForCurrentMs(true);
            const fadeTimer = setTimeout(() => {
                setShowStatusHint(false);
            }, 1000);
            return () => clearTimeout(fadeTimer);
        } else {
            setShowStatusHint(false);
        }
    }, [selectedMs, showSelector]);

    useEffect(() => {
        if (selectedMs) {
            setHasShownHintForCurrentMs(false);
        }
    }, [selectedMs]);

    useFlick(
        () => { 
            if (window.innerWidth <= 767 && !showSelector && selectedMs) {
                showRightColumnWithAnimation();
            }
        },
        () => { 
            if (window.innerWidth <= 767 && !showSelector && selectedMs) {
                hideRightColumnWithAnimation();
            }
        }
    );
    const baseName = selectedMs
        ? selectedMs["MS名"]
            .replace(/_LV\d+$/, '')
            .trim()
        : 'default';

    const getTypeColor = (type) => {
        switch (type) {
            case '強襲':
                return 'bg-red-500 text-gray-200';
            case '汎用':
            case '汎用（変形）':
                return 'bg-blue-500 text-gray-200';
            case '支援':
            case '支援攻撃':
                return 'bg-yellow-500 text-black';
            default:
                return 'bg-gray-500 text-gray-200';
        }
    };

    // MSSelectorに戻る際にURLをクリアする関数
    const handleOpenSelector = () => {
        setShowSelector(true);
        navigate('/');
    };

    const handleSelectMs = (ms) => {
        console.log('[handleSelectMs] MS選択:', ms);
        handleMsSelect(ms);
        setShowSelector(false);
    };

    // セーブ/ロードボタン
    const handleShowSaveLoadModal = () => {
        if (selectedMs) {
            // 現在のMSのビルドのみを読み込み
            setSavedBuilds(loadBuildsFromLocal(selectedMs["MS名"]));
            setShowSaveLoadModal(true);
            setSaveError('');
            
            // デバッグ用：全MS別ビルド数を表示
            getAllBuildsCount();
        }
    };

    // セーブ処理（名前なし）
    const handleSaveBuild = () => {
        console.log('[handleSaveBuild] 開始');
        console.log('[handleSaveBuild] selectedMs:', selectedMs);
        console.log('[handleSaveBuild] selectedParts:', selectedParts);
        
        if (!selectedMs) {
            setSaveError('MSが選択されていません');
            return;
        }

        // MS別の最大保存数をチェック
        if (savedBuilds.length >= MAX_SAVED_BUILDS_PER_MS) {
            setSaveError(`このMSのビルド保存上限（${MAX_SAVED_BUILDS_PER_MS}個）に達しています`);
            return;
        }

        // パーツ名配列を作成（詳細なログ付き）
        const partsArray = selectedParts ? selectedParts.map(p => {
            console.log('[handleSaveBuild] パーツ処理:', { original: p, name: p.name });
            return p.name;
        }) : [];

        // より詳細なビルドデータを作成（名前なし）
        const build = {
            msName: selectedMs["MS名"],
            parts: partsArray,
            isFullStrengthened: Boolean(isFullStrengthened),
            expansionType: expansionType || 'なし',
            // 追加のメタデータ
            timestamp: new Date().toISOString(),
            version: '1.5', // バージョン情報を更新
            msData: {
                cost: selectedMs["コスト"],
                type: selectedMs["属性"]
            }
        };
        
        console.log('[handleSaveBuild] 保存するビルド:', JSON.stringify(build, null, 2));
        
        try {
            const success = saveBuildToLocal(build, selectedMs["MS名"]);
            if (success) {
                setSavedBuilds(loadBuildsFromLocal(selectedMs["MS名"]));
                setSaveError('');
                console.log('[handleSaveBuild] 保存完了');
            } else {
                setSaveError('保存に失敗しました');
            }
        } catch (error) {
            console.error('[handleSaveBuild] 保存エラー:', error);
            setSaveError('保存に失敗しました');
        }
    };

    // ロード処理
    const handleLoadBuild = (build) => {
        console.log('[handleLoadBuild] ===== ロード開始 =====');
        console.log('[handleLoadBuild] ビルドデータ:', JSON.stringify(build, null, 2));
        
        setLoadingStatus('MSを検索中...');
        
        // 1. MSを検索
        const foundMs = msData.find(ms => ms["MS名"] === build.msName);
        if (!foundMs) {
            alert(`MSが見つかりません: ${build.msName}`);
            console.error('[handleLoadBuild] MSが見つかりません:', build.msName);
            setLoadingStatus('');
            return;
        }

        console.log('[handleLoadBuild] MS発見:', foundMs["MS名"]);
        setLoadingStatus('現在のパーツをクリア中...');

        // 2. 現在のパーツを全てクリア
        console.log('[handleLoadBuild] パーツクリア実行');
        handleClearAllParts();

        // 3. MSを選択
        setTimeout(() => {
            console.log('[handleLoadBuild] MS選択:', foundMs["MS名"]);
            setLoadingStatus('MSを選択中...');
            handleMsSelect(foundMs);

            // 4. フル強化状態を設定
            setTimeout(() => {
                console.log('[handleLoadBuild] フル強化設定:', build.isFullStrengthened);
                setLoadingStatus('設定を復元中...');
                setIsFullStrengthened(build.isFullStrengthened || false);

                // 5. 拡張タイプを設定
                setTimeout(() => {
                    console.log('[handleLoadBuild] 拡張タイプ設定:', build.expansionType);
                    setExpansionType(build.expansionType || 'なし');

                    // 6. パーツ復元のためにpendingに保存
                    setTimeout(() => {
                        console.log('[handleLoadBuild] パーツ復元準備:', build.parts);
                        setLoadingStatus('パーツを復元中...');
                        
                        const partsToRestore = build.parts || [];
                        console.log('[handleLoadBuild] 復元対象パーツ数:', partsToRestore.length);
                        console.log('[handleLoadBuild] 復元対象パーツ一覧:', partsToRestore);
                        
                        setPendingLoadParts(partsToRestore);
                        
                        // App側のpendingRestorePartsにもセット
                        if (typeof setPendingRestoreParts === 'function') {
                            setPendingRestoreParts(partsToRestore);
                        }
                        if (typeof setPartsRestored === 'function') {
                            setPartsRestored(false);
                        }
                    }, 200);
                }, 200);
            }, 200);
        }, 200);

        setShowSaveLoadModal(false);
    };

    // パーツ復元の統一処理関数
    const restorePartsSequentially = async (partsToRestore, source = 'unknown') => {
        console.log(`[restorePartsSequentially] ===== パーツ復元開始 (${source}) =====`);
        
        // refを使った重複実行防止
        if (restorationInProgressRef.current) {
            console.log('[restorePartsSequentially] 既に復元処理中のためスキップ');
            return;
        }

        if (!partsToRestore || partsToRestore.length === 0) {
            console.log('[restorePartsSequentially] 復元するパーツがありません');
            return;
        }

        restorationInProgressRef.current = true;
        setIsRestoring(true);
        setLoadingStatus('パーツを復元中...');

        try {
            const allPartsFlat = Object.values(allPartsCache).flat();
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
            
        } catch (error) {
            console.error('[restorePartsSequentially] パーツ復元処理でエラー:', error);
        } finally {
            // クリーンアップ（確実に実行される）
            console.log('[restorePartsSequentially] クリーンアップ開始');
            restorationInProgressRef.current = false;
            setIsRestoring(false);
            setPendingLoadParts(null);
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
            console.log('[restorePartsSequentially] ===== パーツ復元処理終了 =====');
        }
    };

    // 統一された復元処理のuseEffect
    useEffect(() => {
        if (DEBUG_PARTS_LOADING) {
            console.log('[useEffect Unified] ===== 統一復元チェック =====');
            console.log('[useEffect Unified] urlBuildData:', urlBuildData);
            console.log('[useEffect Unified] pendingRestoreParts:', pendingRestoreParts);
            console.log('[useEffect Unified] pendingLoadParts:', pendingLoadParts);
            console.log('[useEffect Unified] selectedMs:', selectedMs?.["MS名"]);
            console.log('[useEffect Unified] allPartsCache存在:', !!allPartsCache);
            console.log('[useEffect Unified] allPartsCacheKeys:', allPartsCache ? Object.keys(allPartsCache).length : 0);
            console.log('[useEffect Unified] handlePartSelectType:', typeof handlePartSelect);
            console.log('[useEffect Unified] restorationInProgress:', restorationInProgressRef.current);
        }

        // 復元が必要な条件をチェック
        if (!selectedMs || 
            !allPartsCache || 
            Object.keys(allPartsCache).length === 0 || 
            typeof handlePartSelect !== 'function' ||
            restorationInProgressRef.current) {
            return;
        }

        // URL復元を優先
        if (urlBuildData && urlBuildData.length > 0) {
            console.log('[useEffect Unified] URL復元を実行:', urlBuildData);
            restorePartsSequentially(urlBuildData, 'URL');
            return;
        }

        // 次にApp側のpendingRestorePartsをチェック
        if (pendingRestoreParts && pendingRestoreParts.length > 0) {
            console.log('[useEffect Unified] App側復元を実行:', pendingRestoreParts);
            restorePartsSequentially(pendingRestoreParts, 'App');
            return;
        }

        // 最後にローカルのpendingLoadPartsをチェック
        if (pendingLoadParts && pendingLoadParts.length > 0) {
            console.log('[useEffect Unified] ローカル復元を実行:', pendingLoadParts);
            restorePartsSequentially(pendingLoadParts, 'Local');
            return;
        }

    }, [
        urlBuildData, 
        pendingRestoreParts, 
        pendingLoadParts, 
        selectedMs, 
        allPartsCache, 
        handlePartSelect
    ]);

    // 削除処理
    const handleDeleteBuild = (index) => {
        if (!selectedMs) return;
        
        const builds = [...savedBuilds];
        builds.splice(index, 1);
        
        const storageKey = getMsStorageKey(selectedMs["MS名"]);
        
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(builds));
            setSavedBuilds(builds);
            console.log('[handleDeleteBuild] 削除後:', {
                msName: selectedMs["MS名"],
                storageKey: storageKey,
                remainingBuilds: builds.length
            });
        }
    };

    // MS画像取得
    const getMsImageSrc = (msName) => {
        if (!msName) return '/images/ms/default.webp';
        const base = msName.replace(/_LV\d+$/, '').trim();
        return `/images/ms/${base}.webp`;
    };

    const leftColClass = `${styles.leftColCustom} space-y-4 flex flex-col flex-shrink-0 ${showSelector ? 'w-full' : ''}`;
    const leftColStyle = showSelector
        ? {}
        : { width: '60%', minWidth: 320, maxWidth: 900 };

    // アイコンSVG（コピーアイコンと同じシリーズ）
    const SaveLoadIcon = (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff9100" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="5" y="5" rx="2" ry="2"/>
            <path d="M12 9v6M9 12h6"/>
        </svg>
    );

    return (
        <div
            ref={ref}
            className={
                [
                    styles.pickedmsMainContainer,
                    "pickedms-main-container flex flex-row gap-2 items-start min-w-0 relative z-10 w-full max-w-screen-xl",
                    className,
                    showSelector ? "" : styles.pickedmsMainContainerActive
                ].join(" ")
            }
        >
            {/* ロード状況表示 */}
            {loadingStatus && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    zIndex: 9999,
                    textAlign: 'center'
                }}>
                    <div style={{ marginBottom: '10px' }}>
                        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                    <div>{loadingStatus}</div>
                </div>
            )}
            
            {/* 左側のカラム */}
            <div className={leftColClass} style={leftColStyle}>
                {showSelector && (
                    <MSSelector
                        msData={filteredMsData}
                        onSelect={handleSelectMs}
                        selectedMs={selectedMs}
                        filterType={filterType}
                        setFilterType={setFilterType}
                        filterCost={filterCost}
                        setFilterCost={setFilterCost}
                        filterLv={filterLv}
                        setFilterLv={setFilterLv}
                    />
                )}

                {selectedMs && !showSelector && (
                    <>
                        <div className={pickedMsStyles.msreselect + " w-full flex justify-center"}>
                            <div className="flex items-center" style={{ maxWidth: '1280px', width: '100%' }}>
                                {/* MS再選択ボタン */}
                                <button
                                    className="h-14 flex-1 rounded-none text-4xl text-gray-200 bg-transparent relative overflow-visible flex items-center group pl-8 pr-8"
                                    style={{
                                        borderRadius: 0,
                                        marginBottom: 0,
                                        zIndex: 1,
                                        padding: 0,
                                        minWidth: 0,
                                        textDecoration: 'none',
                                    }}
                                    onClick={handleOpenSelector}
                                >
                                    <svg
                                        className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 group-hover:opacity-0"
                                        viewBox="0 0 100 56"
                                        preserveAspectRatio="none"
                                        aria-hidden="true"
                                        style={{ zIndex: 0 }}
                                    >
                                        <defs>
                                            <pattern
                                                id="stripe-bg"
                                                patternUnits="userSpaceOnUse"
                                                width="6"
                                                height="16"
                                                patternTransform="rotate(4)"
                                            >
                                                <animateTransform
                                                    attributeName="patternTransform"
                                                    type="translate"
                                                    from="0,0"
                                                    to="-6,0"
                                                    dur="3s"
                                                    repeatCount="indefinite"
                                                    additive="sum"
                                                />
                                                <rect x="0" y="0" width="4" height="16" fill="#ff9100" />
                                                <rect x="4" y="0" width="2" height="16" fill="transparent" />
                                            </pattern>
                                        </defs>
                                        <rect x="0" y="0" width="100" height="56" fill="url(#stripe-bg)" />
                                    </svg>
                                    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                                        <video
                                            ref={typeof videoRef !== 'undefined' ? videoRef : null}
                                            className="w-full h-full object-cover opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-700"
                                            src={bgVideo}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            preload="auto"
                                            style={{
                                                pointerEvents: 'none',
                                            }}
                                        />
                                    </div>
                                    <span className={"relative z-10 font-extrabold text-white text-4xl ml-4 " + styles.headingTextMobile}
                                        style={{ textShadow: '2px 2px 8px #000, 0 0 4px #000' }}
                                    >
                                        M　S　再　選　択
                                    </span>
                                </button>
                                {/* セーブ/ロードボタン（アイコンのみ） */}
                                <button onClick={handleShowSaveLoadModal} className="w-16 h-14 flex items-center justify-center bg-gray-800 hover:bg-gray-600 shadow transition" style={{ zIndex: 2, borderRadius: 0 }} title="セーブ/ロード">
                                    {SaveLoadIcon}
                                </button>
                                {/* ビルド共有ボタン */}
                                {selectedMs && (
                                    <button
                                        className="w-16 h-14 flex items-center justify-center bg-gray-800 hover:bg-gray-600 shadow transition"
                                        style={{ zIndex: 2, borderRadius: 0 }}
                                        onClick={typeof handleBuildShare === 'function' ? handleBuildShare : undefined}
                                        title="ビルドのURLをコピー"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                        </svg>
                                    </button>
                                )}
                                {/* X（旧Twitter）アイコン */}
                                <a
                                    href="https://x.com/GBO2CSTM"
                                    className={styles.xIcon + " w-16 h-14 flex items-center justify-center bg-gray-800 hover:bg-gray-600 shadow transition"}
                    style={{ zIndex: 2, borderRadius: 0 }}
                                    aria-label="Xでシェア" target="_blank"
                                >
                                    <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
                                        <rect width="64" height="64" rx="12" fill="black"/>
                                        <path d="M44.7 16H51.5L36.7 32.1L54 52H41.6L30.8 39.1L18.8 52H12L27.8 35.9L11 16H23.7L33.4 27.7L44.7 16ZM42.5 48.5H46.1L22.7 19.2H18.8L42.5 48.5Z" fill="white"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className={pickedMsStyles.msInfoWrapper}>
                            <MsInfoDisplay
                                selectedMs={selectedMs}
                                baseName={baseName}
                                isFullStrengthened={isFullStrengthened}
                                setIsFullStrengthened={setIsFullStrengthened}
                                expansionType={expansionType}
                                setExpansionType={setExpansionType}
                                expansionOptions={EXPANSION_OPTIONS}
                                expansionDescriptions={EXPANSION_DESCRIPTIONS}
                                getTypeColor={getTypeColor}
                                onMsImageClick={handleOpenSelector}
                                msData={msData}
                                handleMsSelect={handleMsSelect}
                            />
                        </div>
                        <div className={pickedMsStyles.slotPartsWrapper + " flex flex-row gap-6 items-end w-full"}>
                            <div className={pickedMsStyles['slotparts-leftcol']}>
                                <div className={styles.slotBarSection}>
                                    <div className={styles.slotBarWrapper}>
                                        <SlotSelector
                                            usage={usageWithPreview}
                                            baseUsage={slotUsage}
                                            currentStats={currentStats}
                                            hoveredOccupiedSlots={hoveredOccupiedSlots}
                                        />
                                    </div>
                                </div>
                                <SelectedPartDisplay
                                    parts={selectedParts}
                                    onRemove={handlePartRemove}
                                    onClearAllParts={handleClearAllParts}
                                    onHoverPart={onSelectedPartDisplayHover}
                                    onLeavePart={onSelectedPartDisplayLeave}
                                />
                                <div className={styles.partPreviewArea}>
                                    <PartPreview part={hoveredPart || selectedPreviewPart} />
                                </div>
                            </div>
                            <div className={`${pickedMsStyles['slotparts-rightcol']} ${
                                showRightColumn && !isHiding ? pickedMsStyles.showRightColumn : ''
                            } ${isHiding ? pickedMsStyles.isHiding : ''}`}>
                                <div className={pickedMsStyles['slotparts-status-mobile']}>
                                    <StatusDisplay
                                        stats={currentStats}
                                        selectedMs={selectedMs}
                                        hoveredPart={hoveredPart}
                                        isFullStrengthened={isFullStrengthened}
                                        isModified={currentStats.isModified}
                                        isMobile={true}
                                        onClose={hideRightColumnWithAnimation}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            {selectedMs && !showSelector && (
                <div className={pickedMsStyles.statusListWrapper + " space-y-4 flex flex-col flex-grow w-full h-full justify-end items-end"}>
                    <StatusDisplay
                        stats={currentStats}
                        selectedMs={selectedMs}
                        hoveredPart={hoveredPart}
                        isFullStrengthened={isFullStrengthened}
                        isModified={currentStats.isModified}
                    />
                </div>
            )}
            {showStatusHint && (
                <div className={pickedMsStyles.statusSwipeHint}>
                    <div className={pickedMsStyles.statusSwipeHintIcon}></div>
                    <div className={pickedMsStyles.statusSwipeHintTxt}>ステータス一覧を表示</div>
                </div>
            )}
            {/* セーブ/ロードモーダル */}
            <InfoModal
                open={showSaveLoadModal}
                title={null}
                message={
                    <div>
                        {/* MS名表示 */}
                        {selectedMs && (
                            <div style={{
                                textAlign: 'center',
                                marginBottom: 16,
                                padding: '8px 12px',
                                background: '#444',
                                borderRadius: 6,
                                color: '#fff',
                                fontSize: '1.1em',
                                fontWeight: 'bold'
                            }}>
                                📂 {selectedMs["MS名"]} のビルド ({savedBuilds.length}/{MAX_SAVED_BUILDS_PER_MS})
                            </div>
                        )}
                        
                        {/* ビルド一覧 */}
                        <div style={{ marginBottom: 16, maxHeight: '400px', overflowY: 'auto' }}>
                            {savedBuilds.map((build, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: 8,
                                    background: '#222',
                                    borderRadius: 8,
                                    padding: 8,
                                    minHeight: 60,
                                }}>
                                    {/* MS画像 */}
                                    <img 
                                        src={getMsImageSrc(build.msName)} 
                                        alt={build.msName} 
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 6,
                                            marginRight: 12,
                                            background: '#333',
                                            objectFit: 'cover',
                                        }} 
                                    />
                                    
                                    {/* パーツ画像群（2行4列） */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(4, 32px)',
                                        gridTemplateRows: 'repeat(2, 32px)',
                                        gap: 2,
                                        marginRight: 12,
                                        minWidth: 136,
                                    }}>
                                        {Array.from({ length: 8 }).map((_, i) => {
                                            const partName = build.parts && build.parts[i];
                                            return partName ? (
                                                <RenderPartImage key={i} partName={partName} />
                                            ) : (
                                                <div key={i} style={{
                                                    width: 32,
                                                    height: 32,
                                                    background: '#444',
                                                    borderRadius: 4,
                                                }} />
                                            );
                                        })}
                                    </div>
                                    
                                    {/* 呼出・削除ボタン（縦並び） */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 4,
                                        marginLeft: 'auto',
                                    }}>
                                        <button 
                                            onClick={() => handleLoadBuild(build)} 
                                            className="hex-badge" 
                                            style={{ 
                                                minWidth: 60, 
                                                height: 28,
                                                fontSize: '0.9em'
                                            }}
                                        >
                                            呼出
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteBuild(idx)} 
                                            className="hex-badge" 
                                            style={{ 
                                                minWidth: 60, 
                                                height: 28, 
                                                background: '#a00', 
                                                color: '#fff',
                                                fontSize: '0.9em'
                                            }}
                                        >
                                            削除
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {savedBuilds.length === 0 && (
                                <div style={{ 
                                    color: '#fff', 
                                    textAlign: 'center', 
                                    padding: '40px 20px',
                                    background: '#333',
                                    borderRadius: 8,
                                    fontSize: '1.1em'
                                }}>
                                    このMSのセーブデータはまだありません
                                </div>
                            )}
                        </div>
                        
                        {/* 下部ボタン */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 12,
                            paddingTop: 12,
                            borderTop: '1px solid #444'
                        }}>
                            <button
                                onClick={() => setShowSaveLoadModal(false)}
                                className="hex-badge"
                                style={{ 
                                    minWidth: 80, 
                                    height: 36,
                                    fontSize: '1em'
                                }}
                            >
                                閉じる
                            </button>
                            <button
                                onClick={handleSaveBuild}
                                disabled={!selectedMs || savedBuilds.length >= MAX_SAVED_BUILDS_PER_MS}
                                className="hex-badge"
                                style={{ 
                                    minWidth: 80, 
                                    height: 36,
                                    fontSize: '1em',
                                    background: savedBuilds.length >= MAX_SAVED_BUILDS_PER_MS ? '#666' : undefined
                                }}
                            >
                                保存
                            </button>
                        </div>
                        
                        {/* エラー表示 */}
                        {saveError && (
                            <div style={{ 
                                color: '#ff6b6b', 
                                textAlign: 'center', 
                                marginTop: 8,
                                fontSize: '0.9em'
                            }}>
                                {saveError}
                            </div>
                        )}
                    </div>
                }
                onOk={() => setShowSaveLoadModal(false)}
                okButtonText=""
            />
        </div>
    );
});

export default PickedMs;