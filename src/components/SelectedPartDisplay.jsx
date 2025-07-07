import React from 'react';
import ImageWithFallback from './ImageWithFallback';

const SelectedPartDisplay = ({ parts, onRemove, onClearAllParts, onHoverPart, onLeavePart }) => {
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
                className={`w-16 h-16 bg-gray-900 overflow-hidden relative flex-shrink-0
                            ${part ? 'border border-orange-400 cursor-pointer' : 'border border-gray-600 flex items-center justify-center text-gray-600'}`}
                onClick={() => part && onRemove(part)}
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
                        <div className="absolute top-0 right-0 bg-red-600 text-gray-200 w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 transition-colors duration-200">
                            ✕
                        </div>
                        {levelDisplay && (
                            <div className="absolute bottom-0 right-0 bg-gray-700 bg-opacity-60 text-gray-200 text-xs py-0.5 whitespace-nowrap overflow-hidden text-ellipsis text-right px-1"
                                style={{ width: 'fit-content' }}
                            >
                                {levelDisplay}
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
        <div className="pickedms-card p-3 flex flex-row gap-2 relative">
            {/* パーツ表示エリア */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2 justify-start">
                    {allSlots.slice(0, 4).map((part, index) => renderSlot(part, index))}
                </div>
                <div className="flex flex-row gap-2 justify-start">
                    {allSlots.slice(4, 8).map((part, index) => renderSlot(part, index + 4))}
                </div>
            </div>

            {/* シンプルな全解除ボタン */}
            <div className="absolute bottom-3 right-3">
<button
    onClick={onClearAllParts}
    className="relative h-32 w-16 p-0 border-none text-gray-200 text-4xl flex flex-col items-center justify-center group"
    title="全てのカスタムパーツを解除"
    style={{ background: 'none' }}
>
    <svg
        className="absolute inset-0"
        width="100%" height="100%" viewBox="0 0 64 256"
        style={{ zIndex: 0, pointerEvents: 'none' }}
        aria-hidden="true"
        preserveAspectRatio="none"
    >
        {/* 通常時の背景色（角欠け多角形） */}
        <polygon
            points="0,0 40,0 64,50 64,256 0,256"
            fill="#374151" // Tailwind bg-gray-700
            className="transition-colors duration-200"
        />
        {/* ホバー時の背景色（角欠け多角形） ←これを上に */}
        <polygon
            points="0,0 40,0 64,50 64,256 0,256"
            fill="#e53935" // Tailwind bg-orange-400
            opacity="0"
            className="group-hover:opacity-100 transition-opacity duration-200"
        />
        {/* 外枠（角欠け多角形） */}
        <polygon
            points="0,0 40,0 64,50 64,256 0,256"
            fill="none"
            stroke="#ff9100"
            strokeWidth="4"
            vectorEffect="non-scaling-stroke"
            className="transition-colors duration-200 group-hover:stroke-yellow-400"
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