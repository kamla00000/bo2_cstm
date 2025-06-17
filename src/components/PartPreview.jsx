import React from 'react';

// 画像パスを生成する関数
const getBaseImagePath = (partName) => `/images/parts/${encodeURIComponent(partName)}`;
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'bmp'];

const ImageWithFallback = ({ partName, className }) => {
  const [currentExtIndex, setCurrentExtIndex] = React.useState(0);
  const [hasLoaded, setHasLoaded] = React.useState(false);

  const handleError = () => {
    const nextExtIndex = currentExtIndex + 1;
    if (nextExtIndex < IMAGE_EXTENSIONS.length) {
      setCurrentExtIndex(nextExtIndex);
    } else {
      setCurrentExtIndex(IMAGE_EXTENSIONS.length);
    }
  };

  const handleLoad = () => {
    setHasLoaded(true);
  };

  let src;
  if (currentExtIndex < IMAGE_EXTENSIONS.length) {
    const currentExt = IMAGE_EXTENSIONS[currentExtIndex];
    src = `${getBaseImagePath(partName)}.${currentExt}`;
  } else {
    src = '/images/parts/default.jpg';
  }

  return (
    <img
      src={src}
      alt={partName}
      className={className}
      onError={hasLoaded ? null : handleError}
      onLoad={handleLoad}
      draggable={false}
    />
  );
};

const PartPreview = ({ part }) => {
  if (!part) {
    return (
      <div className="flex items-center justify-center h-80 w-80 text-gray-400 bg-gray-800 rounded-lg shadow-md">
        装備選択
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md h-80 w-80 overflow-y-hidden flex flex-col items-center">
      <div className="w-24 h-24 mb-2 flex items-center justify-center bg-gray-900 rounded">
        <ImageWithFallback partName={part.name || part.名前} className="w-full h-full object-cover rounded" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 text-center">{part.name || part.名前}</h3>
      <div className="text-gray-300 mb-2 break-words w-full">
        <span className="font-semibold">説明: </span>
        {part.description || part.説明 || '-'}
      </div>
    </div>
  );
};

export default PartPreview;