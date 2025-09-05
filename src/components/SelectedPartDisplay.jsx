import { useRemoveFlick } from '../hooks/useRemoveFlick';
import { useGlobalRemoveFlick } from '../hooks/useGlobalRemoveFlick';
import React from 'react';
import ImageWithFallback from './ImageWithFallback';
import styles from './PickedMs.module.css';

const SelectedPartDisplay = ({ parts, onRemove, onClearAllParts, onHoverPart, onLeavePart }) => {
    // 解除用フリックstate
    const [removePreviewPart, setRemovePreviewPart] = React.useState(null);
    
    // 装備解除レイヤー表示用state（タップ・クリック時に表示）
    const [removeLayerPart, setRemoveLayerPart] = React.useState(null);
    
    // タイマーID管理用ref
    const layerDisplayTimerRef = React.useRef(null);

    // 右フリックで解除
    useRemoveFlick(
        (partName) => {
            const part = parts.find(p => p.name === partName);
            if (part) {
                onRemove(part);
            }
        },
        removePreviewPart
    );

    // 全装着済みパーツで「タップせずにフリック」解除を許可
    useGlobalRemoveFlick(
        (partName) => {
            const part = parts.find(p => p.name === partName);
            if (part) {
                // フリック解除の場合、遅延レイヤー表示をキャンセル
                if (layerDisplayTimerRef.current) {
                    clearTimeout(layerDisplayTimerRef.current);
                    layerDisplayTimerRef.current = null;
                }
                setRemovePreviewPart(null);
                onRemove(part);
                setRemoveLayerPart(null); // フリック解除時は装備解除レイヤーもリセット
            }
        },
        parts ? parts.map(p => p.name) : []
    );

    // 装備可能パーツリストからプレビュー状態を取得し、装備解除レイヤーをクリア
    React.useEffect(() => {
        if (typeof window !== 'undefined' && window.globalPreviewPart) {
            setRemoveLayerPart(null);
        }
    }, []);

    // コンポーネントアンマウント時のクリーンアップ
    React.useEffect(() => {
        return () => {
            if (layerDisplayTimerRef.current) {
                clearTimeout(layerDisplayTimerRef.current);
                layerDisplayTimerRef.current = null;
            }
        };
    }, []);

    // グローバルpreviewPart変更を監視して装備解除レイヤーをクリア
    React.useEffect(() => {
        const handlePreviewChange = () => {
            if (typeof window !== 'undefined' && window.globalPreviewPart) {
                setRemoveLayerPart(null);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('previewPartChanged', handlePreviewChange);
            return () => window.removeEventListener('previewPartChanged', handlePreviewChange);
        }
    }, []);

    // パーツ装備の変更を監視して装備解除レイヤーをクリア
    const prevPartsRef = React.useRef(parts);
    React.useEffect(() => {
        // 初回レンダリングは除外
        if (prevPartsRef.current === parts) {
            prevPartsRef.current = parts;
            return;
        }
        
        // パーツが変更された場合、装備解除レイヤーを非表示にする
        if (removeLayerPart !== null) {
            setRemoveLayerPart(null);
        }
        // タイマーもクリア
        if (layerDisplayTimerRef.current) {
            clearTimeout(layerDisplayTimerRef.current);
            layerDisplayTimerRef.current = null;
        }
        setRemovePreviewPart(null);
        
        // 前回の参照を更新
        prevPartsRef.current = parts;
    }, [parts, removeLayerPart]); // partsとremoveLayerPartが変更されるたびに実行

    // 装備解除レイヤー状態をグローバルに共有
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            window.globalRemoveLayerPart = removeLayerPart;
            // 装備解除レイヤーがアクティブになったらイベント発火
            if (removeLayerPart) {
                window.dispatchEvent(new CustomEvent('removeLayerChanged'));
            }
        }
    }, [removeLayerPart]);
    const maxParts = 8;
    const allSlots = [...parts];

    for (let i = allSlots.length; i < maxParts; i++) {
        allSlots.push(null);
    }

    const renderSlot = (part, index) => {
        const levelMatch = part ? part.name.match(/_LV(\d+)$/) : null;
        const levelDisplay = levelMatch ? `LV${levelMatch[1]}` : '';

        return (
            <div
                key={part ? part.name : `empty-${index}`}
                className={
                    `${styles.partSlot} ${styles.partSquare} w-16 h-16 bg-gray-900 overflow-hidden relative flex-shrink-0 ` +
                    (part
                        ? 'border border-orange-400 cursor-pointer'
                        : 'border border-gray-600 flex items-center justify-center text-gray-600')
                }
                data-selected-part-name={part ? part.name : undefined}
                onClick={(e) => {
                    if (part) {
                        if (window.innerWidth <= 1024) {
                            // モバイル：タップで解除レイヤー表示、フリックで解除
                            // onTouchStartで既に設定済み
                        } else {
                            // デスクトップ：クリックで直接解除（レイヤー表示なし）
                            onRemove(part);
                        }
                    }
                }}
                title={part ? `「${part.name}」を外す` : '空きスロット'}
                onMouseEnter={() => {
                    if (onHoverPart) {
                        onHoverPart(part, 'selectedParts');
                    }
                    // デスクトップでホバー時に解除レイヤーを表示
                    if (window.innerWidth > 1024 && part) {
                        setRemoveLayerPart(part.name);
                    }
                }}
                onMouseLeave={() => {
                    if (onLeavePart) {
                        onLeavePart(null, null);
                    }
                    // デスクトップでマウス離脱時に解除レイヤーをクリア
                    if (window.innerWidth > 1024) {
                        setRemoveLayerPart(null);
                    }
                }}
                onTouchStart={(e) => {
                    // タッチ開始時の処理（モバイルのみ）
                    if (window.innerWidth <= 1024 && part) {
                        // 既存のタイマーがあればクリア
                        if (layerDisplayTimerRef.current) {
                            clearTimeout(layerDisplayTimerRef.current);
                        }
                        
                        // フリック用の情報を保存
                        setRemovePreviewPart(part.name);
                        
                        // 解除レイヤー表示は遅延実行（フリックされた場合はキャンセル）
                        const currentPartName = part.name;
                        layerDisplayTimerRef.current = setTimeout(() => {
                            // タイマーがクリアされていない場合のみレイヤーを表示
                            setRemoveLayerPart(currentPartName);
                            layerDisplayTimerRef.current = null;
                        }, 150); // 150ms後に表示（フリックには十分な時間）
                    }
                }}
                style={{ userSelect: 'none' }}
            >
                {part ? (
                    <>
                        <ImageWithFallback
                            partName={part.name}
                            className="w-full h-full object-cover"
                        />
                        {levelDisplay && (
                            <div className="absolute bottom-0 right-0 bg-gray-700 bg-opacity-60 text-gray-200 text-xs py-0.5 whitespace-nowrap overflow-hidden text-ellipsis text-right px-1"
                                style={{ width: 'fit-content' }}
                            >
                                {levelDisplay}
                            </div>
                        )}
                        {/* 装備解除レイヤー（タップ・クリック時に表示） */}
                        {removeLayerPart === part.name && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-60 text-gray-200 text-base z-30 pointer-events-none">
                                <span className="[text-shadow:1px_1px_2px_black] flex flex-col items-center justify-center leading-tight space-y-1">
                                    <span>装 備</span>
                                    <span>解 除</span>
                                </span>
                            </div>
                        )}
                    </>
                ) : (
                    <span className="text-2xl">+</span>
                )}
            </div>
        );
    };

    return (
        <div className={`${styles.selectedPartsCard} pickedms-card p-3 flex flex-row relative`}>
            {/* パーツ表示エリア */}
            <div className={styles.partListArea}>
                <div className={styles.partRow}>
                    {allSlots.map((part, index) => renderSlot(part, index))}
                </div>
            </div>
            {/* シンプルな全解除ボタン */}
            <div className={styles.clearAllButton}>
                <button
                    onClick={onClearAllParts}
                    className="relative h-32 w-16 p-0 border-none text-gray-200 text-4xl flex flex-col items-center justify-center group"
                    title="全てのカスタムパーツを解除"
                    style={{ background: 'none' }}
                >
                    <svg
                        className="absolute inset-0"
                        width="100%" height="100%" viewBox="0 0 120 40"
                        style={{ zIndex: 0, pointerEvents: 'none' }}
                        aria-hidden="true"
                        preserveAspectRatio="none"
                    >
                        {/* 通常時の背景色（長方形） */}
                        <rect
                            x="0" y="0" width="120" height="40"
                            fill="#374151"
                            className="transition-colors duration-200"
                        />
                        {/* ホバー時の背景色（長方形） */}
                        <rect
                            x="0" y="0" width="120" height="40"
                            fill="#e53935"
                            opacity="0"
                            className="group-hover:opacity-100 transition-opacity duration-200"
                        />
                        {/* 外枠（長方形） */}
                        <rect
                            // x="0" y="0" width="120" height="40"
                            // fill="none"
                            // stroke="#ff9100"
                            // strokeWidth="4"
                            // vectorEffect="non-scaling-stroke"
                            // className="transition-colors duration-200 group-hover:stroke-yellow-400"
                        />
                    </svg>
                    {/* ボタン文字 */}
                    <span className="relative z-10">全</span>
                    <span className="relative z-10">解</span>
                    <span className="relative z-10">除</span>
                </button>
            </div>
        </div>
    );
};

export default SelectedPartDisplay;