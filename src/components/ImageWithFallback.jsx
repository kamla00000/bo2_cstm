// src/components/ImageWithFallback.jsx
import React, { useState, useEffect } from 'react';

const getBaseImagePath = (partName) => `/images/parts/${encodeURIComponent(partName || '')}`;
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'bmp'];

const ImageWithFallback = ({ partName, level, className }) => {
    const [currentExtIndex, setCurrentExtIndex] = useState(0);

    useEffect(() => {
        setCurrentExtIndex(0);
    }, [partName]);

    let src;
    if (currentExtIndex < IMAGE_EXTENSIONS.length) {
        const currentExt = IMAGE_EXTENSIONS[currentExtIndex];
        src = `${getBaseImagePath(partName)}.${currentExt}`;
    } else {
        src = '/images/parts/default.webp';
    }

    const handleError = () => {
        setCurrentExtIndex((prev) => prev + 1);
    };

    return (
        <div className="relative w-full h-full">
            <img
                key={partName + '-' + currentExtIndex}
                src={src}
                alt={partName}
                className={`w-full h-full object-cover ${className || ''}`}
                onError={handleError}
            />
            {level !== undefined && level !== null && (
                <div className="absolute bottom-0 right-0 bg-gray-900 bg-opacity-75 text-gray-200 text-xs px-1 py-0.5 z-10 pointer-events-none">
                    LV{level}
                </div>
            )}
        </div>
    );
};

export default ImageWithFallback;