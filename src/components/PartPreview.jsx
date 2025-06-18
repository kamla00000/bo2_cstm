import React, { useState, useEffect } from 'react';

// 画像パスを生成する関数
const getBaseImagePath = (partName) => `/images/parts/${encodeURIComponent(partName || '')}`;
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'bmp'];

const ImageWithFallback = ({ partName, className }) => {
  const [currentExtIndex, setCurrentExtIndex] = useState(0);

  useEffect(() => {
    setCurrentExtIndex(0);
  }, [partName]);

  let src;
  if (currentExtIndex < IMAGE_EXTENSIONS.length) {
    const currentExt = IMAGE_EXTENSIONS[currentExtIndex];
    src = `${getBaseImagePath(partName)}.${currentExt}`;
  } else {
    src = '/images/parts/default.jpg';
  }

  const handleError = () => {
    setCurrentExtIndex((prev) => prev + 1);
  };

  return (
    <img
      key={partName + '-' + currentExtIndex}
      src={src}
      alt={partName}
      className={`w-full h-full object-cover ${className || ''}`}
      onError={handleError}
    />
  );
};

const PartPreview = ({ part }) => {
  if (!part) {
    return (
      <div className="flex items-center justify-center h-80 w-80 text-gray-400 bg-gray-800 shadow-md">
        装備選択
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 shadow-md h-80 w-80 overflow-y-hidden flex flex-col items-center">
      <div className="w-24 h-24 mb-2 flex items-center justify-center bg-gray-900">
        <ImageWithFallback partName={part.name || part.名前} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 text-center">{part.name || part.名前}</h3>
      <div className="flex flex-row gap-2 mb-2 w-full justify-center">
        <div className="text-gray-300 text-sm bg-gray-700 px-2 py-1">
          <span className="font-semibold">近：</span>
          {part.close ?? part.近 ?? 0}
        </div>
        <div className="text-gray-300 text-sm bg-gray-700 px-2 py-1">
          <span className="font-semibold">中：</span>
          {part.mid ?? part.中 ?? 0}
        </div>
        <div className="text-gray-300 text-sm bg-gray-700 px-2 py-1">
          <span className="font-semibold">遠：</span>
          {part.long ?? part.遠 ?? 0}
        </div>
      </div>
      <div className="text-gray-300 mb-2 break-words w-full">
        <span className="font-semibold">特性：</span>
        {part.description || part.説明 || '-'}
      </div>
    </div>
  );
};

export default PartPreview;