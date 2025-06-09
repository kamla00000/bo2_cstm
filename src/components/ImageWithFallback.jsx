// src/components/ImageWithFallback.jsx
import React, { useState } from 'react';

// 画像パスを生成する共通関数
const getBaseImagePath = (partName) => `/images/parts/${encodeURIComponent(partName)}`;
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'bmp']; // 試す拡張子の優先順位

const ImageWithFallback = ({ partName, className = "" }) => {
  const [currentExtIndex, setCurrentExtIndex] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false); // 画像が正常にロードされたかを示すフラグ

  const handleError = () => {
    const nextExtIndex = currentExtIndex + 1;
    if (nextExtIndex < IMAGE_EXTENSIONS.length) {
      setCurrentExtIndex(nextExtIndex);
    } else {
      // 全ての拡張子を試したがロードできなかった場合、default.jpgへ
      setCurrentExtIndex(IMAGE_EXTENSIONS.length); // すべて試したことを示す
    }
  };

  const handleLoad = () => {
    setHasLoaded(true); // 正常にロードされたらフラグを立てる
  };

  // 表示する画像パスを決定
  let src;
  if (currentExtIndex < IMAGE_EXTENSIONS.length) {
    const currentExt = IMAGE_EXTENSIONS[currentExtIndex];
    src = `${getBaseImagePath(partName)}.${currentExt}`;
  } else {
    // 全ての拡張子を試しても見つからなかった場合
    src = '/images/parts/default.jpg';
  }

  return (
    <img
      src={src}
      alt={partName}
      className={className} // 親から渡されたclassNameを適用
      onError={hasLoaded ? null : handleError} // 既にロード済みの場合はonErrorを無効化
      onLoad={handleLoad} // 正常ロード時にフラグを立てる
    />
  );
};

export default ImageWithFallback;