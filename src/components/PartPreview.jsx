import React, { useState, useEffect } from 'react';

// 画像パスを生成する関数
const getBaseImagePath = (partName) => `/images/parts/${encodeURIComponent(partName || '')}`;
const IMAGE_EXTENSIONS = ['webp'];

const ImageWithFallback = ({ partName, className }) => {
  const [currentExtIndex, setCurrentExtIndex] = useState(0);

  useEffect(() => {
    setCurrentExtIndex(0); // partNameが変わったら拡張子のインデックスをリセット
  }, [partName]);

  let src;
  if (currentExtIndex < IMAGE_EXTENSIONS.length) {
    src = `${getBaseImagePath(partName)}.webp`;
  } else {
    src = '/images/parts/default.webp';
  }

  const handleError = () => {
    setCurrentExtIndex((prev) => prev + 1); // 次の拡張子を試す
  };

  return (
    <img
      key={partName + '-' + currentExtIndex} // key を変更して再レンダリングをトリガー
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
      <div className="msrow-card-shape relative h-80 w-80 text-gray-200">
  <span className="absolute top-8 left-8 text-8xl [text-shadow:1px_1px_2px_black]">装</span>
  <span className="absolute top-8 right-8 text-8xl [text-shadow:1px_1px_2px_black]">備</span>
  <span className="absolute bottom-8 left-8 text-8xl [text-shadow:1px_1px_2px_black]">選</span>
  <span className="absolute bottom-8 right-8 text-8xl [text-shadow:1px_1px_2px_black]">択</span>
</div>
    );
  }

  return (
    <div className="msrow-card-shape p-2 h-80 min-w-[320px] max-w-[400px] w-full flex flex-col"> {/* 横幅を拡張スキル表示と揃える */}
      <style>{`
        .msrow-card-shape {
          background: rgba(0,0,0,0.5);
          border: none;
          box-shadow: none;
          border-radius: 0;
          clip-path: polygon(0 0, calc(100% - 32px) 0, 100% 32px, 100% 100%, 0 100%);
          transition: background 0.18s, box-shadow 0.18s, border-color 0.18s, transform 0.18s;
        }
      `}</style>

      {/* 画像とパーツ名、スロット情報を横並びにする新しいコンテナ */}
      <div className="flex flex-row items-end mb-2"> {/* items-start で上揃えに */}
        {/* 画像エリア */}
        <div className="w-20 h-20 mr-3 flex-shrink-0 flex items-center justify-center bg-gray-900"> {/* mr-3 で右にマージン */}
          <ImageWithFallback partName={part.name || part.名前} className="w-full h-full object-cover" />
        </div>

        {/* パーツ名とスロット情報エリア */}
        <div className="flex flex-col flex-grow"> {/* 残りのスペースを埋める */}
          <h3 className="text-base text-gray-200 mb-1">{part.name || part.名前}</h3> {/* text-sm から text-base に戻すか、任意で調整 */}
          <div className="flex flex-row gap-1 w-full justify-start text-xs"> {/* justify-start で左揃えに */}
            <div className="text-gray-200 text-sm bg-gray-700 px-2 py-1">
              <span className="font-semibold">近：</span>
              {part.close ?? part.近 ?? 0}
            </div>
            <div className="text-gray-200 text-sm bg-gray-700 px-2 py-1">
              <span className="font-semibold">中：</span>
              {part.mid ?? part.中 ?? 0}
            </div>
            <div className="text-gray-200 text-sm bg-gray-700 px-2 py-1">
              <span className="font-semibold">遠：</span>
              {part.long ?? part.遠 ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* 特性表示エリア (画像と情報のブロックの下に配置) */}
      <div className="text-gray-200 mb-2 break-words w-full flex-grow overflow-hidden">
        <span className="font-semibold">特性：</span>
        {part.description || part.説明 || '-'}
      </div>
    </div>
  );
};

export default PartPreview;