import React, { useState, useEffect, useMemo } from 'react';
import InfoModal from './InfoModal';
import { MAX_SAVED_BUILDS_PER_MS } from '../utils/buildStorage';
import { calculateMSStatsLogic } from '../utils/calculateStats';
import { EXPANSION_DESCRIPTIONS } from '../constants/appConstants';
import styles from './SaveLoadModal.module.css';

// ホバーエフェクト付きボタンコンポーネント
const HoverButton = ({ 
    onClick, 
    disabled = false, 
    children, 
    style = {}, 
    className = "hex-badge",
    buttonType = 'normal' // 'normal', 'delete', 'disabled'
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // ボタンタイプに応じた色設定
    const getButtonColors = () => {
        if (disabled) {
            return {
                normal: '#666',
                hover: '#666'
            };
        }
        
        switch (buttonType) {
            case 'delete':
                return {
                    normal: '#a00',
                    hover: '#c00'
                };
            case 'disabled':
                return {
                    normal: '#a00', // 10/10時の保存ボタン
                    hover: '#c00'
                };
            default:
                return {
                    normal: '#b85c00', // オレンジ
                    hover: '#d46e00'   // 明るいオレンジ
                };
        }
    };

    const colors = getButtonColors();
    
    const baseStyle = {
        minWidth: 60,
        height: 28,
        fontSize: '0.9em',
        transition: 'background-color 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        background: colors.normal,
        color: '#fff',
        display: 'flex',
        alignItems: 'center', // 上下中央配置
        justifyContent: 'center',
        ...style
    };

    const hoverStyle = disabled ? {} : {
        background: colors.hover
    };

    return (
        <button
            className={className}
            style={{ ...baseStyle, ...(isHovered ? hoverStyle : {}) }}
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
        </button>
    );
};

// 確認ダイアログコンポーネント
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, confirmText = "はい", cancelText = "いいえ" }) => {
    if (!open) return null;

    return (
        <InfoModal
            open={open}
            title={title}
            message={
                <div style={{ textAlign: 'center', color: '#fff', fontSize: '1em' }}>
                    {message}
                </div>
            }
            onOk={onConfirm}
            onCancel={onCancel}
            okButtonText={confirmText}
            cancelButtonText={cancelText}
        />
    );
};

// パーツ画像表示（LVレイヤー付き）コンポーネント
const RenderPartImage = ({ partName, size = 64 }) => {
    // パーツ名を文字列として正規化
    const partNameStr = typeof partName === 'string' ? partName : (partName?.name || partName?.パーツ名 || String(partName));
    
    const lvMatch = partNameStr.match(/_LV(\d+)/i);
    const baseName = partNameStr.replace(/_LV\d+$/, '');
    const lv = lvMatch ? lvMatch[1] : '';
    const lvImgSrc = `/images/parts/${partNameStr}.webp`;
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

    // サイズに応じたLVテキストのサイズ調整
    const lvFontSize = size <= 48 ? '0.7em' : size <= 56 ? '0.8em' : '0.9em';
    const lvPadding = size <= 48 ? '1px 2px' : size <= 56 ? '1px 3px' : '2px 4px';

    return (
        <div style={{ position: 'relative', display: 'inline-block', width: size, height: size, marginRight: 2 }}>
            <img
                src={imgSrc}
                alt={partNameStr}
                style={{
                    width: size,
                    height: size,
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
                    fontSize: lvFontSize,
                    padding: lvPadding,
                    borderRadius: '0 0 4px 0',
                    pointerEvents: 'none',
                }}>
                    LV{lv}
                </div>
            )}
        </div>
    );
};



// ビルドのステータス計算関数
const calculateBuildStats = (build, msDataArray, partsData, fullStrengtheningData) => {
    if (!build || !msDataArray || !partsData) {
        return {
            hp: 0,
            shootCorrection: 0,
            meleeCorrection: 0,
            armorRange: 0,
            armorBeam: 0,
            armorMelee: 0
        };
    }

    try {
        // ビルドのMSを検索
        const ms = msDataArray.find(m => m["MS名"] === build.msName);
        if (!ms) {
            console.warn('MS not found:', build.msName);
            return {
                hp: 0,
                shootCorrection: 0,
                meleeCorrection: 0,
                armorRange: 0,
                armorBeam: 0,
                armorMelee: 0
            };
        }

        const parts = build.parts || [];
        const isFullStrengthened = build.isFullStrengthened || false;
        const expansionType = build.expansionType || '拡張スキル無し';
        
        // パーツ名からパーツオブジェクトを取得
        const partObjects = parts.map(partName => {
            if (!partName) return null;
            
            // パーツ名を文字列として正規化
            const partNameStr = typeof partName === 'string' ? partName : (partName?.name || partName?.パーツ名 || String(partName));
            
            // パーツデータから該当するパーツを検索
            for (const category of Object.values(partsData)) {
                if (Array.isArray(category)) {
                    const found = category.find(part => part && part.name === partNameStr);
                    if (found) return found;
                }
            }
            console.warn(`Part not found in partsData: ${partNameStr}`);
            return null;
        }).filter(Boolean);

        console.log(`[calculateBuildStats] MS: ${ms["MS名"]}, Parts: ${parts.length}, PartObjects: ${partObjects.length}`);
        
        const stats = calculateMSStatsLogic(
            ms,
            partObjects,
            isFullStrengthened,
            expansionType,
            partsData,
            fullStrengtheningData || undefined
        );

        console.log(`[calculateBuildStats] Calculated stats:`, stats);
        
        return {
            hp: stats.total?.hp || stats.hp || 0,
            shootCorrection: stats.total?.shoot || stats.shootCorrection || stats.射撃補正 || 0,
            meleeCorrection: stats.total?.meleeCorrection || stats.meleeCorrection || stats.格闘補正 || 0,
            armorRange: stats.total?.armorRange || stats.armorRange || stats.耐実弾装甲 || 0,
            armorBeam: stats.total?.armorBeam || stats.armorBeam || stats.耐ビーム装甲 || 0,
            armorMelee: stats.total?.armorMelee || stats.armorMelee || stats.耐格闘装甲 || 0
        };
    } catch (error) {
        console.error('ビルドステータス計算エラー:', error);
        return {
            hp: 0,
            shootCorrection: 0,
            meleeCorrection: 0,
            armorRange: 0,
            armorBeam: 0,
            armorMelee: 0
        };
    }
};

// セーブ/ロードモーダルコンポーネント
const SaveLoadModal = ({
    open,
    selectedMs,
    savedBuilds,
    saveError,
    onClose,
    onSave,
    onSaveComplete,
    onLoad,
    onDelete,
    msData,
    partsData,
    fullStrengtheningData,
    currentParts,
    isCurrentFullStrengthened,
    currentExpansionType
}) => {
    const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', data: null });
    const [alertDialog, setAlertDialog] = useState({ open: false, message: '' });
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [forceUpdate, setForceUpdate] = useState(0);

    // リサイズイベントのハンドリング
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // savedBuildsが変更された時に強制再レンダリング
    useEffect(() => {
        console.log('[SaveLoadModal] savedBuilds updated:', savedBuilds);
        setForceUpdate(prev => prev + 1);
    }, [savedBuilds]);

    // currentPartsが変更された時にスロット使用量を再計算
    useEffect(() => {
        console.log('[SaveLoadModal] currentParts or partsData updated');
        setForceUpdate(prev => prev + 1);
    }, [currentParts, partsData]);

    // 現在のセーブスロット使用量を計算（メモ化）
    const getCurrentSlotUsage = useMemo(() => {
        console.log('[getCurrentSlotUsage] DEBUG - savedBuilds:', savedBuilds);
        console.log('[getCurrentSlotUsage] DEBUG - savedBuilds.length:', savedBuilds?.length);
        console.log('[getCurrentSlotUsage] DEBUG - MAX_SAVED_BUILDS_PER_MS:', MAX_SAVED_BUILDS_PER_MS);
        
        // セーブスロットの使用状況を返す
        const usedSlots = savedBuilds ? savedBuilds.length : 0;
        const totalSlots = MAX_SAVED_BUILDS_PER_MS;
        
        console.log(`[getCurrentSlotUsage] Save slot usage: ${usedSlots}/${totalSlots}`);
        return { used: usedSlots, total: totalSlots };
    }, [savedBuilds, forceUpdate]); // savedBuildsの変更に応じて更新

    if (!open) return null;

    // 削除確認
    const handleDeleteClick = (index) => {
        setConfirmDialog({
            open: true,
            type: 'delete',
            data: index
        });
    };

    // 保存確認
    const handleSaveClick = () => {
        if (savedBuilds.length >= MAX_SAVED_BUILDS_PER_MS) {
            setAlertDialog({
                open: true,
                message: 'セーブスロットの空き容量がありません。'
            });
            return;
        }
        
        setConfirmDialog({
            open: true,
            type: 'save',
            data: null
        });
    };

    // 確認ダイアログの処理
    const handleConfirm = () => {
        if (confirmDialog.type === 'delete') {
            onDelete && onDelete(confirmDialog.data);
            // 削除後にリアルタイム更新
            setForceUpdate(prev => prev + 1);
            if (selectedMs && onSaveComplete) {
                setTimeout(() => {
                    onSaveComplete();
                    setForceUpdate(prev => prev + 1);
                }, 100);
            }
        } else if (confirmDialog.type === 'save') {
            const success = onSave && onSave();
            if (success) {
                // 保存成功後にリアルタイム更新
                setForceUpdate(prev => prev + 1);
                if (onSaveComplete) {
                    setTimeout(() => {
                        onSaveComplete();
                        setForceUpdate(prev => prev + 1);
                    }, 100);
                }
            }
            // 保存実行後にモーダルを強制的に閉じる
            onClose && onClose();
        }
        setConfirmDialog({ open: false, type: '', data: null });
    };

    const handleCancel = () => {
        setConfirmDialog({ open: false, type: '', data: null });
    };

    const handleAlertClose = () => {
        setAlertDialog({ open: false, message: '' });
    };

    // レスポンシブ対応の判定（タブレット判定のみ残す）
    const isTablet = windowWidth <= 768;

    // 現在のビルドデータを作成
    const getCurrentBuild = () => {
        if (!selectedMs || !currentParts) return null;
        
        // currentPartsがオブジェクトの配列の場合、パーツ名を抽出
        const partNames = currentParts.map(part => {
            if (!part) return null;
            if (typeof part === 'string') return part;
            return part.name || part.パーツ名 || null;
        }).filter(Boolean);
        
        return {
            msName: selectedMs["MS名"],
            parts: partNames,
            isFullStrengthened: isCurrentFullStrengthened || false,
            expansionType: currentExpansionType || '拡張スキル無し'
        };
    };

    // 現在のビルドを表示するコンポーネント
    const renderCurrentBuildPreview = () => {
        const build = getCurrentBuild();
        if (!build) return null;

        try {
            const stats = calculateBuildStats(build, msData, partsData, fullStrengtheningData);

            return (
                <div className={styles.preview}>

                    {/* パーツ画像群 */}
                    <div className={styles.partsGrid}>
                        {Array.from({ length: 8 }).map((_, i) => {
                            const partName = build.parts && build.parts[i];
                            const imageSize = 64;
                            
                            return partName ? (
                                <div key={i} style={{ position: 'relative' }}>
                                    <RenderPartImage partName={partName} size={imageSize} />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        borderRadius: 4,
                                        boxShadow: 'inset 0 0 8px rgba(255, 145, 0, 0.3)',
                                        pointerEvents: 'none',
                                    }} />
                                </div>
                            ) : (
                                <div key={i} style={{
                                    width: imageSize,
                                    height: imageSize,
                                    background: 'rgba(68, 68, 68, 0.5)',
                                    borderRadius: 4,
                                    border: '1px dashed #666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                }}>
                                    +
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* ステータス表示 */}
                    <div className={styles.statusArea}>
                        <div className={styles.statusGrid}>
                            <div>HP：{Math.round(stats.hp).toLocaleString()}</div>
                            <div>耐実弾補正：{Math.round(stats.armorRange).toLocaleString()}</div>
                            <div>射撃補正：{Math.round(stats.shootCorrection).toLocaleString()}</div>
                            <div>耐ビーム補正：{Math.round(stats.armorBeam).toLocaleString()}</div>
                            <div>格闘補正：{Math.round(stats.meleeCorrection).toLocaleString()}</div>
                            <div>耐格闘補正：{Math.round(stats.armorMelee).toLocaleString()}</div>
                            <div>強化：{build.isFullStrengthened ? '完' : '零'}</div>
                            <div>{EXPANSION_DESCRIPTIONS[build.expansionType] || EXPANSION_DESCRIPTIONS['無し']}</div>
                        </div>
                        
                        {/* 保存ボタン（右詰） */}
                        <div className={styles.saveButtonArea}>
                            <HoverButton
                                onClick={handleSaveClick}
                                disabled={!selectedMs || savedBuilds.length >= MAX_SAVED_BUILDS_PER_MS}
                                buttonType={savedBuilds.length >= MAX_SAVED_BUILDS_PER_MS ? "disabled" : "normal"}
                                style={{
                                    minWidth: 60,
                                    height: 28,
                                    fontSize: '0.9em',
                                }}
                            >
                                保存
                            </HoverButton>
                        </div>
                    </div>
                </div>
            );
        } catch (error) {
            console.error('[SaveLoadModal] renderCurrentBuildPreview error:', error);
            return null;
        }
    };

    return (
        <>

        
        {/* 黒いオーバーレイに直接表示 */}
        {open && (
            <div className={styles.overlay}>
                <div className={styles.container}>
                    {/* ヘッダー */}
                    <div className={styles.header}>
                        <div className={styles.headerTitle}>
                            <h2 className={styles.title}>
                                ビルド一覧
                            </h2>
                            <span className={getCurrentSlotUsage.used >= getCurrentSlotUsage.total ? styles.slotUsageFull : styles.slotUsage}>
                                {getCurrentSlotUsage.used}/{getCurrentSlotUsage.total}
                            </span>
                        </div>
                        <button 
                            onClick={onClose}
                            className={styles.closeButton}
                        >
                            ×
                        </button>
                    </div>

                    {/* ビルド一覧 */}
                    <div className={styles.content}>
                        {/* 現在のビルドプレビュー（常時表示） */}
                        <div className={styles.previewWrapper}>
                            {renderCurrentBuildPreview()}
                        </div>
                        
                        {savedBuilds.map((build, idx) => {
                            // ビルドのステータス計算
                            const stats = calculateBuildStats(build, msData, partsData, fullStrengtheningData);
                            console.log(`[SaveLoadModal] Build ${idx} stats:`, stats);
                            
                            return (
                            <div key={`${idx}-wrapper`} className={styles.buildWrapper}>
                                <div key={`${idx}-${forceUpdate}`} className={styles.build}>
                                {/* パーツ画像群 */}
                                <div className={styles.partsGrid}>
                                    {Array.from({ length: 8 }).map((_, i) => {
                                        const partName = build.parts && build.parts[i];
                                        const imageSize = 64;
                                        
                                        return partName ? (
                                            <RenderPartImage key={i} partName={partName} size={imageSize} />
                                        ) : (
                                            <div key={i} style={{
                                                width: imageSize,
                                                height: imageSize,
                                                background: 'rgba(68, 68, 68, 0.5)',
                                                borderRadius: 4,
                                                border: '1px dashed #666',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontSize: '24px',
                                                fontWeight: 'bold',
                                            }}>
                                                +
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* ステータス表示とボタンの右側エリア */}
                                <div className={styles.statusArea}>
                                    {/* ステータス情報 */}
                                    <div className={styles.statusGrid}>
                                        <div style={{ color: '#fff' }}>HP：{Math.round(stats.hp).toLocaleString()}</div>
                                        <div style={{ color: '#fff' }}>耐実弾補正：{Math.round(stats.armorRange).toLocaleString()}</div>
                                        <div style={{ color: '#fff' }}>射撃補正：{Math.round(stats.shootCorrection).toLocaleString()}</div>
                                        <div style={{ color: '#fff' }}>耐ビーム補正：{Math.round(stats.armorBeam).toLocaleString()}</div>
                                        <div style={{ color: '#fff' }}>格闘補正：{Math.round(stats.meleeCorrection).toLocaleString()}</div>
                                        <div style={{ color: '#fff' }}>耐格闘補正：{Math.round(stats.armorMelee).toLocaleString()}</div>
                                        <div style={{ color: '#fff' }}>強化：{build.isFullStrengthened ? '完' : '零'}</div>
                                        <div style={{ color: '#fff' }}>{EXPANSION_DESCRIPTIONS[build.expansionType] || EXPANSION_DESCRIPTIONS['無し']}</div>
                                    </div>
                                    
                                    {/* 呼出・削除ボタン（下揃え） */}
                                    <div className={styles.buttonArea}>
                                        <HoverButton 
                                            onClick={() => onLoad && onLoad(build)}
                                            buttonType="normal"
                                            style={{
                                                minWidth: 60,
                                                height: 28,
                                                fontSize: '0.9em',
                                            }}
                                        >
                                            呼出
                                        </HoverButton>
                                        <HoverButton 
                                            onClick={() => handleDeleteClick(idx)}
                                            buttonType="delete"
                                            style={{
                                                minWidth: 60,
                                                height: 28,
                                                fontSize: '0.9em',
                                            }}
                                        >
                                            削除
                                        </HoverButton>
                                    </div>
                                </div>
                                </div>
                            </div>
                            );
                        })}
                        
                        {savedBuilds.length === 0 && (
                            <div className={styles.empty}>
                                <span>セーブデータなし</span>
                            </div>
                        )}
                    </div>
                    
                    {/* 下部ボタン */}
                    <div className={styles.buttons}>
                        <HoverButton
                            onClick={onClose}
                            buttonType="normal"
                            style={{ 
                                minWidth: 100,
                                height: 40,
                                fontSize: '1em',
                                padding: '0 16px'
                            }}
                        >
                            キャンセル
                        </HoverButton>
                        <HoverButton
                            onClick={handleSaveClick}
                            disabled={!selectedMs}
                            buttonType={savedBuilds.length >= MAX_SAVED_BUILDS_PER_MS ? "disabled" : "normal"}
                            style={{ 
                                minWidth: 100,
                                height: 40,
                                fontSize: '1em',
                                padding: '0 16px'
                            }}
                        >
                            保存
                        </HoverButton>
                    </div>
                    
                    {/* エラー表示 */}
                    {saveError && (
                        <div className={styles.errorMessage}>
                            {saveError}
                        </div>
                    )}
                </div>
            </div>
        )}

        <ConfirmDialog
            open={confirmDialog.open}
            title={confirmDialog.type === 'delete' ? '削　除　確　認' : '保　存　確　認'}
            message={
                confirmDialog.type === 'delete' 
                    ? 'このビルドデータを削除しますか？'
                    : '現在のビルドを保存しますか？'
            }
            confirmText={confirmDialog.type === 'delete' ? '削除' : '保存'}
            cancelText={confirmDialog.type === 'delete' ? 'キャンセル' : 'キャンセル'}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />

        <InfoModal
            open={alertDialog.open}
            title="保存エラー"
            message={
                <div style={{ textAlign: 'center', color: '#ff6b6b', fontSize: '1em' }}>
                    {alertDialog.message}
                </div>
            }
            onOk={handleAlertClose}
            okButtonText="OK"
        />
        </>
    );
};

export default SaveLoadModal;