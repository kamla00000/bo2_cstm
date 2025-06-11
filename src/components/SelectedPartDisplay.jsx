// src/components/SelectedPartDisplay.jsx
import React from 'react';
import ImageWithFallback from './ImageWithFallback';

const SelectedPartDisplay = ({ parts, onRemove, onClearAllParts, onHoverPart, onLeavePart }) => {
    const maxParts = 8;
    const emptySlots = Array(Math.max(0, maxParts - parts.length)).fill(null);

    return (
        <div className="bg-gray-700 p-3 rounded-xl shadow-inner max-h-24 overflow-hidden flex flex-row gap-2 relative">
            {parts.map(part => {
                const levelMatch = part.name.match(/_LV(\d+)$/);
                const levelDisplay = levelMatch ? `LV${levelMatch[1]}` : '';

                return (
                    <div
                        key={part.name}
                        className="w-16 h-16 bg-gray-500 rounded overflow-hidden relative cursor-pointer flex-shrink-0"
                        onClick={() => onRemove(part)}
                        title={`「${part.name}」を外す`}
                        onMouseEnter={() => {
                            if (onHoverPart) {
                                // ★★★ ここを修正: hoverSource として 'selectedParts' を渡す ★★★
                                onHoverPart(part, 'selectedParts');
                            }
                        }}
                        onMouseLeave={() => {
                            if (onLeavePart) {
                                // ★★★ ここを修正: hoverSource として null を渡す ★★★
                                onLeavePart(null, null); // PartCardが存在しないので引数は不要ですが、一貫性のためにnullを渡す
                            }
                        }}
                    >
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
                    </div>
                );
            })}
            {emptySlots.map((_, index) => (
                <div
                    key={`empty-${index}`}
                    className="w-16 h-16 bg-gray-800 rounded overflow-hidden flex items-center justify-center text-gray-600 flex-shrink-0"
                    title="空きスロット"
                >
                    <span className="text-2xl">+</span>
                </div>
            ))}

            <div className="absolute right-3 top-3 bottom-3 flex items-center">
                <button
                    onClick={onClearAllParts}
                    className="p-2 bg-gray-600 hover:bg-red-700 rounded-lg text-white text-xs flex flex-col items-center justify-center transition-colors duration-200"
                    title="全てのカスタムパーツを解除"
                >
                    <span role="img" aria-label="ゴミ箱" className="text-3xl">🗑️</span>
                    <span>全解除</span>
                </button>
            </div>
        </div>
    );
};

export default SelectedPartDisplay;