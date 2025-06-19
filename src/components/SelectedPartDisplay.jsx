// src/components/SelectedPartDisplay.jsx
import React from 'react';
import ImageWithFallback from './ImageWithFallback';

const SelectedPartDisplay = ({ parts, onRemove, onClearAllParts, onHoverPart, onLeavePart }) => {
    const maxParts = 8;
    const allSlots = [...parts]; // 装着済みパーツをコピー

    // 空きスロットを追加して合計8つにする
    for (let i = allSlots.length; i < maxParts; i++) {
        allSlots.push(null); // null を空きスロットとして追加
    }

    // 各スロットをレンダリングするヘルパー関数
    const renderSlot = (part, index) => {
        const levelMatch = part ? part.name.match(/_LV(\d+)$/) : null;
        const levelDisplay = levelMatch ? `LV${levelMatch[1]}` : '';

        return (
            <div
                key={part ? part.name : `empty-${index}`} // partがあればpart.name、なければempty-index
                className={`w-16 h-16 bg-gray-900 rounded overflow-hidden relative flex-shrink-0
                            ${part ? 'border border-blue-500 cursor-pointer' : 'border border-gray-600 flex items-center justify-center text-gray-600'}`}
                onClick={() => part && onRemove(part)} // partがある場合のみクリック可能
                title={part ? `「${part.name}」を外す` : '空きスロット'}
                onMouseEnter={() => {
                    if (onHoverPart) {
                        onHoverPart(part, 'selectedParts');
                    }
                }}
                onMouseLeave={() => {
                    if (onLeavePart) {
                        onLeavePart(null, null);
                    }
                }}
            >
                {part ? (
                    <>
                        <ImageWithFallback
                            partName={part.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 transition-colors duration-200">
                            ✕
                        </div>
                        {levelDisplay && (
                            <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-xs py-0.5 whitespace-nowrap overflow-hidden text-ellipsis text-right px-1"
                                style={{ width: 'fit-content' }}
                            >
                                {levelDisplay}
                            </div>
                        )}
                    </>
                ) : (
                    <span className="text-2xl">+</span> // 空きスロットのアイコン
                )}
            </div>
        );
    };

    return (
        // ルート要素を flex-row にし、ボタンを absolute 配置するために relative を追加
        <div className="bg-gray-700 p-3 rounded-xl shadow-inner flex flex-row gap-2 relative">
            {/* パーツ表示エリア（縦に2行） */}
            <div className="flex flex-col gap-2">
                {/* 1行目のパーツ（4つ） */}
                <div className="flex flex-row gap-2 justify-start">
                    {allSlots.slice(0, 4).map((part, index) => renderSlot(part, index))}
                </div>

                {/* 2行目のパーツ（4つ） */}
                <div className="flex flex-row gap-2 justify-start">
                    {allSlots.slice(4, 8).map((part, index) => renderSlot(part, index + 4))}
                </div>
            </div>

            {/* 全パーツ解除ボタンを absolute 配置で右下に */}
            <div className="absolute bottom-3 right-3">
                <button
                    onClick={onClearAllParts}
                    // サイズ調整: h-32 は約128px (w-16のパーツ2つ分+gap分)
                    // w-16 はパーツ1つ分の幅
                    className="h-32 w-16 bg-red-600 hover:bg-red-700 rounded-lg text-white text-lg flex flex-col items-center justify-center transition-colors duration-200 whitespace-nowrap"
                    title="全てのカスタムパーツを解除"
                >
                    {/* "全 解 除" を一行ずつ表示するために span を分割 */}
                    <span>全</span>
                    <span>解</span>
                    <span>除</span>
                </button>
            </div>
        </div>
    );
};

export default SelectedPartDisplay;