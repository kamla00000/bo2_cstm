import React, { useState } from 'react';
import InfoModal from './InfoModal';
import { MAX_SAVED_BUILDS_PER_MS } from '../utils/buildStorage';

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

    // サイズに応じたLVテキストのサイズ調整
    const lvFontSize = size <= 48 ? '0.7em' : size <= 56 ? '0.8em' : '0.9em';
    const lvPadding = size <= 48 ? '1px 2px' : size <= 56 ? '1px 3px' : '2px 4px';

    return (
        <div style={{ position: 'relative', display: 'inline-block', width: size, height: size, marginRight: 2 }}>
            <img
                src={imgSrc}
                alt={partName}
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



// セーブ/ロードモーダルコンポーネント
const SaveLoadModal = ({
    open,
    selectedMs,
    savedBuilds,
    saveError,
    onClose,
    onSave,
    onLoad,
    onDelete
}) => {
    const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', data: null });
    const [alertDialog, setAlertDialog] = useState({ open: false, message: '' });

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
        } else if (confirmDialog.type === 'save') {
            onSave && onSave();
        }
        setConfirmDialog({ open: false, type: '', data: null });
    };

    const handleCancel = () => {
        setConfirmDialog({ open: false, type: '', data: null });
    };

    const handleAlertClose = () => {
        setAlertDialog({ open: false, message: '' });
    };

    // レスポンシブ対応の判定
    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth <= 768 && window.innerWidth > 480;

    return (
        <>
        <InfoModal
            open={open}
            title={null}
            message={
                <div>
                    {/* ビルド一覧 */}
                    <div style={{ marginBottom: 16, maxHeight: '400px', overflowY: 'auto' }}>
                        {savedBuilds.map((build, idx) => {
                            // レスポンシブ対応: 画面サイズに応じてレイアウトを変更
                            const isMobile = window.innerWidth <= 480;
                            const isTablet = window.innerWidth <= 768 && window.innerWidth > 480;
                            
                            return (
                            <div key={idx} style={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: isMobile ? 'stretch' : 'center',
                                marginBottom: 8,
                                background: '#222',
                                borderRadius: 8,
                                padding: isMobile ? 8 : 12,
                                minHeight: isMobile ? 'auto' : 90,
                            }}>
                                {/* パーツ画像群（レスポンシブ対応） */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? 'repeat(4, 48px)' : isTablet ? 'repeat(4, 56px)' : 'repeat(4, 64px)',
                                    gridTemplateRows: isMobile ? 'repeat(2, 48px)' : isTablet ? 'repeat(2, 56px)' : 'repeat(2, 64px)',
                                    gap: isMobile ? 3 : 4,
                                    marginRight: isMobile ? 0 : 16,
                                    marginBottom: isMobile ? 12 : 0,
                                    minWidth: isMobile ? 'auto' : isTablet ? 240 : 272,
                                    justifySelf: isMobile ? 'center' : 'start',
                                }}>
                                    {Array.from({ length: 8 }).map((_, i) => {
                                        const partName = build.parts && build.parts[i];
                                        const imageSize = isMobile ? 48 : isTablet ? 56 : 64;
                                        
                                        return partName ? (
                                            <RenderPartImage key={i} partName={partName} size={imageSize} />
                                        ) : (
                                            <div key={i} style={{
                                                width: imageSize,
                                                height: imageSize,
                                                background: '#444',
                                                borderRadius: 4,
                                            }} />
                                        );
                                    })}
                                </div>
                                
                                {/* 呼出・削除ボタン（レスポンシブ対応） */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: isMobile ? 'row' : 'column',
                                    gap: isMobile ? 8 : 6,
                                    marginLeft: isMobile ? 0 : 'auto',
                                    justifyContent: isMobile ? 'center' : 'flex-start',
                                    width: isMobile ? '100%' : 'auto',
                                }}>
                                    <HoverButton 
                                        onClick={() => onLoad && onLoad(build)}
                                        buttonType="normal"
                                        style={{
                                            minWidth: isMobile ? 80 : 60,
                                            height: isMobile ? 32 : 28,
                                            fontSize: isMobile ? '1em' : '0.9em',
                                            flex: isMobile ? 1 : 'none',
                                        }}
                                    >
                                        呼出
                                    </HoverButton>
                                    <HoverButton 
                                        onClick={() => handleDeleteClick(idx)}
                                        buttonType="delete"
                                        style={{
                                            minWidth: isMobile ? 80 : 60,
                                            height: isMobile ? 32 : 28,
                                            fontSize: isMobile ? '1em' : '0.9em',
                                            flex: isMobile ? 1 : 'none',
                                        }}
                                    >
                                        削除
                                    </HoverButton>
                                </div>
                            </div>
                            );
                        })}
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
                    
                    {/* 下部ボタン（レスポンシブ対応） */}
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'center',
                        gap: isMobile ? 8 : 16,
                        paddingTop: 12,
                        borderTop: '1px solid #444'
                    }}>
                        <HoverButton
                            onClick={onClose}
                            buttonType="normal"
                            style={{ 
                                minWidth: isMobile ? '100%' : 80, 
                                height: isMobile ? 40 : 36,
                                fontSize: isMobile ? '1.1em' : '1em'
                            }}
                        >
                            閉じる
                        </HoverButton>
                        <HoverButton
                            onClick={handleSaveClick}
                            disabled={!selectedMs}
                            buttonType={savedBuilds.length >= MAX_SAVED_BUILDS_PER_MS ? "disabled" : "normal"}
                            style={{ 
                                minWidth: isMobile ? '100%' : 80, 
                                height: isMobile ? 40 : 36,
                                fontSize: isMobile ? '1.1em' : '1em'
                            }}
                        >
                            保存
                        </HoverButton>
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
            onOk={undefined}
            okButtonText=""
        />

        <ConfirmDialog
            open={confirmDialog.open}
            title={confirmDialog.type === 'delete' ? '削除確認' : '保存確認'}
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