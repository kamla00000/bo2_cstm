import { useFlick } from '../hooks/useFlick';
import React, { useState, useEffect } from 'react';
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

const MAX_SAVED_BUILDS = 3;
const LOCAL_KEY = 'gbo2cstm_builds';
const DEBUG_PARTS_LOADING = true; // デバッグフラグ

function saveBuildToLocal(build) {
    try {
        let builds = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
        
        // 既存の同名ビルドを削除
        builds = builds.filter(b => b.name !== build.name);
        
        // 新しいビルドを先頭に追加
        builds.unshift(build);
        
        // 最大数を超えた場合は古いものを削除
        if (builds.length > MAX_SAVED_BUILDS) {
            builds = builds.slice(0, MAX_SAVED_BUILDS);
        }
        
        localStorage.setItem(LOCAL_KEY, JSON.stringify(builds));
        console.log('[saveBuildToLocal] 保存成功:', {
            buildName: build.name,
            totalBuilds: builds.length,
            partsCount: build.parts?.length || 0,
            parts: build.parts
        });
        
        return true;
    } catch (error) {
        console.error('[saveBuildToLocal] 保存失敗:', error);
        return false;
    }
}

function loadBuildsFromLocal() {
    try {
        const builds = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
        console.log('[loadBuildsFromLocal] ロード成功:', {
            totalBuilds: builds.length,
            builds: builds.map(b => ({ 
                name: b.name, 
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
        <div style={{ position: 'relative', display: 'inline-block', width: 40, height: 40, marginRight: 4 }}>
            <img
                src={imgSrc}
                alt={partName}
                style={{
                    width: 40,
                    height: 40,
                    objectFit: 'cover',
                    borderRadius: 6,
                    background: '#222',
                    opacity: 0.95,
                }}
                onError={handleError}
            />
            {lv && (
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    fontSize: '0.8em',
                    padding: '1px 5px',
                    borderRadius: '0 0 6px 0',
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
    expansionOptions,
    expansionDescriptions,
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
    // 新しく追加されたURL復元用プロパティ
    urlBuildData = null,
    onUrlRestoreComplete = null,
    // localStorage復元用プロパティ（既存）
    onLoadStart = null,
    onLoadEnd = null
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
    const [saveName, setSaveName] = useState('');
    const [saveError, setSaveError] = useState('');

    // localStorage復元用のパーツ管理（App.jsと完全に分離）
    const [pendingLoadParts, setPendingLoadParts] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState('');

    // パーツ名正規化関数（URL復元とlocalStorage復元の両方で使用）
    const normalizePartName = (name) => {
        if (!name) return '';
        return String(name)
            .trim()
            .replace(/[Ａ-Ｚａ-ｚ０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)) // 全角英数→半角
            .replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)) // 全角記号→半角
            .replace(/[ΖＺZｚ]/g, 'z')
            .replace(/[νｖV]/g, 'v')
            .replace(/[αａA]/g, 'a')
            .replace(/[βｂB]/g, 'b')
            .replace(/[［\[]/g, '[').replace(/[］\]]/g, ']')
            .replace(/【/g, '[').replace(/】/g, ']')
            .replace(/_lv(\d+)/gi, (_, lv) => `_lv${lv}`) // _LV1→_lv1
            .replace(/[ＬＶ]/gi, 'lv')
            .replace(/[\s　]+/g, '')
            .normalize('NFKC')
            .toLowerCase();
    };

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

    // 共通のパーツ復元処理
    // ...existing code...

// 共通のパーツ復元処理の修正
const restoreParts = async (partsData, source = 'unknown') => {
    console.log(`${source}からパーツ復元開始:`, partsData);
    
    if (!selectedMs || !allPartsCache || !partsData) {
        console.log('復元に必要なデータが不足');
        return false;
    }

    setLoadingStatus(`${source}復元中...`);
    if (onLoadStart) onLoadStart();

    try {
        let restoredCount = 0;
        const allPartsFlat = Object.values(allPartsCache).flat();
        
        // 配列形式（URL復元とlocalStorage復元の両方）として処理
        const partsToRestore = Array.isArray(partsData) ? partsData : [];
        
        console.log(`${source}: 復元対象パーツ数:`, partsToRestore.length);
        console.log(`${source}: 復元対象パーツ一覧:`, partsToRestore);
        console.log(`${source}: 利用可能パーツ総数:`, allPartsFlat.length);

        for (let i = 0; i < partsToRestore.length; i++) {
            const partName = partsToRestore[i];
            if (!partName || partName === 'なし') continue;

            console.log(`${source}: ${i + 1}/${partsToRestore.length} "${partName}"を検索中...`);
            
            const normalizedPartName = normalizePartName(partName);
            let foundPart = null;

            // パーツ検索（正規化名で比較）
            foundPart = allPartsFlat.find(part => {
                const normalizedCacheName = normalizePartName(part.name);
                const match = normalizedCacheName === normalizedPartName;
                if (match) {
                    console.log(`${source}: マッチ発見 "${part.name}" (正規化: "${normalizedCacheName}")`);
                }
                return match;
            });

            if (foundPart) {
                console.log(`${source}: ${foundPart.name}を装備`);
                try {
                    await new Promise(resolve => {
                        handlePartSelect(foundPart);
                        setTimeout(resolve, 150); // 少し長めの間隔
                    });
                    restoredCount++;
                    console.log(`${source}: 装備成功 (${restoredCount}/${partsToRestore.length})`);
                } catch (selectError) {
                    console.error(`${source}: パーツ装備エラー:`, selectError);
                }
            } else {
                console.warn(`${source}: ${partName}が見つかりませんでした (正規化: "${normalizedPartName}")`);
                // デバッグ用：類似パーツを検索
                const similarParts = allPartsFlat.filter(part => 
                    normalizePartName(part.name).includes(normalizedPartName.substring(0, 5))
                ).slice(0, 3);
                if (similarParts.length > 0) {
                    console.log(`${source}: 類似パーツ候補:`, similarParts.map(p => p.name));
                }
            }
        }

        console.log(`${source}復元完了: ${restoredCount}/${partsToRestore.length}`);
        return restoredCount === partsToRestore.length;
    } catch (error) {
        console.error(`${source}復元エラー:`, error);
        return false;
    } finally {
        setLoadingStatus('');
        if (onLoadEnd) onLoadEnd();
    }
};

// ...existing code...

    // URL復元用のuseEffect（新規追加）
    useEffect(() => {
        if (urlBuildData && selectedMs && allPartsCache) {
            console.log('URL復元処理開始');
            
            const performUrlRestore = async () => {
                const success = await restoreParts(urlBuildData, 'URL');
                
                if (onUrlRestoreComplete) {
                    onUrlRestoreComplete(success);
                }
            };

            // 少し遅延を入れてMS選択後に実行
            const timer = setTimeout(performUrlRestore, 300);
            return () => clearTimeout(timer);
        }
    }, [urlBuildData, selectedMs, allPartsCache]);

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
        setSavedBuilds(loadBuildsFromLocal());
        setShowSaveLoadModal(true);
        setSaveName('');
        setSaveError('');
    };

    // セーブ処理
    const handleSaveBuild = () => {
        console.log('[handleSaveBuild] 開始');
        console.log('[handleSaveBuild] selectedMs:', selectedMs);
        console.log('[handleSaveBuild] selectedParts:', selectedParts);
        console.log('[handleSaveBuild] selectedParts.length:', selectedParts?.length || 0);
        console.log('[handleSaveBuild] selectedParts.map(p => p.name):', selectedParts?.map(p => p.name) || []);
        console.log('[handleSaveBuild] isFullStrengthened:', isFullStrengthened);
        console.log('[handleSaveBuild] expansionType:', expansionType);
        
        if (!selectedMs) {
            setSaveError('MSが選択されていません');
            return;
        }
        
        const name = saveName.trim();
        if (!name) {
            setSaveError('名前を入力してください');
            return;
        }
        if (name.length > 20) {
            setSaveError('名前は20文字以内で入力してください');
            return;
        }
        if (savedBuilds.some(b => b.name === name)) {
            setSaveError('同じ名前のビルドが既に存在します');
            return;
        }

        // パーツ名配列を作成（詳細なログ付き）
        const partsArray = selectedParts ? selectedParts.map(p => {
            console.log('[handleSaveBuild] パーツ処理:', { original: p, name: p.name });
            return p.name;
        }) : [];

        // より詳細なビルドデータを作成
        const build = {
            name,
            msName: selectedMs["MS名"],
            parts: partsArray,
            isFullStrengthened: Boolean(isFullStrengthened),
            expansionType: expansionType || 'なし',
            // 追加のメタデータ
            timestamp: new Date().toISOString(),
            version: '1.2', // バージョン情報を更新
            msData: {
                cost: selectedMs["コスト"],
                type: selectedMs["属性"]
            }
        };
        
        console.log('[handleSaveBuild] 保存するビルド:', JSON.stringify(build, null, 2));
        
        try {
            const success = saveBuildToLocal(build);
            if (success) {
                setSavedBuilds(loadBuildsFromLocal());
                setSaveName('');
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

            // 4. MS選択後にフル強化状態を設定
            setTimeout(() => {
                console.log('[handleLoadBuild] フル強化設定:', build.isFullStrengthened);
                setLoadingStatus('フル強化設定中...');
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
                    }, 200);
                }, 200);
            }, 200);
        }, 200);

        setShowSaveLoadModal(false);
    };

    // localStorage復元用のuseEffect（App.jsとは完全に独立）
    useEffect(() => {
        if (DEBUG_PARTS_LOADING) {
            console.log('[useEffect] ===== localStorage パーツ復元チェック =====');
            console.log('[useEffect] pendingLoadParts:', pendingLoadParts);
            console.log('[useEffect] pendingLoadParts.length:', pendingLoadParts?.length || 0);
            console.log('[useEffect] selectedMs:', selectedMs?.["MS名"]);
            console.log('[useEffect] allPartsCache存在:', !!allPartsCache);
            console.log('[useEffect] allPartsCacheKeys:', allPartsCache ? Object.keys(allPartsCache) : []);
            console.log('[useEffect] allPartsCacheLength:', allPartsCache ? Object.values(allPartsCache).flat().length : 0);
            console.log('[useEffect] handlePartSelectType:', typeof handlePartSelect);
            console.log('[useEffect] 現在のselectedParts数:', selectedParts?.length || 0);
        }

        // URL復元処理との競合を避けるため、URLパラメータをチェック
        const urlParams = new URLSearchParams(window.location.search);
        const hasUrlParts = urlParams.get('parts') && urlParams.get('parts').length > 0;
        
        if (hasUrlParts) {
            console.log('[useEffect] URL復元が優先されるため、localStorage復元をスキップ');
            return;
        }

        // pendingLoadPartsのみを処理（localStorage復元専用）
        if (pendingLoadParts && 
            pendingLoadParts.length > 0 && 
            selectedMs && 
            allPartsCache && 
            Object.keys(allPartsCache).length > 0 && 
            typeof handlePartSelect === 'function') {
            
            console.log('[useEffect] ===== localStorage内パーツ復元開始 =====');
            
            // 重複実行を防ぐため、復元実行前に状態を即座にクリア
            const currentRestoreParts = [...pendingLoadParts];
            setPendingLoadParts(null);

            // 配列形式でrestorePartsを呼び出し
            restoreParts(currentRestoreParts, 'localStorage').then(success => {
                console.log('[useEffect] localStorage復元結果:', success);
            }).catch(error => {
                console.error('[useEffect] localStorage復元処理でエラー:', error);
                setLoadingStatus('');
            });
        } else {
            if (DEBUG_PARTS_LOADING && pendingLoadParts && pendingLoadParts.length > 0) {
                console.log('[useEffect] localStorage復元条件未満:');
                console.log('  - pendingLoadParts:', !!pendingLoadParts, pendingLoadParts?.length);
                console.log('  - selectedMs:', !!selectedMs);
                console.log('  - allPartsCache:', !!allPartsCache);
                console.log('  - handlePartSelect:', typeof handlePartSelect);
            }
        }
    }, [selectedMs, allPartsCache, handlePartSelect, pendingLoadParts]);

    // pendingLoadPartsの変更を監視する別のuseEffect
    useEffect(() => {
        if (pendingLoadParts && pendingLoadParts.length > 0) {
            console.log('[useEffect] localStorage復元パーツが設定されました:', pendingLoadParts.length, '個');
        }
    }, [pendingLoadParts]);

    // 削除処理
    const handleDeleteBuild = (name) => {
        const builds = savedBuilds.filter(b => b.name !== name);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(builds));
        setSavedBuilds(builds);
        console.log('[handleDeleteBuild] 削除後:', builds);
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
                                {/* <button onClick={handleShowSaveLoadModal} className="w-16 h-14 flex items-center justify-center bg-gray-800 hover:bg-gray-600 shadow transition" style={{ zIndex: 2, borderRadius: 0 }} title="セーブ/ロード">
                                    {SaveLoadIcon}
                                </button> */}
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
                                expansionOptions={expansionOptions}
                                expansionDescriptions={expansionDescriptions}
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
                        {/* セーブフォーム */}
                        <div style={{
                            marginBottom: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            width: '100%',
                        }}>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    value={saveName}
                                    onChange={e => {
                                        setSaveName(e.target.value);
                                        setSaveError('');
                                    }}
                                    maxLength={20}
                                    placeholder="ビルド名（20文字以内）"
                                    style={{
                                        padding: '4px 8px',
                                        fontSize: '1em',
                                        borderRadius: 4,
                                        border: '1px solid #888',
                                        width: '100%',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 90 }}>
                                <button
                                    onClick={() => {
                                        console.log('[セーブボタン] クリック時 selectedParts:', selectedParts);
                                        handleSaveBuild();
                                    }}
                                    disabled={!selectedMs || !saveName || saveName.length > 20 || savedBuilds.length >= MAX_SAVED_BUILDS}
                                    className="hex-badge"
                                    style={{ height: 32, minWidth: 64, marginBottom: 2 }}
                                >
                                    セーブ
                                </button>
                                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95em' }}>
                                    {savedBuilds.length}/{MAX_SAVED_BUILDS}
                                </span>
                            </div>
                            {saveError && <span style={{ color: 'red', marginLeft: 8 }}>{saveError}</span>}
                        </div>
                        {/* ロード一覧 */}
                        <div>
                            {savedBuilds.map((build, idx) => (
                                <div key={idx} className="flex items-center mb-2" style={{
                                    background: '#222',
                                    borderRadius: 8,
                                    padding: 4,
                                    minHeight: 48,
                                    alignItems: 'center',
                                }}>
                                    {/* MS画像 */}
                                    <img src={getMsImageSrc(build.msName)} alt={build.msName} style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 6,
                                        marginRight: 8,
                                        background: '#333',
                                        objectFit: 'cover',
                                    }} />
                                    {/* MS名・ビルド名 */}
                                    <div style={{
                                        minWidth: 100,
                                        maxWidth: 120,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: '#fff',
                                            fontSize: '1.1em',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>{build.name}</span>
                                        <span style={{
                                            color: '#aaa',
                                            fontSize: '0.95em',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>{build.msName}</span>
                                    </div>
                                    {/* パーツ画像群 */}
                                    <div className="flex gap-1" style={{
                                        flexWrap: 'wrap',
                                        minWidth: 160,
                                        marginLeft: 8,
                                    }}>
                                        {build.parts && build.parts.map((partName, i) => (
                                            <RenderPartImage key={i} partName={partName} />
                                        ))}
                                    </div>
                                    {/* 呼び出し・削除ボタン（縦並び中央） */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginLeft: 12,
                                    }}>
                                        <button onClick={() => handleLoadBuild(build)} className="hex-badge" style={{ marginBottom: 4, minWidth: 56, height: 28 }}>呼出</button>
                                        <button onClick={() => handleDeleteBuild(build.name)} className="hex-badge" style={{ minWidth: 56, height: 28, background: '#a00', color: '#fff' }}>削除</button>
                                    </div>
                                </div>
                            ))}
                            {savedBuilds.length === 0 && <div style={{ color: '#fff' }}>保存データなし</div>}
                        </div>
                    </div>
                }
                onOk={() => setShowSaveLoadModal(false)}
                okButtonText="閉じる"
            />
        </div>
    );
});

export default PickedMs;